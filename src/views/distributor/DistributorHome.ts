/**
 * Distributor Operations Hub — Metro Live Tile Cards v3.0
 * Primary view for Stockists/Wholesalers D1-D10 & Retailers R1-R10
 */

import { navigate } from '../../engine/Router';
import { RETAILERS, DISTRIBUTORS } from '../../data/mockDataStore';

export default function DistributorHome(container: HTMLElement): void {
  const currentDist = DISTRIBUTORS[0]; // Distributor D1

  container.innerHTML = `
    <!-- Sync Status -->
    <div class="sync-bar" style="margin-bottom:16px;">
      <div class="sync-bar__dot"></div>
      <span>Online • ${currentDist.name} • TallyPrime Synced: 2 min ago</span>
    </div>

    <!-- Operations Hub Tiles -->
    <div class="section-title">Distributor Operations (${currentDist.name})</div>
    <div class="metro-grid">

      <!-- Card 1: New Orders Queue -->
      <div class="tile tile-wide bg-blue" data-nav="#/distributor/orders" style="cursor:pointer;">
        <div class="tile-badge"><span class="pulse-dot"></span> Live</div>
        <div>
          <div class="tile-subtext">Today's Order Inbox</div>
          <div class="tile-value">10</div>
          <div class="tile-label">Orders from Retailers R1-R10 • ₹1.8L Total</div>
        </div>
        <div class="tile-bar-bg">
          <div class="tile-bar-fill" style="width:50%;"></div>
        </div>
      </div>

      <!-- Card 2: FEFO Stock Allocation -->
      <div class="tile tile-small bg-teal" data-nav="#/distributor/accept-order" style="cursor:pointer;">
        <div class="tile-icon">✅</div>
        <div>
          <div class="tile-label">FEFO Approval</div>
          <div class="tile-subtext">Approve Batches</div>
        </div>
      </div>

      <!-- Card 3: FEFO Inventory -->
      <div class="tile tile-small bg-cyan" data-nav="#/distributor/inventory" style="cursor:pointer;">
        <div class="tile-icon">📦</div>
        <div>
          <div class="tile-value" style="font-size:24px;">30</div>
          <div class="tile-label">Inventory</div>
          <div class="tile-subtext">Brands B1-B30</div>
        </div>
      </div>

      <!-- Card 4: Dead Stock Alert -->
      <div class="tile tile-small bg-amber" data-nav="#/distributor/dead-stock" style="cursor:pointer;">
        <div class="tile-badge">Alert</div>
        <div class="tile-icon">⚠️</div>
        <div>
          <div class="tile-value" style="font-size:24px;">20</div>
          <div class="tile-label">Dead Stock</div>
          <div class="tile-subtext">Schedule H/X/M</div>
        </div>
      </div>

      <!-- Card 5: Batch Recall Desk -->
      <div class="tile tile-small bg-red" data-nav="#/distributor/recall" style="cursor:pointer;">
        <div class="tile-icon">🚨</div>
        <div>
          <div class="tile-label">Batch Recall</div>
          <div class="tile-subtext">FDA Quality Alert</div>
        </div>
      </div>

      <!-- Card 6: Collections & Financials -->
      <div class="tile tile-wide bg-green" data-nav="#/distributor/financials" style="cursor:pointer;">
        <div class="tile-badge">Today</div>
        <div>
          <div class="tile-subtext">Collections Received</div>
          <div class="tile-value">₹2.4L</div>
          <div class="tile-label">10 Retailers R1..R10 • UPI + Cash</div>
        </div>
        <div class="tile-bar-bg">
          <div class="tile-bar-fill" style="width:65%;"></div>
        </div>
      </div>

      <!-- Card 7: Credit Control -->
      <div class="tile tile-small bg-purple" data-nav="#/distributor/credit" style="cursor:pointer;">
        <div class="tile-icon">💳</div>
        <div>
          <div class="tile-value" style="font-size:22px;">10 Lines</div>
          <div class="tile-label">Credit Control</div>
          <div class="tile-subtext">Retailers R1..R10</div>
        </div>
      </div>

      <!-- Card 8: TallyPrime ERP Sync -->
      <div class="tile tile-small bg-slate" data-nav="#/distributor/erp" style="cursor:pointer;">
        <div class="tile-icon">⚙️</div>
        <div>
          <div class="tile-label">Tally Sync</div>
          <div class="tile-subtext"><span class="pulse-dot"></span> ERP Online</div>
        </div>
      </div>

      <!-- Card 9: Schemes Builder -->
      <div class="tile tile-small bg-cyan" data-nav="#/distributor/schemes" style="cursor:pointer;">
        <div class="tile-icon">🎁</div>
        <div>
          <div class="tile-value" style="font-size:24px;">10</div>
          <div class="tile-label">Schemes</div>
          <div class="tile-subtext">D1..D10 Offers</div>
        </div>
      </div>

    </div>

    <!-- Incoming Orders List -->
    <div class="section-title">Incoming Retailer Orders</div>
    <div class="metro-list">
      ${RETAILERS.slice(0, 3).map((ret, i) => `
        <div class="metro-item ${i === 0 ? '' : i === 1 ? 'metro-item--teal' : 'metro-item--green'}" data-nav="#/distributor/orders" style="cursor:pointer;">
          <div class="item-main">
            <div class="item-title">
              <span class="pulse-dot"></span>
              ${ret.name}
              <span class="item-tag">${ret.city}</span>
            </div>
            <div class="item-sub">Order #ORD-2026-00${i + 1} • ${(i + 1) * 12} SKUs • ${currentDist.name}</div>
          </div>
          <div class="item-price">
            <div class="price-main">₹${((i + 1) * 14500).toLocaleString('en-IN')}</div>
            <div class="price-sub">Review Order →</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Quick Action Cards Bar -->
    <div class="action-bar" style="margin-top:20px;">
      <button class="action-btn action-btn--primary" data-nav="#/distributor/orders">📋 View Order Queue</button>
      <button class="action-btn action-btn--success" data-nav="#/distributor/accept-order">✅ FEFO Batch Approve</button>
      <button class="action-btn action-btn--warning" data-nav="#/distributor/credit">💳 Manage Credit Lines</button>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const path = el.getAttribute('data-nav');
      if (path) navigate(path);
    });
  });
}
