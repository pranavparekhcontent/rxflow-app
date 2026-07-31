/**
 * Manufacturer Home — Metro Live Tile Dashboard
 */

import { navigate } from '../../engine/Router';

export default function ManufacturerHome(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sync-bar" style="margin-bottom:16px;">
      <div class="sync-bar__dot"></div>
      <span>Online • 1,200 SKUs in Master Catalog</span>
    </div>

    <div class="section-title">manufacturer dashboard</div>
    <div class="metro-grid">
      <div class="tile tile-wide bg-darkblue" data-nav="#/manufacturer/catalog" style="cursor:pointer;">
        <div class="tile-badge">Master</div>
        <div class="tile-icon">📋</div>
        <div>
          <div class="tile-value">1,200</div>
          <div class="tile-label">SKUs in Catalog</div>
          <div class="tile-subtext">Maharashtra Distribution</div>
        </div>
      </div>
      <div class="tile tile-small bg-teal" data-nav="#/manufacturer/analytics" style="cursor:pointer;">
        <div class="tile-icon">📊</div>
        <div>
          <div class="tile-label">Analytics</div>
          <div class="tile-subtext">Sales by District</div>
        </div>
      </div>
      <div class="tile tile-small bg-green" data-nav="#/manufacturer/catalog" style="cursor:pointer;">
        <div class="tile-icon">🎯</div>
        <div>
          <div class="tile-value" style="font-size:22px;">6</div>
          <div class="tile-label">Active Promos</div>
          <div class="tile-subtext">Sponsored SKUs</div>
        </div>
      </div>
      <div class="tile tile-wide bg-blue" data-nav="#/manufacturer/analytics" style="cursor:pointer;">
        <div class="tile-icon">🚚</div>
        <div>
          <div class="tile-subtext">Primary Orders from Stockists</div>
          <div class="tile-value">34</div>
          <div class="tile-label">This Month • ₹48.5L</div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="action-btn action-btn--primary" data-nav="#/manufacturer/catalog">📋 Manage Catalog</button>
      <button class="action-btn action-btn--success" data-nav="#/manufacturer/analytics">📊 View Analytics</button>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const p = el.getAttribute('data-nav');
      if (p) navigate(p);
    });
  });
}
