/**
 * Mediflow MarketAnalyticsView v3.0
 * Secondary sales analytics dashboard for manufacturers across Maharashtra districts & pincodes.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface DistrictSales {
  district: string;
  totalRevenue: number;
  activeStockists: number;
  activeChemists: number;
  topMolecule: string;
}

export default function MarketAnalyticsView(container: HTMLElement): void {
  const analytics: DistrictSales[] = [
    { district: 'Pune', totalRevenue: 1485000.00, activeStockists: 14, activeChemists: 420, topMolecule: 'Amoxycillin + Clavulanate' },
    { district: 'Mumbai Suburban', totalRevenue: 2840000.00, activeStockists: 28, activeChemists: 890, topMolecule: 'Pantoprazole + Domperidone' },
    { district: 'Nashik', totalRevenue: 820000.00, activeStockists: 8, activeChemists: 240, topMolecule: 'Paracetamol 650mg' },
    { district: 'Nagpur', totalRevenue: 650000.00, activeStockists: 6, activeChemists: 180, topMolecule: 'Azithromycin 500mg' },
  ];

  container.innerHTML = `
    <div class="section-title">📊 secondary sales analytics — maharashtra</div>

    <!-- Summary Metrics -->
    <div class="metro-grid" style="grid-auto-rows:130px;margin-bottom:20px;">
      <div class="tile tile-wide bg-blue">
        <div class="tile-badge">Total Secondary</div>
        <div class="tile-icon">💰</div>
        <div><div class="tile-value">₹57.95L</div><div class="tile-label">Monthly Secondary Sales</div></div>
      </div>
      <div class="tile tile-small bg-teal">
        <div class="tile-icon">🚚</div>
        <div><div class="tile-value" style="font-size:22px;">56</div><div class="tile-label">Stockists</div></div>
      </div>
      <div class="tile tile-small bg-green">
        <div class="tile-icon">🛍️</div>
        <div><div class="tile-value" style="font-size:22px;">1,730</div><div class="tile-label">Chemists</div></div>
      </div>
    </div>

    <!-- District Breakdown Table -->
    <div class="section-title">sales by district</div>
    <div class="metro-list">
      ${analytics.map(d => `
        <div class="metro-item metro-item--teal">
          <div class="item-main">
            <div class="item-title">
              District: ${d.district}
              <span class="item-tag">${d.activeStockists} Stockists • ${d.activeChemists} Chemists</span>
            </div>
            <div class="item-sub">Top Molecule Demand: ${d.topMolecule}</div>
          </div>
          <div class="item-price">
            <div class="price-main">₹${(d.totalRevenue / 100000).toFixed(2)} Lakhs</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="action-bar" style="margin-top:20px;">
      <button class="action-btn action-btn--primary" id="btn-export-analytics">
        📥 Export Secondary Sales Excel Report
      </button>
    </div>
  `;

  container.querySelector('#btn-export-analytics')?.addEventListener('click', () => {
    NotificationEngine.showToast('📥 Secondary sales Excel report downloaded!', 'success');
  });
}
