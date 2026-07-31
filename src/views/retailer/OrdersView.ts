/** Orders View — Order history & tracking (Phase 3) */
export default function OrdersView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="section-title">my orders</div>
    <div class="metro-list">
      <div class="metro-item">
        <div class="item-main">
          <div class="item-title">Order #ORD-2026-4518 <span class="status-badge status-badge--dispatched">Dispatched</span></div>
          <div class="item-sub">Shrine Pharma • 8 items • 28 Jul 2026</div>
        </div>
        <div class="item-price"><div class="price-main">₹12,450</div></div>
      </div>
      <div class="metro-item metro-item--green">
        <div class="item-main">
          <div class="item-title">Order #ORD-2026-4515 <span class="status-badge status-badge--accepted">Delivered</span></div>
          <div class="item-sub">Medico Distributors • 5 items • 25 Jul 2026</div>
        </div>
        <div class="item-price"><div class="price-main">₹7,800</div></div>
      </div>
    </div>
  `;
}
