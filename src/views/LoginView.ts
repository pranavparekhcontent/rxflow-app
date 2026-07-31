/**
 * RxFlow Login View v4.2 — Smart AppStart Engine Integration
 * 
 * Flow:
 * 1. License Key Check:
 *    - If EXPIRED -> AppStart Lock Screen ("🔒 License Expired")
 *    - If UNVERIFIED / MISSING -> AppStart License Verification Gate (Google Sheet lookup)
 * 2. Once License Verified -> Smart Field Scanner fetches Client Name, Role & PIN from Google Sheet
 * 3. App Locks to Ask for PIN -> Displays "👋 Welcome, [Client Name]! Enter PIN"
 * 4. User enters correct PIN -> App unlocks and jumps to role home dashboard!
 */

import { AuthStore } from '../engine/AuthStore';
import { type UserRole } from '../engine/Router';
import { NotificationEngine } from '../engine/NotificationEngine';
import { LicenseEngine, validateLicenseKey, type GSheetClientRow } from '../engine/LicenseEngine';

export default function LoginView(container: HTMLElement): void {
  // Hide top app header & nav on login/gate screens
  const header = document.getElementById('app-header');
  const nav = document.getElementById('app-nav');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';

  // Check saved license state
  LicenseEngine.init().then((saved) => {
    if (!saved.ok) {
      if (saved.reason === 'expired') {
        renderLockScreen(container, saved.entityName || 'RxFlow Client', saved.expiryDate);
      } else {
        renderLicenseGate(container);
      }
    } else {
      // License is verified — render PIN Lock Screen ("Welcome while asking PIN")
      const clientRow = LicenseEngine.getActiveClientRow();
      renderPinLockScreen(container, clientRow);
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
        <!-- Logo Area -->
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

    errMsg.textContent = '';
    input.classList.remove('as-gate-input--error');

    if (!key || key.length !== 10) {
      input.classList.add('as-gate-input--error');
      errMsg.textContent = '⛔ Key must be exactly 10 characters.';
      return;
    }

    // Show spinner
    btn.disabled = true;
    btnText.textContent = 'Scanning Google Sheet...';
    btnSpinner.style.display = 'inline-block';

    // Step 1: Local Base72 validation (checksum + expiry check)
    const localResult = validateLicenseKey(key);
    if (!localResult.ok) {
      btn.disabled = false;
      btnText.textContent = 'Activate';
      btnSpinner.style.display = 'none';

      if (localResult.reason === 'expired') {
        renderLockScreen(container, localResult.entityName || 'RxFlow Client', localResult.expiryDate);
        return;
      }

      input.classList.add('as-gate-input--error');
      errMsg.textContent = '⛔ Invalid license key signature / corrupted key.';
      return;
    }

    // Step 2: Remote Google Sheet Smart Field Scanner
    const remoteResult = await LicenseEngine.validateRemote(key);

    btn.disabled = false;
    btnText.textContent = 'Activate';
    btnSpinner.style.display = 'none';

    if (!remoteResult.ok) {
      if (remoteResult.reason === 'expired') {
        renderLockScreen(container, localResult.entityName || 'RxFlow Client', localResult.expiryDate);
        return;
      }

      if (remoteResult.reason === 'network_error') {
        // Offline fallback
        NotificationEngine.showToast(`🔑 Verified key locally for "${localResult.entityName}" (offline mode)`, 'warning');
        renderPinLockScreen(container, null);
        return;
      }

      input.classList.add('as-gate-input--error');
      errMsg.textContent = `⛔ ${remoteResult.message || 'License key not found in Google Sheet registry.'}`;
      return;
    }

    // License verified & client data fetched! Proceed to PIN Lock Screen
    NotificationEngine.showToast(`🔑 Verified license key for "${remoteResult.clientRow?.clientName}" ✓`, 'success');
    renderPinLockScreen(container, remoteResult.clientRow || null);
  };

  btn.addEventListener('click', handleActivate);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleActivate();
  });

  setTimeout(() => input?.focus(), 150);
}

// ═══════════════════════════════════════════════════════════════
//  SCREEN 2: LOCK SCREEN (for Expired Keys)
// ═══════════════════════════════════════════════════════════════

function renderLockScreen(container: HTMLElement, clientName: string, expiryDate?: Date): void {
  const expStr = expiryDate ? expiryDate.toLocaleDateString('en-IN') : 'Expired';

  container.innerHTML = `
    <div class="as-gate-overlay">
      <div class="as-gate-card">
        <div class="as-lock-screen">
          <div class="as-lock-icon">🔒</div>
          <div class="as-lock-title">License Expired</div>
          <div class="as-lock-college">${clientName}</div>
          <div class="as-lock-sub">
            Your license expired on <strong>${expStr}</strong>.<br>
            Please contact your administrator to renew.
          </div>
          <button class="as-gate-btn as-retry-btn" id="lock-retry-btn" style="background:#DC2626;max-width:220px;margin-top:12px;">
            Try Another Key
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#lock-retry-btn')?.addEventListener('click', async () => {
    await LicenseEngine.clearLicense();
    renderLicenseGate(container);
  });
}

// ═══════════════════════════════════════════════════════════════
//  SCREEN 3: PIN LOCK SCREEN ("Welcome while asking PIN")
// ═══════════════════════════════════════════════════════════════

function renderPinLockScreen(container: HTMLElement, clientRow: GSheetClientRow | null): void {
  const activeLic = LicenseEngine.getActiveLicense();
  const name = clientRow?.clientName || activeLic.validation.entityName || 'DEMO CLIENT';
  const role = clientRow?.role || 'retailer';
  const rawRole = clientRow?.rawRole || role.toUpperCase();
  const sheetPin = clientRow?.pin || '';

  container.innerHTML = `
    <div class="as-gate-overlay">
      <div class="as-gate-card" style="width:min(440px, 92vw);">
        <!-- Welcome Header -->
        <div class="as-gate-logo" style="gap:4px;">
          <span style="font-size:2.8rem;">👋</span>
          <div class="as-gate-appname" style="font-size:1.8rem;text-align:center;">
            Welcome, <strong>${name}</strong>
          </div>
          <div style="font-size:0.75rem;color:#00B7C3;font-weight:600;letter-spacing:0.05em;margin-top:2px;">
            ${rawRole.toUpperCase()} · LICENSE VERIFIED ✓
          </div>
        </div>

        <!-- PIN Input Panel -->
        <div class="as-gate-panel" style="margin-top:8px;">
          <div class="as-gate-input-label" style="text-align:center;">ENTER SECURITY PIN TO UNLOCK</div>
          <input 
            type="password" 
            id="pin-input" 
            class="as-gate-input"
            maxlength="8" 
            autocomplete="current-password"
            placeholder="••••"
            style="letter-spacing:0.4em;font-size:1.5rem;text-align:center;"
          >
          <div class="as-gate-error" id="pin-err-msg"></div>
          
          <button class="as-gate-btn" id="pin-submit-btn">
            <span>Unlock App & Continue →</span>
          </button>
        </div>

        <!-- Change Key Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;font-size:0.7rem;color:#666;border-top:1px dashed #222;padding-top:12px;margin-top:4px;">
          <span>License: ${activeLic.key || 'Active'}</span>
          <button id="change-key-btn" style="background:none;border:none;color:#0078D7;font-size:0.7rem;font-weight:600;cursor:pointer;">
            ✕ Change License Key
          </button>
        </div>
      </div>
    </div>
  `;

  const pinInput = container.querySelector('#pin-input') as HTMLInputElement;
  const pinBtn = container.querySelector('#pin-submit-btn') as HTMLButtonElement;
  const pinErr = container.querySelector('#pin-err-msg') as HTMLElement;
  const changeBtn = container.querySelector('#change-key-btn') as HTMLButtonElement;

  changeBtn?.addEventListener('click', async () => {
    await LicenseEngine.clearLicense();
    renderLicenseGate(container);
  });

  const handleUnlock = async () => {
    const enteredPin = pinInput.value.trim();

    pinErr.textContent = '';
    pinInput.classList.remove('as-gate-input--error');

    // If PIN is set in Google Sheet, verify match. If blank in sheet, accept any entered PIN or 1234
    if (sheetPin && sheetPin.length > 0) {
      if (enteredPin !== sheetPin) {
        pinInput.classList.add('as-gate-input--error');
        pinErr.textContent = '❌ Incorrect PIN. Please enter your valid PIN from Google Sheet.';
        return;
      }
    } else {
      if (!enteredPin) {
        pinInput.classList.add('as-gate-input--error');
        pinErr.textContent = 'Please enter a PIN to continue.';
        return;
      }
    }

    // Authenticate user with role & client name from Google Sheet
    const email = clientRow?.email || `demo_${role}@rxflow.in`;
    const success = await AuthStore.login(email, role);

    if (success) {
      // Update name in state
      if (AuthStore.getState().user) {
        AuthStore.getState().user!.fullName = name;
      }

      // Show header & nav
      const header = document.getElementById('app-header');
      const nav = document.getElementById('app-nav');
      if (header) header.style.display = '';
      if (nav) nav.style.display = '';

      NotificationEngine.showToast(`Unlocked App! Welcome ${name}`, 'success');

      // Navigate straight to role home dashboard
      const targetRoute = `#/${role === 'sales_rep' ? 'sales' : role === 'platform_admin' ? 'admin' : role}/home`;
      window.location.hash = targetRoute;
    } else {
      pinErr.textContent = 'Login failed. Please try again.';
    }
  };

  pinBtn?.addEventListener('click', handleUnlock);
  pinInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUnlock();
  });

  setTimeout(() => pinInput?.focus(), 150);
}
