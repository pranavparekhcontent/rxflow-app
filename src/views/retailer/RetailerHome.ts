/**
 * Retailer Home — Metro Live Tile Hub v3.0
 * Arranges all retailer features as interactive Metro Cards.
 */

import { navigate } from '../../engine/Router';
import { RETAILERS, DISTRIBUTORS, PRODUCTS } from '../../data/mockDataStore';

export default function RetailerHome(container: HTMLElement): void {
  const currentRet = RETAILERS[0]; // Retailer R1
  const currentDist = DISTRIBUTORS[0]; // Distributor D1
  const featuredProds = PRODUCTS.slice(0, 4);

  container.innerHTML = `
    <!-- Sync Status Bar -->
    <div class="sync-bar" style="margin-bottom:16px;">
      <div class="sync-bar__dot"></div>
      <span>Online • Logged in as ${currentRet.name} • 30 Brands B1-B30 Cached</span>
    </div>

    <!-- Retailer Operations Cards Hub -->
    <div class="section-title">Retailer Operations (${currentRet.name})</div>
    <div class="metro-grid" id="retailer-tiles">

      <!-- Card 1: Live Credit Line -->
      <div class="tile tile-wide bg-blue" data-nav="#/retailer/ledger" style="cursor:pointer;">
        <div class="tile-badge">Live Credit</div>
        <div>
          <div class="tile-subtext">${currentDist.name}</div>
          <div class="tile-value">₹85,000</div>
          <div class="tile-bar-bg">
            <div class="tile-bar-fill" style="width:85%;"></div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;width:100%;">
          <div class="tile-label">85% Credit Line Available</div>
          <span style="font-size:11px;opacity:0.8;">Limit: ₹1,00,000</span>
        </div>
      </div>

      <!-- Card 2: Catalogue Search -->
      <div class="tile tile-small bg-blue" data-nav="#/retailer/catalogue" style="cursor:pointer;">
        <div class="tile-icon">🔍</div>
        <div>
          <div class="tile-label">Catalogue</div>
          <div class="tile-subtext">30 Brands B1-B30</div>
        </div>
      </div>

      <!-- Card 3: Smart Cart -->
      <div class="tile tile-small bg-teal" data-nav="#/retailer/cart" style="cursor:pointer;">
        <div class="tile-icon">🛒</div>
        <div>
          <div class="tile-value">3</div>
          <div class="tile-label"><span class="pulse-dot"></span> Smart Cart</div>
          <div class="tile-subtext">₹4,280 Total</div>
        </div>
      </div>

      <!-- Card 4: Voice / Slip AI -->
      <div class="tile tile-small bg-cyan" data-nav="#/retailer/voice" style="cursor:pointer;">
        <div class="tile-icon">🎙️</div>
        <div>
          <div class="tile-label">Voice / Slip AI</div>
          <div class="tile-subtext">Tap to record order</div>
        </div>
      </div>

      <!-- Card 5: Orders -->
      <div class="tile tile-small bg-slate" data-nav="#/retailer/orders" style="cursor:pointer;">
        <div class="tile-badge">Live</div>
        <div class="tile-icon">📋</div>
        <div>
          <div class="tile-value">2</div>
          <div class="tile-label">My Orders</div>
          <div class="tile-subtext">Tracking Dispatch</div>
        </div>
      </div>

      <!-- Card 6: GRN Delivery -->
      <div class="tile tile-small bg-darkblue" data-nav="#/retailer/grn" style="cursor:pointer;">
        <div class="tile-icon">📦</div>
        <div>
          <div class="tile-label">GRN Delivery</div>
          <div class="tile-subtext">1 Delivery Pending</div>
        </div>
      </div>

      <!-- Card 7: POS Stock -->
      <div class="tile tile-small bg-purple" data-nav="#/retailer/pos" style="cursor:pointer;">
        <div class="tile-icon">⚡</div>
        <div>
          <div class="tile-label">POS Stock</div>
          <div class="tile-subtext">Offline Inventory</div>
        </div>
      </div>

      <!-- Card 8: Ledger -->
      <div class="tile tile-small bg-blue" data-nav="#/retailer/ledger" style="cursor:pointer;">
        <div class="tile-icon">📄</div>
        <div>
          <div class="tile-label">Ledger</div>
          <div class="tile-subtext">Statement & Bills</div>
        </div>
      </div>

      <!-- Card 9: Pay UPI -->
      <div class="tile tile-small bg-amber" data-nav="#/retailer/reminders" style="cursor:pointer;">
        <div class="tile-badge">Alert</div>
        <div class="tile-icon">💳</div>
        <div>
          <div class="tile-label">Pay UPI</div>
          <div class="tile-subtext">1-Tap Payment</div>
        </div>
      </div>

      <!-- Card 10: Schemes -->
      <div class="tile tile-small bg-green" data-nav="#/retailer/schemes" style="cursor:pointer;">
        <div class="tile-badge">10 Active</div>
        <div class="tile-icon">🎁</div>
        <div>
          <div class="tile-label">Schemes</div>
          <div class="tile-subtext">Distributor D1..D10</div>
        </div>
      </div>

      <!-- Card 11: Returns -->
      <div class="tile tile-small bg-red" data-nav="#/retailer/returns" style="cursor:pointer;">
        <div class="tile-badge">Alert</div>
        <div class="tile-icon">⚠️</div>
        <div>
          <div class="tile-value">4</div>
          <div class="tile-label">Returns</div>
          <div class="tile-subtext">&lt; 60 Days FEFO</div>
        </div>
      </div>

      <!-- Card 12: Schedule X, H & M Compliance -->
      <div class="tile tile-wide bg-purple" data-nav="#/retailer/nppa" style="cursor:pointer;">
        <div class="tile-badge">FDA Verified</div>
        <div>
          <div class="tile-label">Schedule X, H1 & M Compliance</div>
          <div style="font-size:15px;font-weight:700;margin-top:4px;">${currentRet.name} • Form 20B/21B</div>
          <div class="tile-subtext">${currentRet.dlNumber} • Pune</div>
        </div>
        <div class="tile-subtext" style="align-self:flex-end;">100% Compliant Desk →</div>
      </div>

      <!-- Card 13: Stockist Map Locator -->
      <div class="tile tile-small bg-teal" data-nav="#/retailer/locator" style="cursor:pointer;">
        <div class="tile-icon">🗺️</div>
        <div>
          <div class="tile-label">Stockist Map</div>
          <div class="tile-subtext">Distributors D1..D10</div>
        </div>
      </div>

    </div>

    <!-- Frequently Ordered Medicines -->
    <div class="section-title">Frequently Ordered Medicines (Brands B1-B30)</div>
    <div class="metro-list" id="retailer-products">
      ${featuredProds.map(p => `
        <div class="metro-item" data-nav="#/retailer/catalogue" style="cursor:pointer;">
          <div class="item-main">
            <div class="item-title">
              ${p.brandName}
              <span class="item-tag">${p.category}</span>
              ${p.schemeTag ? `<span class="item-tag item-tag--green">${p.schemeTag}</span>` : ''}
            </div>
            <div class="item-sub">${p.genericSalt} • ${p.manufacturerName} • ${p.packSize}</div>
          </div>
          <div class="item-price">
            <div class="price-main">₹${p.ptr.toFixed(2)} <span class="price-unit">PTR</span></div>
            <div class="price-sub">Order Now →</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Quick Action Cards Bar -->
    <div class="action-bar" style="margin-top:16px;">
      <button class="action-btn action-btn--primary" data-nav="#/retailer/catalogue">🔍 Search Catalogue</button>
      <button class="action-btn action-btn--success" data-nav="#/retailer/cart">🛍️ Submit Cart Order</button>
      <button class="action-btn action-btn--warning" data-nav="#/retailer/ledger">📄 Ledger Statement</button>
    </div>

    <!-- Payment Reminders -->
    <div style="margin-top:24px;">
      <div class="section-title">Payment Reminders (Distributors D1 & D2)</div>
      <div class="metro-list">
        <div class="metro-item metro-item--amber" data-nav="#/retailer/reminders" style="cursor:pointer;">
          <div class="item-main">
            <div class="item-title">
              <span class="pulse-dot pulse-dot--warning"></span>
              Invoice #INV-2026-D1-001
              <span class="status-badge status-badge--overdue">Due Tomorrow</span>
            </div>
            <div class="item-sub">${DISTRIBUTORS[0].name} • Due: 01 Aug 2026</div>
          </div>
          <div class="item-price">
            <div class="price-main">₹14,500</div>
            <div class="price-sub" style="color:var(--tile-cyan);">Pay via UPI →</div>
          </div>
        </div>
        <div class="metro-item" data-nav="#/retailer/reminders" style="cursor:pointer;">
          <div class="item-main">
            <div class="item-title">
              Invoice #INV-2026-D2-002
              <span class="status-badge status-badge--pending">3 Days Left</span>
            </div>
            <div class="item-sub">${DISTRIBUTORS[1].name} • Due: 03 Aug 2026</div>
          </div>
          <div class="item-price">
            <div class="price-main">₹8,900</div>
            <div class="price-sub" style="color:var(--tile-cyan);">Pay via UPI →</div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const path = el.getAttribute('data-nav');
      if (path) navigate(path);
    });
  });
}
