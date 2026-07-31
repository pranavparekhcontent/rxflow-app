/**
 * RxFlow FEFO Inventory View v3.0
 * Batch-level stock management for Brands B1-B30 & 20 Generic Salts.
 */

import { PRODUCTS } from '../../data/mockDataStore';

export default function FefoInventoryView(container: HTMLElement): void {
  const fefoItems = PRODUCTS.slice(0, 6).map((p, i) => ({
    brandName: p.brandName,
    sku: p.sku,
    batchNo: `BCH-2026-${100 + i}`,
    daysLeft: 20 + i * 25,
    qty: p.stockQty,
    godown: i % 2 === 0 ? 'Godown A (Main)' : 'Godown B (Annex)',
    ptr: p.ptr,
    category: p.category,
  }));

  container.innerHTML = `
    <div class="section-title">FEFO Inventory Management (Brands B1-B30)</div>
    <div class="search-bar" style="margin-bottom:14px;">
      <span class="search-icon">🔍</span>
      <input class="metro-input" type="search" placeholder="Search by brand name, batch, godown...">
    </div>
    <div class="metro-list">
      ${fefoItems.map(item => {
        const isUrgent = item.daysLeft < 40;
        return `
          <div class="metro-item ${isUrgent ? 'metro-item--red' : item.daysLeft < 90 ? 'metro-item--amber' : 'metro-item--green'}">
            <div class="item-main">
              <div class="item-title">
                ${item.brandName} • ${item.batchNo}
                <span class="item-tag ${isUrgent ? 'item-tag--red' : 'item-tag--green'}">
                  ${isUrgent ? `🔴 ${item.daysLeft} Days FEFO` : `🟢 ${item.daysLeft} Days FEFO`}
                </span>
                <span class="item-tag">${item.category}</span>
              </div>
              <div class="item-sub">${item.godown} • Stock: ${item.qty} units • ${item.sku}</div>
            </div>
            <div class="item-price">
              <div class="price-main" style="color:${isUrgent ? 'var(--tile-red)' : 'var(--tile-green)'}">
                ₹${item.ptr.toFixed(2)} <span class="price-unit">PTR</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="action-bar">
      <button class="action-btn action-btn--warning">⚠️ Dead Stock Hub</button>
      <button class="action-btn action-btn--danger">🚨 Batch Recall</button>
      <button class="action-btn">📊 Stock Report</button>
    </div>
  `;
}
