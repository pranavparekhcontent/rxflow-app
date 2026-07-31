/**
 * Mediflow RetailerPosInventory v3.0
 * Chemist counter POS inventory tracking with camera barcode scanning and auto short-book alerts.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface PosStockItem {
  sku: string;
  brandName: string;
  currentQty: number;
  minReorderLevel: number;
  ptr: number;
  mrp: number;
}

export default function RetailerPosInventory(container: HTMLElement): void {
  const inventoryItems: PosStockItem[] = [
    { sku: 'AUG625', brandName: 'Augmentin 625 Duo', currentQty: 4, minReorderLevel: 5, ptr: 142.50, mrp: 201.71 },
    { sku: 'PAND', brandName: 'Pan-D Capsule', currentQty: 18, minReorderLevel: 10, ptr: 88.00, mrp: 156.00 },
    { sku: 'DOLO650', brandName: 'Dolo 650 Tablet', currentQty: 2, minReorderLevel: 10, ptr: 26.80, mrp: 34.00 },
    { sku: 'CAL500', brandName: 'Shelcal 500', currentQty: 25, minReorderLevel: 10, ptr: 110.00, mrp: 140.00 },
  ];

  function render(): void {
    const lowStockCount = inventoryItems.filter(i => i.currentQty <= i.minReorderLevel).length;

    container.innerHTML = `
      <div class="section-title">🏪 retailer counter POS & stock</div>

      <!-- Scanner & Add Bar -->
      <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--tile-radius);padding:16px;margin-bottom:16px;display:flex;gap:12px;align-items:center;">
        <button class="action-btn action-btn--primary" id="btn-scan-barcode" style="max-width:180px;">
          📷 Scan Barcode
        </button>
        <div style="font-size:12px;color:var(--text-secondary);flex:1;">
          Scan medicine 2D barcode (GS1/DataMatrix) to log counter sale & deduct local stock
        </div>
        ${lowStockCount > 0 ? `<span class="status-badge status-badge--overdue">⚠️ ${lowStockCount} Short-Book Alerts</span>` : ''}
      </div>

      <!-- POS Counter Stock Table -->
      <div class="metro-list">
        ${inventoryItems.map(item => {
          const isLow = item.currentQty <= item.minReorderLevel;

          return `
            <div class="metro-item ${isLow ? 'metro-item--amber' : 'metro-item--green'}">
              <div class="item-main">
                <div class="item-title">
                  ${item.brandName}
                  <span class="item-tag">${item.sku}</span>
                  ${isLow ? '<span class="item-tag item-tag--amber">⚠️ Short-Book Alert</span>' : ''}
                </div>
                <div class="item-sub">PTR: ₹${item.ptr.toFixed(2)} • MRP: ₹${item.mrp.toFixed(2)} • Min Level: ${item.minReorderLevel}</div>
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="font-size:18px;font-weight:700;color:${isLow ? 'var(--tile-amber)' : 'var(--text-primary)'};">
                  ${item.currentQty} <span style="font-size:11px;font-weight:normal;color:var(--text-secondary);">boxes</span>
                </div>
                <button class="action-btn deduct-sale-btn" data-sku="${item.sku}" style="padding:6px 12px;font-size:11px;background:var(--tile-amber);">
                  -1 Sale
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    container.querySelector('#btn-scan-barcode')?.addEventListener('click', () => {
      NotificationEngine.showToast('📷 Camera scanner active! Scan medicine barcode...', 'info');
    });

    container.querySelectorAll('.deduct-sale-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = (e.currentTarget as HTMLElement).getAttribute('data-sku');
        const item = inventoryItems.find(i => i.sku === sku);
        if (item && item.currentQty > 0) {
          item.currentQty--;
          if (item.currentQty <= item.minReorderLevel) {
            NotificationEngine.showToast(`⚠️ ${item.brandName} dropped below min level! Added to Short-Book`, 'warning');
          } else {
            NotificationEngine.showToast(`Deducted 1 sale for ${item.brandName}. Current: ${item.currentQty}`, 'success');
          }
          render();
        }
      });
    });
  }

  render();
}
