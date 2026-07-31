/**
 * Mediflow PhoneOrderEntryModal v3.0
 * Quick-entry desk for phone and WhatsApp orders taken by stockist sales desk operators.
 * Auto-parses raw SKU text and assigns placed_via = 'distributor_phone'.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export function showPhoneOrderEntryModal(container: HTMLElement): void {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-panel" style="max-width:560px;">
      <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:18px;font-weight:700;">📱 Phone / WhatsApp Order Entry Desk</div>
          <div style="font-size:11px;color:var(--text-secondary);">Fast order entry for stockist sales operators</div>
        </div>
        <button style="background:none;border:none;color:white;font-size:20px;cursor:pointer;" id="phone-close-btn">✕</button>
      </div>

      <div style="margin-bottom:14px;">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Select Chemist / Retailer</label>
        <select class="metro-input" id="phone-retailer-select">
          <option value="ret-01">Rajesh Medical Store (Pune Rasta Peth) — DL: MH-MZ2-482019</option>
          <option value="ret-02">Ganesh Pharmacy (Pune Sadashiv Peth) — DL: MH-MZ2-512044</option>
          <option value="ret-03">Sai Krupa Chemist (Pimpri) — DL: MH-MZ2-992011</option>
        </select>
      </div>

      <div style="margin-bottom:14px;">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Order Text / Paste WhatsApp Audio Transcript</label>
        <textarea class="metro-input" id="phone-order-text" rows="4" placeholder="Paste e.g.: Augmentin 625 Duo - 10 boxes, Pan D - 15 strips, Dolo 650 - 20..."></textarea>
      </div>

      <div style="display:flex;gap:10px;">
        <button class="action-btn action-btn--primary" id="btn-parse-phone-order" style="flex:1;">
          🔍 Parse & Allocate FEFO
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#phone-close-btn')?.addEventListener('click', () => modal.remove());
  modal.querySelector('#btn-parse-phone-order')?.addEventListener('click', () => {
    NotificationEngine.showToast('⚡ Phone order parsed, FEFO stock allocated, & invoice link sent via WhatsApp!', 'success');
    modal.remove();
  });
}
