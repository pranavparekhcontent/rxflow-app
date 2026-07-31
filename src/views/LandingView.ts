/**
 * RxFlow Landing Page & Client Registration View v4.0
 * 
 * Features:
 * - Public Landing Page for https://rxflow-app.pages.dev
 * - Client Registration Form asking all fields from Google Sheet:
 *   • Client Name
 *   • Role (Retailer, Distributor, Manufacturer, Sales Rep)
 *   • Email
 *   • Contact No.
 *   • City
 *   • MSPC Reg. No. (Mandatory ONLY for Pharmacist / Retailer)
 *   • Pharmacist License / DL No. (Mandatory ONLY for Pharmacist / Retailer)
 *   • Security PIN
 * - Form submission sends registration request to pranavparekhcontent@gmail.com
 * - Direct "Already Have a License Key? Launch App →" button to trigger AppStart key activation
 */

import { navigate } from '../engine/Router';
import { NotificationEngine } from '../engine/NotificationEngine';

export default function LandingView(container: HTMLElement): void {
  // Hide main app header on landing page
  const header = document.getElementById('app-header');
  const nav = document.getElementById('app-nav');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';

  container.innerHTML = `
    <div class="rx-landing-wrapper">
      <!-- Top Hero Header -->
      <header class="rx-landing-hero">
        <div class="rx-landing-hero__logo">
          <span class="rx-landing-hero__pill">💊</span>
          <div class="metro-title" style="font-size:42px;letter-spacing:-1px;color:white;">Rx<strong>Flow</strong> PWA</div>
        </div>
        <div class="rx-landing-hero__subtitle">
          Maharashtra Pharma B2B Hub · Chemist • Stockist • Manufacturer • MR Network
        </div>
        
        <!-- CTA Row -->
        <div class="rx-landing-hero__actions">
          <button class="rx-btn rx-btn--primary" id="btn-goto-activate">
            🔑 Already Have a License Key? Activate App →
          </button>
        </div>
      </header>

      <!-- Main Content Grid -->
      <div class="rx-landing-content">
        
        <!-- Left Side: Registration Form -->
        <div class="rx-card rx-card--form">
          <div class="rx-card__header">
            <div class="rx-card__title">📝 New Client Add (Get License Key)</div>
            <div class="rx-card__sub">Register your pharmacy, stockist agency or manufacturing unit</div>
          </div>

          <form id="rx-reg-form" class="rx-form">
            <!-- Client Name & Firm Name -->
            <div class="rx-form__row">
              <div class="rx-form__group">
                <label class="rx-form__label">Client Name <span class="req">*</span></label>
                <input type="text" id="reg-client-name" class="rx-form__input" placeholder="e.g. DEMO R" required>
              </div>
              <div class="rx-form__group">
                <label class="rx-form__label">Firm / Store Name <span class="req">*</span></label>
                <input type="text" id="reg-firm-name" class="rx-form__input" placeholder="e.g. Royal Medical / Agency" required>
              </div>
            </div>

            <!-- Role Dropdown -->
            <div class="rx-form__group">
              <label class="rx-form__label">Stakeholder Role <span class="req">*</span></label>
              <select id="reg-role" class="rx-form__input" required>
                <option value="retailer" selected>🛍️ Retailer / Chemist (Medical Store)</option>
                <option value="distributor">🚚 Distributor / Stockist (Wholesaler)</option>
                <option value="manufacturer">🏭 Manufacturer (Pharma Company)</option>
                <option value="sales_rep">👨‍💼 Sales Representative / MR</option>
              </select>
            </div>

            <!-- Email & Contact -->
            <div class="rx-form__row">
              <div class="rx-form__group">
                <label class="rx-form__label">Email Address <span class="req">*</span></label>
                <input type="email" id="reg-email" class="rx-form__input" placeholder="email@example.com" required>
              </div>
              <div class="rx-form__group">
                <label class="rx-form__label">Contact Number <span class="req">*</span></label>
                <input type="tel" id="reg-contact" class="rx-form__input" placeholder="+91 98220 12345" required>
              </div>
            </div>

            <!-- City -->
            <div class="rx-form__group">
              <label class="rx-form__label">City / Location <span class="req">*</span></label>
              <input type="text" id="reg-city" class="rx-form__input" placeholder="e.g. Mumbai / Pune / Nagpur" required>
            </div>

            <!-- MSPC Reg & Pharmacist DL (Dynamic Mandatory Indicator) -->
            <div class="rx-form__row">
              <div class="rx-form__group">
                <label class="rx-form__label" id="label-mspc">
                  MSPC Reg. No. <span class="req" id="req-mspc">* Required (Pharmacist)</span>
                </label>
                <input type="text" id="reg-mspc" class="rx-form__input" placeholder="e.g. MSPC-123456">
              </div>
              <div class="rx-form__group">
                <label class="rx-form__label" id="label-dl">
                  Pharmacist License / DL <span class="req" id="req-dl">* Required (Pharmacist)</span>
                </label>
                <input type="text" id="reg-dl" class="rx-form__input" placeholder="e.g. 20B/21B-987654">
              </div>
            </div>

            <!-- Desired Security PIN -->
            <div class="rx-form__group">
              <label class="rx-form__label">Desired Security PIN (Passcode) <span class="req">*</span></label>
              <input type="password" id="reg-pin" class="rx-form__input" placeholder="••••" maxlength="8" required>
              <div class="rx-form__hint">Used to unlock your app once your 10-digit key is issued</div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="rx-btn rx-btn--submit" id="btn-reg-submit">
              <span>🚀 Submit Registration Request</span>
            </button>
          </form>
        </div>

        <!-- Right Side: Workflow & Features Info -->
        <div class="rx-card rx-card--info">
          <div class="rx-card__header">
            <div class="rx-card__title">⚡ How RxFlow License System Works</div>
          </div>
          
          <div class="rx-steps">
            <div class="rx-step">
              <div class="rx-step__num">1</div>
              <div class="rx-step__body">
                <strong>Submit Registration Form</strong>
                <p>Fill your pharmacy details. Your registration request is sent to admin (<code>pranavparekhcontent@gmail.com</code>).</p>
              </div>
            </div>

            <div class="rx-step">
              <div class="rx-step__num">2</div>
              <div class="rx-step__body">
                <strong>Admin MSPC & DL Verification</strong>
                <p>Admin verifies your MSPC registration / Drug License and issues your 10-digit License Key.</p>
              </div>
            </div>

            <div class="rx-step">
              <div class="rx-step__num">3</div>
              <div class="rx-step__body">
                <strong>Enter License Key & Unlock PIN</strong>
                <p>Click "Activate License Key", enter your 10-digit key, and input your security PIN to unlock your B2B dashboard.</p>
              </div>
            </div>
          </div>

          <!-- Feature Bullets -->
          <div class="rx-features">
            <div class="rx-feature">🛍️ <strong>Chemist:</strong> Voice/Slip AI order placement, Scheme finder & UPI payments</div>
            <div class="rx-feature">🚚 <strong>Distributor:</strong> FEFO auto-approval, Tally ERP sync & Credit control</div>
            <div class="rx-feature">🏭 <strong>Manufacturer:</strong> Master catalog, analytics & sponsored promotions</div>
            <div class="rx-feature">🔒 <strong>DPCO & FDA Compliant:</strong> End-to-end encrypted local offline storage</div>
          </div>
        </div>

      </div>
    </div>
  `;

  // ---------- Dynamic Role Change Handler ----------
  const roleSelect = container.querySelector('#reg-role') as HTMLSelectElement;
  const reqMspc = container.querySelector('#req-mspc') as HTMLElement;
  const reqDl = container.querySelector('#req-dl') as HTMLElement;
  const inputMspc = container.querySelector('#reg-mspc') as HTMLInputElement;
  const inputDl = container.querySelector('#reg-dl') as HTMLInputElement;

  const updateRoleFields = () => {
    const role = roleSelect.value;
    if (role === 'retailer') {
      reqMspc.textContent = '* Required (Pharmacist)';
      reqMspc.style.color = '#FF4D4D';
      reqDl.textContent = '* Required (Pharmacist)';
      reqDl.style.color = '#FF4D4D';
      inputMspc.required = true;
      inputDl.required = true;
    } else {
      reqMspc.textContent = '(Optional)';
      reqMspc.style.color = '#888';
      reqDl.textContent = '(Optional)';
      reqDl.style.color = '#888';
      inputMspc.required = false;
      inputDl.required = false;
    }
  };

  roleSelect?.addEventListener('change', updateRoleFields);
  updateRoleFields(); // Init on load

  // ---------- Action Handlers ----------
  container.querySelector('#btn-goto-activate')?.addEventListener('click', () => {
    navigate('#/login');
  });

  // ---------- Registration Form Submission ----------
  const form = container.querySelector('#rx-reg-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clientName = (container.querySelector('#reg-client-name') as HTMLInputElement).value.trim();
    const firmName = (container.querySelector('#reg-firm-name') as HTMLInputElement).value.trim();
    const role = roleSelect.value;
    const email = (container.querySelector('#reg-email') as HTMLInputElement).value.trim();
    const contact = (container.querySelector('#reg-contact') as HTMLInputElement).value.trim();
    const city = (container.querySelector('#reg-city') as HTMLInputElement).value.trim();
    const mspc = inputMspc.value.trim();
    const dl = inputDl.value.trim();
    const pin = (container.querySelector('#reg-pin') as HTMLInputElement).value.trim();

    // Mandatory check for Retailer
    if (role === 'retailer' && (!mspc || !dl)) {
      NotificationEngine.showToast('⛔ Pharmacists must provide MSPC Reg. No. and Pharmacist License (DL)', 'error');
      return;
    }

    const submitBtn = container.querySelector('#btn-reg-submit') as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Sending Registration to Admin...</span>';

    // Prepare payload to send email to pranavparekhcontent@gmail.com
    const payload = {
      _subject: `New RxFlow Registration Request: ${clientName} / ${firmName} (${role.toUpperCase()})`,
      to_email: 'pranavparekhcontent@gmail.com',
      client_name: clientName,
      firm_name: firmName,
      role: role,
      email: email,
      contact: contact,
      city: city,
      mspc_reg_no: mspc || 'N/A',
      pharmacist_license: dl || 'N/A',
      pin: pin,
      submitted_at: new Date().toLocaleString('en-IN'),
    };

    try {
      // Send registration email via Formspree API endpoint
      const response = await fetch('https://formspree.io/f/xqakpvwl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Fallback to mailto link if offline or endpoint unavailable
        window.open(
          `mailto:pranavparekhcontent@gmail.com?subject=New RxFlow Registration: ${encodeURIComponent(clientName)}&body=${encodeURIComponent(JSON.stringify(payload, null, 2))}`
        );
      }
    } catch {
      // Fallback mailto
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>🚀 Submit Registration Request</span>';

    // Show success modal
    container.innerHTML = `
      <div class="as-gate-overlay">
        <div class="as-gate-card" style="width:min(500px, 92vw);text-align:center;">
          <div style="font-size:3rem;margin-bottom:8px;">✅</div>
          <h2 style="color:#00D4AA;font-size:1.6rem;margin-bottom:8px;">Registration Submitted!</h2>
          <p style="color:#CCC;font-size:0.9rem;line-height:1.6;margin-bottom:16px;">
            Your registration details for <strong>"${clientName}"</strong> have been sent to admin (<code>pranavparekhcontent@gmail.com</code>).
          </p>
          <div style="background:#080A10;border:1px solid #1E2235;border-radius:10px;padding:14px;text-align:left;font-size:0.8rem;color:#AAA;margin-bottom:20px;line-height:1.6;">
            • <strong>Role:</strong> ${role.toUpperCase()}<br>
            • <strong>MSPC Reg:</strong> ${mspc || 'N/A'}<br>
            • <strong>DL License:</strong> ${dl || 'N/A'}<br>
            • <strong>PIN:</strong> •••• (${pin})<br>
            • <strong>Status:</strong> Admin will issue your 10-Digit License Key in the Master Google Sheet.
          </div>
          <button class="as-gate-btn" id="btn-done-activate">
            🔑 Already Have License Key? Activate App Now →
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-done-activate')?.addEventListener('click', () => {
      navigate('#/login');
    });
  });
}
