/**
 * RxFlow Expiry & Returns View v3.0
 * Photo-verified damaged & near-expiry medicine returns processing module for Brands B1..B30.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { PRODUCTS } from '../../data/mockDataStore';

interface ReturnItem {
  id: string;
  sku: string;
  brandName: string;
  batchNo: string;
  expiryDate: string;
  qty: number;
  ptr: number;
  reason: 'Damaged Packaging' | 'Expired Stock' | 'Near Expiry' | 'Wrong Shipment';
  photoUploaded: boolean;
}

export default function ExpiryReturnsView(container: HTMLElement): void {
  const returnList: ReturnItem[] = [
    {
      id: 'ret-101',
      sku: PRODUCTS[0].sku,
      brandName: PRODUCTS[0].brandName,
      batchNo: 'BCH-2026-101',
      expiryDate: '10/2026',
      qty: 3,
      ptr: PRODUCTS[0].ptr,
      reason: 'Damaged Packaging',
      photoUploaded: true,
    },
    {
      id: 'ret-102',
      sku: PRODUCTS[1].sku,
      brandName: PRODUCTS[1].brandName,
      batchNo: 'BCH-2026-102',
      expiryDate: '08/2026',
      qty: 5,
      ptr: PRODUCTS[1].ptr,
      reason: 'Expired Stock',
      photoUploaded: true,
    }
  ];

  function render(): void {
    const totalCreditEstimate = returnList.reduce((sum, item) => sum + (item.qty * item.ptr), 0);

    container.innerHTML = `
      <div class="section-title">Expiry & Damaged Stock Returns (Brands B1-B30)</div>
      
      <!-- Summary Bar -->
      <div class="metro-card flex justify-between items-center mb-md" style="border-left: 4px solid var(--accent-orange);">
        <div>
          <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Pending Return Claims</div>
          <div style="font-size:22px;font-weight:800;color:var(--accent-orange);">${returnList.length} Items</div>
        </div>
        <div class="text-right">
          <div style="font-size:12px;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Est. Credit Note</div>
          <div style="font-size:22px;font-weight:800;color:var(--accent-green);">₹${totalCreditEstimate.toFixed(2)}</div>
        </div>
      </div>

      <!-- Add New Return Claim Form -->
      <div class="metro-card mb-md">
        <div style="font-size:14px;font-weight:700;margin-bottom:10px;color:var(--accent-blue);">+ Create Return Claim</div>
        <div class="grid grid-cols-2 gap-sm mb-sm">
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Brand / Medicine</label>
            <select id="ret-sku-select" class="metro-input" style="width:100%;margin-top:4px;">
              ${PRODUCTS.slice(0, 10).map(p => `
                <option value="${p.sku}|${p.brandName}|${p.ptr}">${p.brandName} (${p.sku} • PTR ₹${p.ptr.toFixed(2)})</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Return Reason</label>
            <select id="ret-reason-select" class="metro-input" style="width:100%;margin-top:4px;">
              <option value="Damaged Packaging">Damaged Packaging</option>
              <option value="Expired Stock">Expired Stock</option>
              <option value="Near Expiry">Near Expiry (&lt; 3 Months)</option>
              <option value="Wrong Shipment">Wrong Shipment</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-sm mb-md">
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Batch No.</label>
            <input type="text" id="ret-batch" class="metro-input" placeholder="e.g. B-9932" value="BCH-2026-103" style="width:100%;margin-top:4px;">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Expiry Date</label>
            <input type="text" id="ret-expiry" class="metro-input" placeholder="MM/YYYY" value="09/2026" style="width:100%;margin-top:4px;">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Return Qty</label>
            <input type="number" id="ret-qty" class="metro-input" min="1" value="2" style="width:100%;margin-top:4px;">
          </div>
        </div>

        <div class="flex items-center justify-between gap-sm">
          <button id="btn-upload-photo" class="dev-role-btn" style="padding:8px 12px;background:#333;color:white;border:1px solid #555;border-radius:4px;cursor:pointer;font-size:12px;">
            📷 Attach Damage Photo (Simulated)
          </button>
          <button id="btn-submit-return" class="nav-btn active" style="padding:8px 16px;font-weight:700;">
            Submit Return Claim
          </button>
        </div>
      </div>

      <!-- Return Claims Table -->
      <div class="metro-card">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;">Active Return Claims Queue</div>
        <div style="overflow-x:auto;">
          <table class="metro-table" style="width:100%;font-size:12px;">
            <thead>
              <tr style="text-align:left;border-bottom:1px solid #333;">
                <th style="padding:8px;">Item</th>
                <th style="padding:8px;">Batch / Exp</th>
                <th style="padding:8px;">Reason</th>
                <th style="padding:8px;">Qty</th>
                <th style="padding:8px;">Est Credit</th>
                <th style="padding:8px;">Photo Proof</th>
                <th style="padding:8px;text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${returnList.map(item => `
                <tr style="border-bottom:1px solid #222;">
                  <td style="padding:8px;"><strong>${item.brandName}</strong><br><span style="color:#888;">${item.sku}</span></td>
                  <td style="padding:8px;">${item.batchNo}<br><span style="color:#aaa;">Exp: ${item.expiryDate}</span></td>
                  <td style="padding:8px;"><span class="badge badge-warning" style="font-size:10px;">${item.reason}</span></td>
                  <td style="padding:8px;font-weight:700;">${item.qty}</td>
                  <td style="padding:8px;color:var(--accent-green);font-weight:700;">₹${(item.qty * item.ptr).toFixed(2)}</td>
                  <td style="padding:8px;">${item.photoUploaded ? '<span style="color:#00FF66;">✔ Verified</span>' : '<span style="color:#ff4444;">Missing</span>'}</td>
                  <td style="padding:8px;text-align:right;">
                    <button class="btn-remove-claim" data-id="${item.id}" style="background:none;border:none;color:#ff5555;cursor:pointer;">✕ Cancel</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Attach Event Listeners
    let photoAttached = true;

    container.querySelector('#btn-upload-photo')?.addEventListener('click', () => {
      photoAttached = true;
      NotificationEngine.showToast('Damage photo captured and uploaded to Cloudflare R2', 'success');
    });

    container.querySelector('#btn-submit-return')?.addEventListener('click', () => {
      const selectVal = (container.querySelector('#ret-sku-select') as HTMLSelectElement).value;
      const [sku, brandName, ptrStr] = selectVal.split('|');
      const ptr = parseFloat(ptrStr);
      const reason = (container.querySelector('#ret-reason-select') as HTMLSelectElement).value as any;
      const batchNo = (container.querySelector('#ret-batch') as HTMLInputElement).value || 'BCH-2026-103';
      const expiryDate = (container.querySelector('#ret-expiry') as HTMLInputElement).value || '12/2026';
      const qty = parseInt((container.querySelector('#ret-qty') as HTMLInputElement).value, 10) || 1;

      const newItem: ReturnItem = {
        id: `ret-${Date.now()}`,
        sku,
        brandName,
        batchNo,
        expiryDate,
        qty,
        ptr,
        reason,
        photoUploaded: photoAttached,
      };

      returnList.unshift(newItem);
      SyncOrchestrator.queueMutation('return_claims', 'INSERT', newItem);
      NotificationEngine.showToast(`Return claim for ${brandName} submitted successfully`, 'success');
      render();
    });

    container.querySelectorAll('.btn-remove-claim').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const idx = returnList.findIndex(i => i.id === id);
        if (idx !== -1) {
          returnList.splice(idx, 1);
          NotificationEngine.showToast('Return claim removed', 'info');
          render();
        }
      });
    });
  }

  render();
}
