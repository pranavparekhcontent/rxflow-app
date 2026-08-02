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
import { LicenseEngine, validateLicenseKey, cleanEntityName, type GSheetClientRow } from '../engine/LicenseEngine';

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
        <div class="as-gate-logo" style="display:flex; flex-direction:column; align-items:center; gap:8px;">
          <img src="/rxflow-logo.png" alt="RxFlow Logo" style="height:90px; width:auto; object-fit:contain; filter:drop-shadow(0 6px 20px rgba(0,120,215,0.6));" />
          <div class="as-gate-tagline" style="letter-spacing:1.5px; font-weight:800; color:var(--tile-cyan);">ENTER LICENSE KEY</div>
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
  const rawName = clientRow?.clientName || activeLic.validation.entityName || 'DEMO R';
  const name = cleanEntityName(rawName);
  const role = clientRow?.role || 'retailer';
  const rawRole = clientRow?.rawRole || role.toUpperCase();
  const sheetPin = clientRow?.pin || '';

  container.innerHTML = `
    <div class="as-gate-overlay">
      <div class="as-gate-card" style="width:min(440px, 92vw);">
        <!-- Welcome Header -->
        <div class="as-gate-logo" style="display:flex; flex-direction:column; align-items:center; gap:4px;">
          <img src="/rxflow-logo.png" alt="RxFlow Logo" style="height:72px; width:auto; object-fit:contain; filter:drop-shadow(0 4px 14px rgba(0,120,215,0.5)); margin-bottom:4px;" />
          <div class="as-gate-appname" style="font-size:1.6rem;text-align:center;">
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

        <!-- Change Key & Change PIN Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;font-size:0.7rem;color:#666;border-top:1px dashed #222;padding-top:12px;margin-top:4px;">
          <button id="open-change-pin-btn" style="background:none;border:none;color:#00B7C3;font-size:0.72rem;font-weight:700;cursor:pointer;">
            🔑 Change PIN
          </button>
          <button id="change-key-btn" style="background:none;border:none;color:#0078D7;font-size:0.72rem;font-weight:600;cursor:pointer;">
            ✕ Change License Key
          </button>
        </div>

        <!-- Inline PIN Change Modal Container -->
        <div id="change-pin-panel" style="display:none;margin-top:12px;background:#080A10;border:1px solid #1E2235;border-radius:12px;padding:16px;text-align:left;">
          <div style="font-size:0.8rem;font-weight:700;color:#00B7C3;margin-bottom:8px;">🔑 Change Security PIN</div>
          <div class="as-gate-input-label" style="margin-top:6px;">CURRENT PIN</div>
          <input type="password" id="cp-current-pin" class="as-gate-input" maxlength="8" placeholder="Current PIN" style="font-size:1rem;padding:8px 12px;margin-bottom:8px;">
          
          <div class="as-gate-input-label">NEW PIN (4-8 Digits)</div>
          <input type="password" id="cp-new-pin" class="as-gate-input" maxlength="8" placeholder="New PIN" style="font-size:1rem;padding:8px 12px;margin-bottom:8px;">
          
          <div class="as-gate-input-label">CONFIRM NEW PIN</div>
          <input type="password" id="cp-confirm-pin" class="as-gate-input" maxlength="8" placeholder="Confirm New PIN" style="font-size:1rem;padding:8px 12px;margin-bottom:8px;">
          
          <div id="cp-err-msg" class="as-gate-error" style="margin-bottom:8px;"></div>

          <div style="display:flex;gap:8px;">
            <button id="cp-submit-btn" class="as-gate-btn" style="padding:8px 12px;font-size:0.8rem;background:linear-gradient(135deg,#00B7C3,#0078D7);flex:1;">
              Save New PIN
            </button>
            <button id="cp-cancel-btn" style="padding:8px 12px;font-size:0.8rem;background:#222;color:#AAA;border:1px solid #333;border-radius:8px;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  const pinInput = container.querySelector('#pin-input') as HTMLInputElement;
  const pinBtn = container.querySelector('#pin-submit-btn') as HTMLButtonElement;
  const pinErr = container.querySelector('#pin-err-msg') as HTMLElement;
  const changeBtn = container.querySelector('#change-key-btn') as HTMLButtonElement;

  // Change PIN panel elements
  const openCpBtn = container.querySelector('#open-change-pin-btn') as HTMLButtonElement;
  const cpPanel = container.querySelector('#change-pin-panel') as HTMLElement;
  const cpCurrentInput = container.querySelector('#cp-current-pin') as HTMLInputElement;
  const cpNewInput = container.querySelector('#cp-new-pin') as HTMLInputElement;
  const cpConfirmInput = container.querySelector('#cp-confirm-pin') as HTMLInputElement;
  const cpErrMsg = container.querySelector('#cp-err-msg') as HTMLElement;
  const cpSubmitBtn = container.querySelector('#cp-submit-btn') as HTMLButtonElement;
  const cpCancelBtn = container.querySelector('#cp-cancel-btn') as HTMLButtonElement;

  openCpBtn?.addEventListener('click', () => {
    cpPanel.style.display = cpPanel.style.display === 'none' ? 'block' : 'none';
  });

  cpCancelBtn?.addEventListener('click', () => {
    cpPanel.style.display = 'none';
  });

  cpSubmitBtn?.addEventListener('click', async () => {
    const current = cpCurrentInput.value.trim();
    const newPin = cpNewInput.value.trim();
    const confirmPin = cpConfirmInput.value.trim();

    cpErrMsg.textContent = '';

    if (!current || !newPin || !confirmPin) {
      cpErrMsg.textContent = 'Please fill all PIN fields.';
      return;
    }

    if (newPin !== confirmPin) {
      cpErrMsg.textContent = '❌ New PIN and Confirm PIN do not match.';
      return;
    }

    if (sheetPin && current !== sheetPin) {
      cpErrMsg.textContent = '❌ Incorrect current PIN.';
      return;
    }

    cpSubmitBtn.disabled = true;
    cpSubmitBtn.textContent = 'Updating...';

    // Call Cloudflare Worker API & Supabase DB via LicenseEngine
    const res = await LicenseEngine.changePin(current, newPin);

    cpSubmitBtn.disabled = false;
    cpSubmitBtn.textContent = 'Save New PIN';

    if (res.ok) {
      NotificationEngine.showToast(`✅ ${res.message}`, 'success');
      cpPanel.style.display = 'none';
      pinInput.value = newPin;
      // Re-render screen with updated PIN
      const updatedRow = LicenseEngine.getActiveClientRow();
      renderPinLockScreen(container, updatedRow);
    } else {
      cpErrMsg.textContent = `⛔ ${res.message}`;
    }
  });

  changeBtn?.addEventListener('click', async () => {
    sessionStorage.removeItem('rxflow_pin_unlocked');
    await LicenseEngine.clearLicense();
    renderLicenseGate(container);
  });

  const handleUnlock = async () => {
    const enteredPin = pinInput.value.trim();
    const currentActiveRow = LicenseEngine.getActiveClientRow();
    const currentSheetPin = currentActiveRow?.pin || sheetPin;

    pinErr.textContent = '';
    pinInput.classList.remove('as-gate-input--error');

    // If PIN is set, verify match
    if (currentSheetPin && currentSheetPin.length > 0) {
      if (enteredPin !== currentSheetPin) {
        pinInput.classList.add('as-gate-input--error');
        pinErr.textContent = '❌ Incorrect PIN. Please enter your valid security PIN.';
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
      sessionStorage.setItem('rxflow_pin_unlocked', 'true');
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
