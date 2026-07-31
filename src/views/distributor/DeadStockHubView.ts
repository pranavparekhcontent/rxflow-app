/**
 * Mediflow DeadStockHubView v3.0
 * Color-coded risk dashboard (🔴 <30d, 🟠 <60d, 🟡 <90d). One-click "Discount-to-Clear" scheme publisher.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface DeadStockBatch {
  sku: string;
  brandName: string;
  batchNumber: string;
  expiryDate: string;
  daysRemaining: number;
  qtyInStock: number;
  ptr: number;
  riskLevel: 'critical' | 'warning' | 'caution';
}

export default function DeadStockHubView(container: HTMLElement): void {
  const deadStock: DeadStockBatch[] = [
    { sku: 'AUG625', brandName: 'Augmentin 625 Duo Tablet', batchNumber: 'AUG-2024-B12', expiryDate: '26 Aug 2026', daysRemaining: 28, qtyInStock: 45, ptr: 142.50, riskLevel: 'critical' },
    { sku: 'PAND', brandName: 'Pan-D Capsule', batchNumber: 'PND-441', expiryDate: '19 Sep 2026', daysRemaining: 52, qtyInStock: 120, ptr: 88.00, riskLevel: 'warning' },
    { sku: 'AZI250', brandName: 'Azithral 250 Tablet', batchNumber: 'AZ-990', expiryDate: '25 Oct 2026', daysRemaining: 88, qtyInStock: 80, ptr: 58.00, riskLevel: 'caution' },
  ];

  container.innerHTML = `
    <div class="section-title">⚠️ dead stock hub & clearance engine</div>

    <!-- Risk Summary Cards -->
    <div class="metro-grid" style="grid-auto-rows:120px;margin-bottom:16px;">
      <div class="tile tile-small bg-red">
        <div class="tile-badge">🔴 Critical</div>
        <div class="tile-value">45</div>
        <div class="tile-label">&lt; 30 Days Expiry</div>
      </div>
      <div class="tile tile-small bg-amber">
        <div class="tile-badge">🟠 Warning</div>
        <div class="tile-value">120</div>
        <div class="tile-label">&lt; 60 Days Expiry</div>
      </div>
      <div class="tile tile-small bg-cyan">
        <div class="tile-badge">🟡 Caution</div>
        <div class="tile-value">80</div>
        <div class="tile-label">&lt; 90 Days Expiry</div>
      </div>
      <div class="tile tile-small bg-slate">
        <div class="tile-icon">💰</div>
        <div class="tile-value" style="font-size:20px;">₹21.6K</div>
        <div class="tile-label">Capital at Risk</div>
      </div>
    </div>

    <!-- Dead Stock List -->
    <div class="metro-list">
      ${deadStock.map(b => `
        <div class="metro-item ${b.riskLevel === 'critical' ? 'metro-item--red' : b.riskLevel === 'warning' ? 'metro-item--amber' : 'metro-item--teal'}">
          <div class="item-main">
            <div class="item-title">
              ${b.brandName}
              <span class="item-tag">Batch: ${b.batchNumber}</span>
              <span class="item-tag ${b.riskLevel === 'critical' ? 'item-tag--red' : 'item-tag--amber'}">${b.daysRemaining} Days Left</span>
            </div>
            <div class="item-sub">Expiry: ${b.expiryDate} • Qty in Stock: ${b.qtyInStock} boxes • Value: ₹${(b.qtyInStock * b.ptr).toFixed(0)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <button class="action-btn clear-sale-btn" data-sku="${b.sku}" data-batch="${b.batchNumber}" style="padding:8px 14px;font-size:11px;background:var(--tile-amber);">
              🏷️ Discount-to-Clear (30% Off)
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="action-bar" style="margin-top:20px;">
      <button class="action-btn action-btn--warning" id="btn-auto-clearance-all">
        ⚡ Auto-Publish 30% Off Clearance Schemes to All Retailer Live Tiles
      </button>
    </div>
  `;

  attachEvents();

  function attachEvents(): void {
    container.querySelectorAll('.clear-sale-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = (e.currentTarget as HTMLElement).getAttribute('data-sku');
        NotificationEngine.showToast(`🏷️ Created 30% clearance scheme for SKU ${sku}! Live on chemist tiles.`, 'success');
      });
    });

    container.querySelector('#btn-auto-clearance-all')?.addEventListener('click', () => {
      NotificationEngine.showToast('⚡ Auto-published clearance schemes for all 3 expiring batches!', 'success');
    });
  }
}
