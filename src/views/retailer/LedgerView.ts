/** Ledger View — Append-only financial trail (Phase 3) */
export default function LedgerView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="section-title">ledger & outstanding</div>
    <div class="credit-meter" style="margin-bottom:16px;">
      <span>Shrine Pharma</span>
      <div class="credit-meter__bar"><div class="credit-meter__fill credit-meter__fill--ok" style="width:85%;"></div></div>
      <span style="font-weight:700;">₹85,400 / ₹1.0L</span>
    </div>
    <div class="metro-list">
      <div class="metro-item metro-item--green">
        <div class="item-main">
          <div class="item-title">Payment Received <span class="item-tag item-tag--green">UPI</span></div>
          <div class="item-sub">28 Jul 2026 • Ref: UPI/2026072812345</div>
        </div>
        <div class="item-price"><div class="price-main" style="color:var(--tile-green);">+₹15,000</div></div>
      </div>
      <div class="metro-item metro-item--amber">
        <div class="item-main">
          <div class="item-title">Invoice #INV-2026-0847 <span class="item-tag item-tag--amber">Due</span></div>
          <div class="item-sub">25 Jul 2026 • Due: 30 Jul 2026</div>
        </div>
        <div class="item-price"><div class="price-main" style="color:var(--tile-amber);">-₹12,450</div></div>
      </div>
    </div>
  `;
}
