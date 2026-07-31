/**
 * RxFlow Login View v4.0 — AppStart License Gate Edition
 * 
 * Flow:
 * 1. App launch → Check for valid license key in KeyStore
 * 2. No valid key → Show full-screen license key gate (AppStart style)
 * 3. Valid key → Show role selection cards
 * 4. User clicks role → Login/Register modal opens
 * 5. User logs in → Navigate to role dashboard
 * 
 * Ported from DEV TOOLS/appstart/appstart.js gate pattern.
 */

import { AuthStore } from '../engine/AuthStore';
import { type UserRole } from '../engine/Router';
import { NotificationEngine } from '../engine/NotificationEngine';
import { LicenseEngine, validateLicenseKey } from '../engine/LicenseEngine';

interface StakeholderCard {
  id: string;
  role: UserRole;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  wide: boolean;
}

const STAKEHOLDERS: StakeholderCard[] = [
  {
    id: 'role-retailer',
    role: 'retailer',
    icon: '🛍️',
    title: 'Retailer / Chemist',
    subtitle: 'Medical Store Owner',
    description: 'Search catalogue, place orders, track deliveries, manage stock & pay via UPI',
    color: 'bg-blue',
    wide: true,
  },
  {
    id: 'role-distributor',
    role: 'distributor',
    icon: '🚚',
    title: 'Distributor / Stockist',
    subtitle: 'Wholesaler / C&F Agent',
    description: 'Process orders, FEFO inventory, credit control, TallyPrime ERP sync',
    color: 'bg-teal',
    wide: true,
  },
  {
    id: 'role-manufacturer',
    role: 'manufacturer',
    icon: '🏭',
    title: 'Manufacturer',
    subtitle: 'Pharma Company',
    description: 'Master catalogue, analytics & sponsored promotions',
    color: 'bg-darkblue',
    wide: false,
  },
  {
    id: 'role-sales',
    role: 'sales_rep',
    icon: '👨‍💼',
    title: 'Sales Rep / MR',
    subtitle: 'Medical Representative',
    description: 'Beat plan, field collection & retailer visits',
    color: 'bg-cyan',
    wide: false,
  },
  {
    id: 'role-admin',
    role: 'platform_admin',
    icon: '👑',
    title: 'Platform Admin',
    subtitle: 'RxFlow Governance',
    description: 'Drug license verification, disputes & compliance',
    color: 'bg-purple',
    wide: false,
  },
];

// Track which role the user selected for the login/register modal
let selectedRole: UserRole | null = null;

export default function LoginView(container: HTMLElement): void {
  // Hide the app header & nav on login screen
  const header = document.getElementById('app-header');
  const nav = document.getElementById('app-nav');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';

  // Check if license is already valid
  LicenseEngine.init().then((saved) => {
    if (saved.ok) {
      renderRoleSelection(container);
    } else {
      renderLicenseGate(container);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  SCREEN 1: LICENSE KEY GATE (AppStart-style full overlay)
// ═══════════════════════════════════════════════════════════════

function renderLicenseGate(container: HTMLElement, prefillKey: string = '', errorMsg: string = ''): void {
  container.innerHTML = `
    <div class="as-gate-overlay">
      <div class="as-gate-card">
        <!-- Logo -->
        <div class="as-gate-logo">
          <span class="as-gate-pill">💊</span>
          <div class="as-gate-appname">Rx<strong>Flow</strong></div>
          <div class="as-gate-tagline">ENTER LICENSE KEY</div>
        </div>

        <!-- License Input Panel -->
        <div class="as-gate-panel">
          <div class="as-gate-input-label">10-DIGIT LICENSE KEY</div>
          <input 
            type="text" 
            id="as-key-input" 
            class="as-gate-input"
            maxlength="10" 
            autocomplete="off" 
            spellcheck="false"
            placeholder="XXXXXXXXXX"
            value="${prefillKey}"
          >
          <div class="as-gate-error" id="as-err-msg">${errorMsg}</div>
          <button class="as-gate-btn" id="as-key-btn">
            <span id="as-btn-text">Activate</span>
            <span id="as-btn-spinner" class="as-gate-spinner" style="display:none;"></span>
          </button>
        </div>

        <!-- Footer -->
        <div class="as-gate-footer">
          v3.0 • RxFlow Pharma B2B Hub<br>
          Powered by VibeMantra Studio
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#as-key-input') as HTMLInputElement;
  const btn = container.querySelector('#as-key-btn') as HTMLButtonElement;
  const errMsg = container.querySelector('#as-err-msg') as HTMLElement;
  const btnText = container.querySelector('#as-btn-text') as HTMLElement;
  const btnSpinner = container.querySelector('#as-btn-spinner') as HTMLElement;

  const handleActivate = async () => {
    const key = input.value.trim();

    // Clear previous error
    errMsg.textContent = '';
    input.classList.remove('as-gate-input--error');

    if (!key || key.length !== 10) {
      input.classList.add('as-gate-input--error');
      errMsg.textContent = '⛔ Key must be exactly 10 characters.';
      return;
    }

    // Show loading state
    btn.disabled = true;
    btnText.textContent = 'Validating...';
    btnSpinner.style.display = 'inline-block';

    // Step 1: Local Base72 validation (checksum + expiry)
    const localResult = validateLicenseKey(key);
    if (!localResult.ok) {
      btn.disabled = false;
      btnText.textContent = 'Activate';
      btnSpinner.style.display = 'none';

      input.classList.add('as-gate-input--error');
      if (localResult.reason === 'expired') {
        errMsg.textContent = `⛔ License expired on ${localResult.expiryDate?.toLocaleDateString('en-IN')} (${localResult.entityName})`;
      } else {
        errMsg.textContent = '⛔ Invalid license key. Please check and try again.';
      }
      return;
    }

    // Step 2: Remote Google Sheet validation
    const remoteResult = await LicenseEngine.validateRemote(key);

    btn.disabled = false;
    btnText.textContent = 'Activate';
    btnSpinner.style.display = 'none';

    if (!remoteResult.ok) {
      // If network error, allow local-only validation (offline support)
      if (remoteResult.reason === 'network_error') {
        // Save locally and proceed with local validation
        await LicenseEngine.activateLicense(key);
        NotificationEngine.showToast(
          `🔑 License verified locally for "${localResult.entityName}" (offline mode)`,
          'success'
        );
        renderRoleSelection(container);
        return;
      }

      input.classList.add('as-gate-input--error');
      errMsg.textContent = `⛔ ${remoteResult.message || 'Key not found in registry.'}`;
      return;
    }

    // Both validations passed — save & proceed!
    await LicenseEngine.activateLicense(key);
    NotificationEngine.showToast(
      `🔑 License activated for "${localResult.entityName}" — Welcome to RxFlow!`,
      'success'
    );
    renderRoleSelection(container);
  };

  btn.addEventListener('click', handleActivate);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleActivate();
  });

  // Auto-focus input
  setTimeout(() => input?.focus(), 150);
}


// ═══════════════════════════════════════════════════════════════
//  SCREEN 2: ROLE SELECTION (shown after valid license key)
// ═══════════════════════════════════════════════════════════════

function renderRoleSelection(container: HTMLElement): void {
  // Get active license info for badge display
  const activeLic = LicenseEngine.getActiveLicense();
  const entityName = activeLic.validation.entityName || 'RxFlow';
  const daysLeft = activeLic.validation.daysLeft ?? 0;
  const expiryStr = activeLic.validation.expiryDate?.toLocaleDateString('en-IN') || '';
  const daysWarning = daysLeft <= 30 ? ` · ⚠ ${daysLeft}d left` : ` · ${expiryStr}`;

  container.innerHTML = `
    <div class="login-gateway">
      <!-- Hero Section -->
      <div class="login-hero">
        <div class="login-hero__logo">
          <span class="login-hero__icon">💊</span>
          <div class="metro-title" style="font-size:42px;letter-spacing:-1px;">Rx<strong>Flow</strong></div>
        </div>
        <div class="login-hero__tagline">Pharma B2B Ordering • Inventory • Collections</div>
        
        <!-- License Badge -->
        <div class="as-license-badge">
          <span class="as-license-badge__dot"></span>
          <span>${entityName}${daysWarning}</span>
          <button class="as-license-badge__change" id="change-license-btn" title="Change License Key">✕</button>
        </div>
      </div>

      <!-- Stakeholder Question -->
      <div class="login-question">
        <div class="login-question__title">Please Login..!</div>
        <div class="login-question__sub">Select your stakeholder role to continue</div>
      </div>

      <!-- Stakeholder Selection Grid -->
      <div class="login-grid">
        ${STAKEHOLDERS.map(s => `
          <div class="login-card ${s.wide ? 'login-card--wide' : ''} ${s.color}" id="${s.id}" tabindex="0">
            <div class="login-card__icon">${s.icon}</div>
            <div class="login-card__body">
              <div class="login-card__title">${s.title}</div>
              <div class="login-card__subtitle">${s.subtitle}</div>
              <div class="login-card__desc">${s.description}</div>
            </div>
            <div class="login-card__arrow">→</div>
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <div class="login-footer__version">v3.0 • 100% Free Stack • PowerSync Offline-First</div>
        <div class="login-footer__links">
          <span>🔒 End-to-End Encrypted</span>
          <span>•</span>
          <span>DPCO / FDA Compliant</span>
          <span>•</span>
          <span>₹0 Monthly Cost</span>
        </div>
      </div>
    </div>

    <!-- Login/Register Modal (hidden by default) -->
    <div class="auth-modal-overlay" id="auth-modal-overlay" style="display:none;">
      <div class="auth-modal">
        <button class="auth-modal__close" id="auth-modal-close">✕</button>
        
        <!-- Modal Header -->
        <div class="auth-modal__header">
          <span class="auth-modal__role-icon" id="auth-modal-icon"></span>
          <div class="auth-modal__role-title" id="auth-modal-title"></div>
        </div>

        <!-- Tab Switcher -->
        <div class="auth-modal__tabs">
          <button class="auth-modal__tab auth-modal__tab--active" id="tab-login">Login</button>
          <button class="auth-modal__tab" id="tab-register">Register</button>
        </div>

        <!-- Login Form -->
        <div class="auth-modal__form" id="form-login">
          <div class="auth-modal__field">
            <label class="auth-modal__label">Email / Phone</label>
            <input type="text" class="auth-modal__input" id="login-email" placeholder="email@example.com" autocomplete="email">
          </div>
          <div class="auth-modal__field">
            <label class="auth-modal__label">PIN / Password</label>
            <input type="password" class="auth-modal__input" id="login-pin" placeholder="Enter your PIN" autocomplete="current-password">
          </div>
          <button class="auth-modal__submit" id="login-submit-btn">Login</button>
        </div>

        <!-- Register Form -->
        <div class="auth-modal__form" id="form-register" style="display:none;">
          <div class="auth-modal__field">
            <label class="auth-modal__label">Full Name</label>
            <input type="text" class="auth-modal__input" id="reg-name" placeholder="Your full name" autocomplete="name">
          </div>
          <div class="auth-modal__field">
            <label class="auth-modal__label">Email</label>
            <input type="email" class="auth-modal__input" id="reg-email" placeholder="email@example.com" autocomplete="email">
          </div>
          <div class="auth-modal__field">
            <label class="auth-modal__label">Phone</label>
            <input type="tel" class="auth-modal__input" id="reg-phone" placeholder="+91 98220 12345" autocomplete="tel">
          </div>
          <div class="auth-modal__field">
            <label class="auth-modal__label">City</label>
            <input type="text" class="auth-modal__input" id="reg-city" placeholder="Mumbai" autocomplete="address-level2">
          </div>
          <div class="auth-modal__field">
            <label class="auth-modal__label">PIN / Password</label>
            <input type="password" class="auth-modal__input" id="reg-pin" placeholder="Create a PIN" autocomplete="new-password">
          </div>
          <div class="auth-modal__field">
            <label class="auth-modal__label">Confirm PIN</label>
            <input type="password" class="auth-modal__input" id="reg-pin-confirm" placeholder="Confirm your PIN" autocomplete="new-password">
          </div>
          <button class="auth-modal__submit" id="register-submit-btn">Register</button>
        </div>
      </div>
    </div>
  `;

  // ---------- Event Handlers ----------

  // Change License Key button
  container.querySelector('#change-license-btn')?.addEventListener('click', async () => {
    await LicenseEngine.clearLicense();
    renderLicenseGate(container);
  });

  // Role card click → open login/register modal
  STAKEHOLDERS.forEach(s => {
    const el = container.querySelector(`#${s.id}`) as HTMLElement;
    if (!el) return;

    el.addEventListener('click', () => {
      selectedRole = s.role;
      openAuthModal(container, s);
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // Tab switching
  const tabLogin = container.querySelector('#tab-login') as HTMLElement;
  const tabRegister = container.querySelector('#tab-register') as HTMLElement;
  const formLogin = container.querySelector('#form-login') as HTMLElement;
  const formRegister = container.querySelector('#form-register') as HTMLElement;

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('auth-modal__tab--active');
    tabRegister.classList.remove('auth-modal__tab--active');
    formLogin.style.display = 'flex';
    formRegister.style.display = 'none';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('auth-modal__tab--active');
    tabLogin.classList.remove('auth-modal__tab--active');
    formRegister.style.display = 'flex';
    formLogin.style.display = 'none';
  });

  // Close modal
  const overlay = container.querySelector('#auth-modal-overlay') as HTMLElement;
  const closeBtn = container.querySelector('#auth-modal-close') as HTMLElement;

  closeBtn?.addEventListener('click', () => {
    overlay.style.display = 'none';
    selectedRole = null;
  });

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      selectedRole = null;
    }
  });

  // Login submit
  container.querySelector('#login-submit-btn')?.addEventListener('click', async () => {
    if (!selectedRole) return;

    const emailInput = container.querySelector('#login-email') as HTMLInputElement;
    const email = emailInput?.value?.trim() || 'demo@rxflow.in';

    const header = document.getElementById('app-header');
    const nav = document.getElementById('app-nav');

    const success = await AuthStore.login(email, selectedRole);
    if (success) {
      if (header) header.style.display = '';
      if (nav) nav.style.display = '';
      overlay.style.display = 'none';
      NotificationEngine.showToast(`Welcome! Logged in as ${selectedRole}`, 'success');
    } else {
      NotificationEngine.showToast('Login failed. Please try again.', 'error');
    }
  });

  // Register submit (demo — stores locally for now)
  container.querySelector('#register-submit-btn')?.addEventListener('click', async () => {
    if (!selectedRole) return;

    const nameInput = container.querySelector('#reg-name') as HTMLInputElement;
    const emailInput = container.querySelector('#reg-email') as HTMLInputElement;
    const pinInput = container.querySelector('#reg-pin') as HTMLInputElement;
    const pinConfirm = container.querySelector('#reg-pin-confirm') as HTMLInputElement;

    const name = nameInput?.value?.trim();
    const email = emailInput?.value?.trim();

    if (!name || !email) {
      NotificationEngine.showToast('Please fill in Full Name and Email', 'warning');
      return;
    }

    if (pinInput?.value !== pinConfirm?.value) {
      NotificationEngine.showToast('PINs do not match', 'error');
      return;
    }

    const header = document.getElementById('app-header');
    const nav = document.getElementById('app-nav');

    // Demo registration → auto-login
    const success = await AuthStore.login(email, selectedRole);
    if (success) {
      if (header) header.style.display = '';
      if (nav) nav.style.display = '';
      overlay.style.display = 'none';
      NotificationEngine.showToast(`Registered & logged in as ${selectedRole}!`, 'success');
    } else {
      NotificationEngine.showToast('Registration failed. Please try again.', 'error');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  LOGIN/REGISTER MODAL
// ═══════════════════════════════════════════════════════════════

function openAuthModal(container: HTMLElement, stakeholder: StakeholderCard): void {
  const overlay = container.querySelector('#auth-modal-overlay') as HTMLElement;
  const icon = container.querySelector('#auth-modal-icon') as HTMLElement;
  const title = container.querySelector('#auth-modal-title') as HTMLElement;

  if (icon) icon.textContent = stakeholder.icon;
  if (title) title.textContent = stakeholder.title;

  // Reset to login tab
  const tabLogin = container.querySelector('#tab-login') as HTMLElement;
  const tabRegister = container.querySelector('#tab-register') as HTMLElement;
  const formLogin = container.querySelector('#form-login') as HTMLElement;
  const formRegister = container.querySelector('#form-register') as HTMLElement;

  tabLogin?.classList.add('auth-modal__tab--active');
  tabRegister?.classList.remove('auth-modal__tab--active');
  if (formLogin) formLogin.style.display = 'flex';
  if (formRegister) formRegister.style.display = 'none';

  // Clear previous form inputs
  container.querySelectorAll('.auth-modal__input').forEach((input) => {
    (input as HTMLInputElement).value = '';
  });

  // Show modal with animation
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.offsetHeight; // Force reflow for animation
    overlay.classList.add('auth-modal-overlay--visible');
  }

  // Focus first input
  setTimeout(() => {
    (container.querySelector('#login-email') as HTMLInputElement)?.focus();
  }, 200);
}
