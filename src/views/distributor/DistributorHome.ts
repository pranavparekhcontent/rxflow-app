/**
 * Distributor Home — Metro Live Tile Dashboard
 * Primary view for Stockists/Wholesalers
 */

import { navigate } from '../../engine/Router';

export default function DistributorHome(container: HTMLElement): void {
  container.innerHTML = `
    <!-- Sync Status -->
    <div class="sync-bar" style="margin-bottom:16px;">
      <div class="sync-bar__dot"></div>
      <span>Online • TallyPrime Synced: 2 min ago • 1,200 SKUs Active</span>
    </div>

    <!-- Dashboard Tiles -->
    <div class="section-title">live operations</div>
    <div class="metro-grid">

      <!-- New Orders Queue (Wide 2×1) -->
      <div class="tile tile-wide bg-blue" data-nav="#/distributor/orders" style="cursor:pointer;">
        <div class="tile-badge"><span class="pulse-dot"></span> Live</div>
        <div>
          <div class="tile-subtext">Today's Order Inbox</div>
          <div class="tile-value">12</div>
          <div class="tile-label">New Orders • ₹1.2L Total</div>
        </div>
        <div class="tile-bar-bg">
          <div class="tile-bar-fill" style="width:40%;"></div>
        </div>
      </div>

      <!-- FEFO Inventory (Small 1×1) -->
      <div class="tile tile-small bg-teal" data-nav="#/distributor/inventory" style="cursor:pointer;">
        <div class="tile-icon">📦</div>
        <div>
          <div class="tile-value" style="font-size:24px;">4,840</div>
          <div class="tile-label">Active Batches</div>
          <div class="tile-subtext">FEFO Ranked</div>
        </div>
      </div>

      <!-- Dead Stock Alert (Small 1×1) -->
      <div class="tile tile-small bg-amber" data-nav="#/distributor/dead-stock" style="cursor:pointer;">
        <div class="tile-badge">Alert</div>
        <div class="tile-icon">⚠️</div>
        <div>
          <div class="tile-value" style="font-size:24px;">26</div>
          <div class="tile-label">Dead Stock</div>
          <div class="tile-subtext">&lt;90d Expiry</div>
        </div>
      </div>

      <!-- Collections Today (Wide 2×1) -->
      <div class="tile tile-wide bg-green" data-nav="#/distributor/financials" style="cursor:pointer;">
        <div class="tile-badge">Today</div>
        <div>
          <div class="tile-subtext">Collections Received</div>
          <div class="tile-value">₹2.4L</div>
          <div class="tile-label">8 Payments • Cash + UPI</div>
        </div>
        <div class="tile-bar-bg">
          <div class="tile-bar-fill" style="width:65%;"></div>
        </div>
      </div>

      <!-- Credit Exposure (Small 1×1) -->
      <div class="tile tile-small bg-purple" data-nav="#/distributor/credit" style="cursor:pointer;">
        <div class="tile-icon">💳</div>
        <div>
          <div class="tile-value" style="font-size:22px;">₹18.5L</div>
          <div class="tile-label">Credit Out</div>
          <div class="tile-subtext">42 Retailers</div>
        </div>
      </div>

      <!-- TallyPrime Sync (Small 1×1) -->
      <div class="tile tile-small bg-slate" data-nav="#/distributor/erp" style="cursor:pointer;">
        <div class="tile-icon">⚙️</div>
        <div>
          <div class="tile-label">ERP Sync</div>
          <div class="tile-subtext"><span class="pulse-dot"></span> TallyPrime OK</div>
        </div>
      </div>

      <!-- Active Schemes (Small 1×1) -->
      <div class="tile tile-small bg-cyan" data-nav="#/distributor/schemes" style="cursor:pointer;">
        <div class="tile-icon">🎁</div>
        <div>
          <div class="tile-value" style="font-size:24px;">8</div>
          <div class="tile-label">Live Schemes</div>
          <div class="tile-subtext">3 Clearance Sales</div>
        </div>
      </div>

      <!-- Overdue Retailers (Small 1×1) -->
      <div class="tile tile-small bg-red" data-nav="#/distributor/credit" style="cursor:pointer;">
        <div class="tile-badge">Urgent</div>
        <div class="tile-icon">🔴</div>
        <div>
          <div class="tile-value" style="font-size:24px;">5</div>
          <div class="tile-label">Overdue</div>
          <div class="tile-subtext">₹3.2L Blocked</div>
        </div>
      </div>

    </div>

    <!-- Pending Orders -->
    <div class="section-title">incoming orders</div>
    <div class="metro-list">
      <div class="metro-item" data-nav="#/distributor/orders" style="cursor:pointer;">
        <div class="item-main">
          <div class="item-title">
            <span class="pulse-dot"></span>
            Rajesh Medical Store
            <span class="status-badge status-badge--pending">New</span>
          </div>
          <div class="item-sub">12 Items • Order #ORD-2026-4521 • 3 min ago</div>
        </div>
        <div class="item-price">
          <div class="price-main">₹18,450</div>
          <div class="price-sub">Approve →</div>
        </div>
      </div>
      <div class="metro-item metro-item--teal" data-nav="#/distributor/orders" style="cursor:pointer;">
        <div class="item-main">
          <div class="item-title">
            Ganesh Pharmacy
            <span class="status-badge status-badge--pending">New</span>
          </div>
          <div class="item-sub">8 Items • Order #ORD-2026-4520 • 15 min ago</div>
        </div>
        <div class="item-price">
          <div class="price-main">₹7,200</div>
          <div class="price-sub">Approve →</div>
        </div>
      </div>
      <div class="metro-item metro-item--green" data-nav="#/distributor/orders" style="cursor:pointer;">
        <div class="item-main">
          <div class="item-title">
            Sai Krupa Chemist
            <span class="status-badge status-badge--accepted">Accepted</span>
          </div>
          <div class="item-sub">15 Items • Order #ORD-2026-4519 • 1 hr ago • Dispatching</div>
        </div>
        <div class="item-price">
          <div class="price-main">₹24,800</div>
          <div class="price-sub" style="color:var(--tile-green);">Dispatched ✓</div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <button class="action-btn action-btn--primary" data-nav="#/distributor/orders">📋 Process Orders</button>
      <button class="action-btn action-btn--success" data-nav="#/distributor/inventory">📦 Manage Inventory</button>
      <button class="action-btn action-btn--warning" data-nav="#/distributor/credit">💳 Credit Control</button>
    </div>
  `;

  // Attach navigation handler to all interactive elements
  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const path = el.getAttribute('data-nav');
      if (path) navigate(path);
    });
  });
}
