/** FEFO Inventory View — Batch-level stock management (Phase 4) */
export default function FefoInventoryView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="section-title">FEFO inventory management</div>
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input class="metro-input" type="search" placeholder="Search by product, batch, godown...">
    </div>
    <div class="metro-list">
      <div class="metro-item metro-item--red">
        <div class="item-main">
          <div class="item-title">Augmentin 625 • AUG-2024-B12 <span class="item-tag item-tag--red">🔴 28 Days</span></div>
          <div class="item-sub">Godown A • Qty: 45 boxes • Expiry: 26 Aug 2026</div>
        </div>
        <div class="item-price"><div class="price-main" style="color:var(--tile-red);">URGENT</div></div>
      </div>
      <div class="metro-item metro-item--amber">
        <div class="item-main">
          <div class="item-title">Pan-D Capsule • PND-441 <span class="item-tag item-tag--amber">🟠 52 Days</span></div>
          <div class="item-sub">Godown B • Qty: 120 boxes • Expiry: 19 Sep 2026</div>
        </div>
        <div class="item-price"><div class="price-main">₹88.00 PTR</div></div>
      </div>
      <div class="metro-item metro-item--green">
        <div class="item-main">
          <div class="item-title">Dolo 650 • DL2026 <span class="item-tag item-tag--green">🟢 180+ Days</span></div>
          <div class="item-sub">Godown A • Qty: 500 boxes • Expiry: Jan 2027</div>
        </div>
        <div class="item-price"><div class="price-main">₹26.80 PTR</div></div>
      </div>
    </div>
    <div class="action-bar">
      <button class="action-btn action-btn--warning">⚠️ Dead Stock Hub</button>
      <button class="action-btn action-btn--danger">🚨 Batch Recall</button>
      <button class="action-btn">📊 Stock Report</button>
    </div>
  `;
}
