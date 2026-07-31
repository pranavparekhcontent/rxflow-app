/**
 * RxFlow SmartSchemeFinder v3.0
 * Offline scheme margin ranking engine using Distributors D1-D10 & Brands B1-B30.
 */

import { DISTRIBUTOR_SCHEMES } from '../../data/mockDataStore';
import { NotificationEngine } from '../../engine/NotificationEngine';

export default function SmartSchemeFinder(container: HTMLElement): void {
  container.innerHTML = `
    <div class="section-title">🎁 Smart Scheme Finder (Distributors D1-D10 Offers)</div>

    <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--tile-radius);padding:16px;margin-bottom:16px;">
      <div style="font-size:14px;font-weight:700;color:var(--tile-green);margin-bottom:4px;">Live Offers by Stockists D1-D10</div>
      <div style="font-size:11px;color:var(--text-secondary);">
        Schemes and deals configured by Distributors D1 through D10 for Retailers R1 through R10.
      </div>
    </div>

    <!-- Schemes List -->
    <div class="metro-list">
      ${DISTRIBUTOR_SCHEMES.map(sch => `
        <div class="metro-item metro-item--green">
          <div class="item-main">
            <div class="item-title">
              ${sch.schemeName}
              <span class="item-tag item-tag--green">${sch.schemeType}</span>
            </div>
            <div class="item-sub">Brand: ${sch.brandName} (${sch.sku}) • ${sch.distributorName} • ${sch.validity}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="item-price">
              <div class="price-main" style="color:var(--tile-green);">
                ${sch.getQty > 0 ? `Buy ${sch.buyQty} + Get ${sch.getQty} Free` : `${sch.discountPct}% OFF`}
              </div>
              <div class="price-sub">${sch.sku}</div>
            </div>
            <button class="action-btn apply-scheme-btn" data-id="${sch.id}" style="padding:6px 12px;font-size:11px;background:var(--tile-green);">
              Apply Deal
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.apply-scheme-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      NotificationEngine.showToast(`🎁 Scheme ${id} applied! Discount/Bonus items locked in cart.`, 'success');
    });
  });
}
