/**
 * RxFlow Manufacturer Operations Hub — Metro Live Tile Cards v3.0
 * Primary view for Manufacturers M1-M10 & Brands B1-B30
 */

import { navigate } from '../../engine/Router';
import { MANUFACTURERS } from '../../data/mockDataStore';

export default function ManufacturerHome(container: HTMLElement): void {
  const currentMfg = MANUFACTURERS[0]; // Manufacturer M1

  container.innerHTML = `
    <!-- Top Header Bar with Calligraphic Logo -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; background:var(--bg-card); border:1px solid var(--border-subtle); padding:10px 16px; border-radius:4px; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.hash='#/manufacturer/home'">
        <img src="/rxflow-logo.png" alt="RxFlow Logo" style="height:52px; width:auto; object-fit:contain; filter:drop-shadow(0 3px 12px rgba(0,120,215,0.5));" />
        <span style="font-size:10px; font-weight:900; color:var(--tile-cyan); background:rgba(0,183,195,0.15); padding:2px 6px; border-radius:4px;">MANUFACTURER</span>
      </div>
      <div class="sync-bar" style="margin:0;">
        <div class="sync-bar__dot"></div>
        <span>Online • ${currentMfg.name} • 30 Master Brands B1-B30</span>
      </div>
    </div>

    <div class="section-title">Manufacturer Operations (${currentMfg.name})</div>
    <div class="metro-grid">
      <!-- Card 1: Master Catalog -->
      <div class="tile tile-wide bg-darkblue" data-nav="#/manufacturer/catalog" style="cursor:pointer;">
        <div class="tile-badge">Master</div>
        <div class="tile-icon">📋</div>
        <div>
          <div class="tile-value">30</div>
          <div class="tile-label">Brands (B1..B30) in Master Catalog</div>
          <div class="tile-subtext">Manufacturers M1-M10 Active</div>
        </div>
      </div>

      <!-- Card 2: Market Analytics -->
      <div class="tile tile-small bg-teal" data-nav="#/manufacturer/analytics" style="cursor:pointer;">
        <div class="tile-icon">📊</div>
        <div>
          <div class="tile-label">Analytics</div>
          <div class="tile-subtext">Sales across D1..D10</div>
        </div>
      </div>

      <!-- Card 3: Brand Promotions -->
      <div class="tile tile-small bg-green" data-nav="#/manufacturer/catalog" style="cursor:pointer;">
        <div class="tile-icon">🎯</div>
        <div>
          <div class="tile-value" style="font-size:22px;">10</div>
          <div class="tile-label">Promotions</div>
          <div class="tile-subtext">Distributor Schemes D1-D10</div>
        </div>
      </div>

      <!-- Card 4: Primary Orders -->
      <div class="tile tile-wide bg-blue" data-nav="#/manufacturer/analytics" style="cursor:pointer;">
        <div class="tile-icon">🚚</div>
        <div>
          <div class="tile-subtext">Primary Orders from Stockists D1-D10</div>
          <div class="tile-value">10</div>
          <div class="tile-label">Active Primary Orders • ₹48.5L</div>
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
