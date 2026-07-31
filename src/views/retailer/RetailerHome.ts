/**
 * Retailer Home — Metro Live Tile Dashboard
 * The primary experience for chemists/medical store owners
 */

import { navigate } from '../../engine/Router';

export default function RetailerHome(container: HTMLElement): void {
  container.innerHTML = `
    <!-- Sync Status Bar -->
    <div class="sync-bar" style="margin-bottom:16px;">
      <div class="sync-bar__dot"></div>
      <span>Online • Last synced: just now • 200 SKUs cached</span>
    </div>

    <!-- Live Dashboard Tiles -->
    <div class="section-title">live dashboard tiles</div>
    <div class="metro-grid" id="retailer-tiles">

      <!-- Tile 1: Live Credit Availability (Wide 2×1) -->
      <div class="tile tile-wide bg-blue" data-nav="#/retailer/ledger" style="cursor:pointer;">
        <div class="tile-badge">Live Credit</div>
        <div>
          <div class="tile-subtext">Shrine Pharma Stockist</div>
          <div class="tile-value">₹85,400</div>
          <div class="tile-bar-bg">
            <div class="tile-bar-fill" style="width:85%;"></div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;width:100%;">
          <div class="tile-label">85% Credit Available</div>
          <span style="font-size:11px;opacity:0.8;">Limit: ₹1.0L</span>
        </div>
      </div>

      <!-- Tile 2: Smart Cart (Small 1×1) -->
      <div class="tile tile-small bg-teal" data-nav="#/retailer/cart" style="cursor:pointer;">
        <div class="tile-icon">🛒</div>
        <div>
          <div class="tile-value">3</div>
          <div class="tile-label"><span class="pulse-dot"></span> Active Cart</div>
          <div class="tile-subtext">₹4,280 Total</div>
        </div>
      </div>

      <!-- Tile 3: Voice / Slip AI (Small 1×1) -->
      <div class="tile tile-small bg-cyan" data-nav="#/retailer/voice" style="cursor:pointer;">
        <div class="tile-icon">🎙️</div>
        <div>
          <div class="tile-label">Voice / Slip AI</div>
          <div class="tile-subtext">Tap to record order</div>
        </div>
      </div>

      <!-- Tile 4: Smart Schemes (Small 1×1) -->
      <div class="tile tile-small bg-green" data-nav="#/retailer/schemes" style="cursor:pointer;">
        <div class="tile-badge">5 Active</div>
        <div class="tile-icon">🎁</div>
        <div>
          <div class="tile-label">Schemes</div>
          <div class="tile-subtext">Buy 10 Get 2 Free</div>
        </div>
      </div>

      <!-- Tile 5: Near Expiry FEFO (Small 1×1) -->
      <div class="tile tile-small bg-amber" data-nav="#/retailer/returns" style="cursor:pointer;">
        <div class="tile-badge">Alert</div>
        <div class="tile-icon">⚠️</div>
        <div>
          <div class="tile-value">4</div>
          <div class="tile-label">Near Expiry</div>
          <div class="tile-subtext">&lt; 60 Days FEFO</div>
        </div>
      </div>

      <!-- Tile 6: Schedule X & H Compliance (Wide 2×1) -->
      <div class="tile tile-wide bg-purple" data-nav="#/retailer/nppa" style="cursor:pointer;">
        <div class="tile-badge">FDA Verified</div>
        <div>
          <div class="tile-label">Schedule X & H Compliance</div>
          <div style="font-size:16px;font-weight:700;margin-top:4px;">Form 20F/21F Verified</div>
          <div class="tile-subtext">MH-MZ2-482019 • Expiry: Dec 2028</div>
        </div>
        <div class="tile-subtext" style="align-self:flex-end;">100% Compliant Order Desk →</div>
      </div>

      <!-- Tile 7: Offline POS Stock (Small 1×1) -->
      <div class="tile tile-small bg-slate" data-nav="#/retailer/pos" style="cursor:pointer;">
        <div class="tile-icon">⚡</div>
        <div>
          <div class="tile-label">POS Inventory</div>
          <div class="tile-subtext">200 SKUs Cached</div>
        </div>
      </div>

      <!-- Tile 8: GRN Delivery (Small 1×1) -->
      <div class="tile tile-small bg-darkblue" data-nav="#/retailer/grn" style="cursor:pointer;">
        <div class="tile-icon">📦</div>
        <div>
          <div class="tile-label">GRN Delivery</div>
          <div class="tile-subtext">1 Delivery Pending</div>
        </div>
      </div>

    </div>

    <!-- Frequently Ordered Medicines -->
    <div class="section-title">frequently ordered medicines</div>
    <div class="metro-list" id="retailer-products">
      
      <!-- Product 1 -->
      <div class="metro-item" data-nav="#/retailer/catalogue" style="cursor:pointer;">
        <div class="item-main">
          <div class="item-title">
            Augmentin 625 Duo Tablet
            <span class="item-tag">Schedule H1</span>
            <span class="item-tag item-tag--green">Scheme: 10+2</span>
          </div>
          <div class="item-sub">Amoxycillin + Clavulanic Acid • GSK • Batch AUG2026</div>
        </div>
        <div class="item-price">
          <div class="price-main">₹142.50 <span class="price-unit">PTR</span></div>
          <div class="price-sub">Order Now →</div>
        </div>
      </div>

      <!-- Product 2 -->
      <div class="metro-item metro-item--teal" data-nav="#/retailer/catalogue" style="cursor:pointer;">
        <div class="item-main">
          <div class="item-title">
            Pan-D Capsule
            <span class="item-tag">Fast Mover</span>
          </div>
          <div class="item-sub">Pantoprazole + Domperidone • Alkem • Batch PND441</div>
        </div>
        <div class="item-price">
          <div class="price-main">₹88.00 <span class="price-unit">PTR</span></div>
          <div class="price-sub">Order Now →</div>
        </div>
      </div>

      <!-- Product 3 -->
      <div class="metro-item metro-item--purple" data-nav="#/retailer/catalogue" style="cursor:pointer;">
        <div class="item-main">
          <div class="item-title">
            Alprazolam 0.5mg (Alprax)
            <span class="item-tag item-tag--red">Schedule X</span>
          </div>
          <div class="item-sub">Anxiolytic Narcotic • Torrent • Special Form 20F Lock</div>
        </div>
        <div class="item-price">
          <div class="price-main">₹42.10 <span class="price-unit">PTR</span></div>
          <div class="price-sub" style="color:#FF6666;">Order Now →</div>
        </div>
      </div>

      <!-- Product 4 -->
      <div class="metro-item metro-item--green" data-nav="#/retailer/catalogue" style="cursor:pointer;">
        <div class="item-main">
          <div class="item-title">
            Dolo 650 Tablet
            <span class="item-tag item-tag--green">₹2 Off</span>
          </div>
          <div class="item-sub">Paracetamol 650mg • Micro Labs • Batch DL2026</div>
        </div>
        <div class="item-price">
          <div class="price-main">₹26.80 <span class="price-unit">PTR</span></div>
          <div class="price-sub">Order Now →</div>
        </div>
      </div>

    </div>

    <!-- Quick Action Bar -->
    <div class="action-bar">
      <button class="action-btn action-btn--primary" data-nav="#/retailer/catalogue">🔍 Search Catalogue</button>
      <button class="action-btn action-btn--success" data-nav="#/retailer/cart">🛍️ Submit Cart Order</button>
      <button class="action-btn action-btn--warning" data-nav="#/retailer/ledger">📄 Ledger Statement</button>
    </div>

    <!-- Payment Reminders -->
    <div style="margin-top:24px;">
      <div class="section-title">payment reminders</div>
      <div class="metro-list">
        <div class="metro-item metro-item--amber" data-nav="#/retailer/reminders" style="cursor:pointer;">
          <div class="item-main">
            <div class="item-title">
              <span class="pulse-dot pulse-dot--warning"></span>
              Invoice #INV-2026-0847
              <span class="status-badge status-badge--overdue">Due Tomorrow</span>
            </div>
            <div class="item-sub">Shrine Pharma • Due: 30 Jul 2026</div>
          </div>
          <div class="item-price">
            <div class="price-main">₹12,450</div>
            <div class="price-sub" style="color:var(--tile-cyan);">Pay via UPI →</div>
          </div>
        </div>
        <div class="metro-item" data-nav="#/retailer/reminders" style="cursor:pointer;">
          <div class="item-main">
            <div class="item-title">
              Invoice #INV-2026-0832
              <span class="status-badge status-badge--pending">3 Days Left</span>
            </div>
            <div class="item-sub">Medico Distributors • Due: 01 Aug 2026</div>
          </div>
          <div class="item-price">
            <div class="price-main">₹8,200</div>
            <div class="price-sub" style="color:var(--tile-cyan);">Pay via UPI →</div>
          </div>
        </div>
      </div>
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
