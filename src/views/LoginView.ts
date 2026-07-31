/**
 * RxFlow Login View v3.0
 * Stakeholder role selection & authentication gateway.
 * This is the first screen every user sees — pick who you are.
 */

import { AuthStore } from '../engine/AuthStore';
import { type UserRole } from '../engine/Router';
import { NotificationEngine } from '../engine/NotificationEngine';
import { LicenseEngine } from '../engine/LicenseEngine';

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

export default function LoginView(container: HTMLElement): void {
  // Hide the app header & nav on login screen
  const header = document.getElementById('app-header');
  const nav = document.getElementById('app-nav');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';

  container.innerHTML = `
    <div class="login-gateway">
      <!-- Hero Section -->
      <div class="login-hero">
        <div class="login-hero__logo">
          <span class="login-hero__icon">💊</span>
          <div class="metro-title" style="font-size:42px;letter-spacing:-1px;">Rx<strong>Flow</strong></div>
        </div>
        <div class="login-hero__tagline">Pharma B2B Ordering • Inventory • Collections</div>
        <div class="login-hero__region">
          <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(255,255,255,0.06);padding:4px 12px;border-radius:20px;font-size:11px;color:var(--text-secondary);">
            📍 Maharashtra, India • Offline-First PWA
          </span>
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

      <!-- 10-Digit License Key Activation -->
      <div style="width:100%;max-width:600px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-top:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div style="font-size:13px;font-weight:700;color:white;display:flex;align-items:center;gap:6px;">
            <span>🔑 10-Digit License Key Verification</span>
            <span id="lic-status-badge" style="font-size:10px;padding:2px 8px;border-radius:12px;background:#333;color:#aaa;">UNVERIFIED</span>
          </div>
          <button id="demo-lic-btn" style="background:none;border:none;color:#00B7C3;font-size:11px;font-weight:600;cursor:pointer;">Generate Demo Key</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <input type="text" id="lic-key-input" placeholder="Paste 10-digit key (e.g. RAJESH M...)" maxlength="10" 
                 style="flex:1;background:#222;border:1px solid #444;color:white;padding:8px 12px;border-radius:6px;font-size:13px;letter-spacing:1px;font-family:monospace;">
          <button id="apply-lic-btn" style="background:#0078D7;color:white;border:none;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">Verify & Save</button>
        </div>
        <div id="lic-info-output" style="font-size:11px;color:#aaa;line-height:1.4;">
          Keys encoded via 72-char alphabet (Checksummed name + expiry). Auto-saved to Cookie + IDB + LocalStorage.
        </div>
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
  `;

  // Attach click handlers to each stakeholder card
  STAKEHOLDERS.forEach(s => {
    const el = document.getElementById(s.id);
    if (!el) return;

    el.addEventListener('click', async () => {
      // Visual feedback
      el.classList.add('login-card--selected');
      el.innerHTML += '<div class="login-card__loading"><div class="login-spinner"></div></div>';

      // Perform login
      const email = 'demo@rxflow.in';
      const success = await AuthStore.login(email, s.role);

      if (success) {
        // Show header & nav after login
        if (header) header.style.display = '';
        if (nav) nav.style.display = '';
        NotificationEngine.showToast(`Welcome! Logged in as ${s.title}`, 'success');
      } else {
        el.classList.remove('login-card--selected');
        NotificationEngine.showToast('Login failed. Please try again.', 'error');
      }
    });

    // Keyboard accessibility
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // ---------- License Key Verification Logic ----------

  const licInput = container.querySelector('#lic-key-input') as HTMLInputElement;
  const applyBtn = container.querySelector('#apply-lic-btn') as HTMLButtonElement;
  const demoBtn = container.querySelector('#demo-lic-btn') as HTMLButtonElement;
  const badge = container.querySelector('#lic-status-badge') as HTMLElement;
  const output = container.querySelector('#lic-info-output') as HTMLElement;

  const updateLicUI = async (key?: string) => {
    const checkKey = key || licInput?.value || '';
    if (checkKey.trim().length === 10) {
      const res = await LicenseEngine.activateLicense(checkKey.trim());
      if (res.ok) {
        if (badge) {
          badge.textContent = 'VERIFIED ✓';
          badge.style.background = '#107C41';
          badge.style.color = 'white';
        }
        if (output) {
          output.innerHTML = `
            <div style="color:#00FF66;font-weight:600;">
              ✓ License Verified for "<strong>${res.entityName}</strong>" — Expires ${res.expiryDate?.toLocaleDateString('en-IN')} (${res.daysLeft} days left)
            </div>
            <div style="color:#888;font-size:10px;margin-top:2px;">Saved to Cookie + IndexedDB + LocalStorage ( survives cache clearing )</div>
          `;
        }
      } else {
        if (badge) {
          badge.textContent = res.reason?.toUpperCase() || 'INVALID';
          badge.style.background = '#DC2626';
          badge.style.color = 'white';
        }
        if (output) {
          output.innerHTML = `<span style="color:#FF6666;">❌ ${res.message}</span>`;
        }
      }
    }
  };

  // Check saved license on load
  LicenseEngine.init().then((saved) => {
    if (saved.ok && licInput) {
      const active = LicenseEngine.getActiveLicense();
      if (active.key) {
        licInput.value = active.key;
        updateLicUI(active.key);
      }
    }
  });

  applyBtn?.addEventListener('click', () => {
    const key = licInput?.value?.trim();
    if (!key || key.length !== 10) {
      NotificationEngine.showToast('Please enter a 10-character license key', 'warning');
      return;
    }
    updateLicUI(key);
  });

  demoBtn?.addEventListener('click', () => {
    const demoKey = LicenseEngine.generateDemoKey('RXFLOW');
    if (licInput) licInput.value = demoKey;
    updateLicUI(demoKey);
    NotificationEngine.showToast(`Generated & Applied 10-Digit Demo License Key: [${demoKey}]`, 'success');
  });
}
