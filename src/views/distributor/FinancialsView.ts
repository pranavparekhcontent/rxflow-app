/** Financials View — Aging reports & collections (Phase 4) */
export default function FinancialsView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="section-title">financial dashboard</div>
    <div class="metro-grid" style="grid-auto-rows:130px;margin-bottom:20px;">
      <div class="tile tile-small bg-green">
        <div class="tile-icon">💰</div>
        <div><div class="tile-value" style="font-size:22px;">₹2.4L</div><div class="tile-label">Today's Collection</div></div>
      </div>
      <div class="tile tile-small bg-amber">
        <div class="tile-icon">⏰</div>
        <div><div class="tile-value" style="font-size:22px;">₹3.2L</div><div class="tile-label">Overdue</div></div>
      </div>
      <div class="tile tile-small bg-blue">
        <div class="tile-icon">📄</div>
        <div><div class="tile-value" style="font-size:22px;">₹18.5L</div><div class="tile-label">Total Outstanding</div></div>
      </div>
      <div class="tile tile-small bg-purple">
        <div class="tile-icon">📊</div>
        <div><div class="tile-value" style="font-size:22px;">42</div><div class="tile-label">Active Accounts</div></div>
      </div>
    </div>
    <div class="action-bar">
      <button class="action-btn action-btn--success">📥 Export CSV for Tally</button>
      <button class="action-btn">📊 Aging Report</button>
    </div>
  `;
}
