/** Credit Control View — Distributor (Phase 4) */
export default function CreditControlView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="section-title">credit control</div>
    <div class="metro-list">
      <div class="metro-item metro-item--red">
        <div class="item-main">
          <div class="item-title"><span class="pulse-dot pulse-dot--danger"></span> Rajesh Medical <span class="status-badge status-badge--overdue">Overdue 15d</span></div>
          <div class="item-sub">Outstanding: ₹45,000 • Limit: ₹50,000 • 90% Used</div>
        </div>
        <div class="item-price"><div class="price-main" style="color:var(--tile-red);">₹45,000</div><div class="price-sub">Lock Account →</div></div>
      </div>
      <div class="metro-item metro-item--green">
        <div class="item-main">
          <div class="item-title">Ganesh Pharmacy <span class="status-badge status-badge--accepted">Good Standing</span></div>
          <div class="item-sub">Outstanding: ₹12,000 • Limit: ₹75,000 • 16% Used</div>
        </div>
        <div class="item-price"><div class="price-main" style="color:var(--tile-green);">₹12,000</div></div>
      </div>
    </div>
  `;
}
