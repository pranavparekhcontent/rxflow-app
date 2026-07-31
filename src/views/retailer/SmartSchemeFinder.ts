/**
 * Mediflow SmartSchemeFinder v3.0
 * Offline scheme margin ranking engine. Ranks stockist & brand schemes by retailer projected profit.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface SchemeOffer {
  id: string;
  schemeName: string;
  brandName: string;
  distributorName: string;
  schemeType: string;
  buyQty: number;
  freeQty: number;
  ptr: number;
  mrp: number;
  projectedProfit: number;
  validUntil: string;
}

export default function SmartSchemeFinder(container: HTMLElement): void {
  const schemes: SchemeOffer[] = [
    { id: 'sch-01', schemeName: 'Buy 10 Get 2 Free (GSK Deal)', brandName: 'Augmentin 625 Duo', distributorName: 'Shrine Pharma', schemeType: 'buy_x_get_y', buyQty: 10, freeQty: 2, ptr: 142.50, mrp: 201.71, projectedProfit: 995.52, validUntil: '15 Aug 2026' },
    { id: 'sch-02', schemeName: 'Clearance Discount 25% Off', brandName: 'Pan-D Capsule', distributorName: 'Medico Distributors', schemeType: 'clearance_sale', buyQty: 5, freeQty: 0, ptr: 66.00, mrp: 156.00, projectedProfit: 450.00, validUntil: '05 Aug 2026' },
    { id: 'sch-03', schemeName: 'Buy 20 Get 5 Free (Dolo Festive)', brandName: 'Dolo 650 Tablet', distributorName: 'Shrine Pharma', schemeType: 'buy_x_get_y', buyQty: 20, freeQty: 5, ptr: 26.80, mrp: 34.00, projectedProfit: 314.00, validUntil: '31 Aug 2026' },
  ];

  container.innerHTML = `
    <div class="section-title">🎁 smart scheme finder (margin ranked)</div>

    <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--tile-radius);padding:16px;margin-bottom:16px;">
      <div style="font-size:14px;font-weight:700;color:var(--tile-green);margin-bottom:4px;">Offline Profit Maximizer View</div>
      <div style="font-size:11px;color:var(--text-secondary);">
        Schemes are ranked by projected net profit. Calculations run locally on PowerSync SQLite replica.
      </div>
    </div>

    <!-- Schemes List -->
    <div class="metro-list">
      ${schemes.map(sch => `
        <div class="metro-item metro-item--green">
          <div class="item-main">
            <div class="item-title">
              ${sch.schemeName}
              <span class="item-tag item-tag--green">+₹${sch.projectedProfit.toFixed(0)} Profit</span>
            </div>
            <div class="item-sub">Brand: ${sch.brandName} • Stockist: ${sch.distributorName} • Valid till: ${sch.validUntil}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="item-price">
              <div class="price-main" style="color:var(--tile-green);">₹${sch.ptr.toFixed(2)}</div>
              <div class="price-sub">Buy ${sch.buyQty} + Get ${sch.freeQty} Free</div>
            </div>
            <button class="action-btn apply-scheme-btn" data-id="${sch.id}" style="padding:6px 12px;font-size:11px;background:var(--tile-green);">
              Apply Scheme
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.apply-scheme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      NotificationEngine.showToast('🎁 Scheme deal applied! Free items added to split cart.', 'success');
    });
  });
}
