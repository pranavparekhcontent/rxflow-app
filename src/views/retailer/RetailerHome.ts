/**
 * Retailer Home — Metro Live Tile Hub v3.0
 * 100% Faithful Implementation of Retailer Dashboard Blueprint (WhatsApp Image Spec)
 * Wired with Interactive Modals, PWA Installation Guide, News Flow, Credit Control, Order Flow, & Tally Bridge.
 */

import { navigate } from '../../engine/Router';
import { AuthStore } from '../../engine/AuthStore';
import { RETAILERS, DISTRIBUTORS } from '../../data/mockDataStore';
import { NotificationEngine } from '../../engine/NotificationEngine';
import { BasketStore } from '../../store/BasketStore';

export default function RetailerHome(container: HTMLElement): void {
  const currentRet = RETAILERS[0]; // Retailer R1 (MedPlus Chemist)
  const currentDist = DISTRIBUTORS[0]; // Distributor D1 (Medico Pharma)
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  container.innerHTML = `
    <!-- Top Blueprint Title Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:2px solid var(--tile-blue); padding-bottom:6px;">
      <h1 style="font-size:24px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--text-primary); margin:0;">
        Retailer's Dashboard
      </h1>
      <span style="font-size:11px; font-weight:700; color:var(--tile-cyan); background:rgba(0,183,195,0.15); padding:2px 8px; border-radius:4px;">
        Blueprint v3.0
      </span>
    </div>

    <!-- Header Section (Single Clean Horizontal Metro Tile Bar) -->
    <div class="blueprint-header-bar">
      <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.hash='#/retailer/home'">
          <img src="/rxflow-logo.png" alt="RxFlow Logo" style="height:56px; width:auto; object-fit:contain; filter:drop-shadow(0 3px 12px rgba(0,120,215,0.5));" />
          <span style="font-size:11px; font-weight:900; color:var(--tile-cyan); background:rgba(0,183,195,0.15); padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.8px;">PWA</span>
        </div>

        <!-- Combined Status & Last Sync Date/Time Widget -->
        <div class="hdr-status-sync-block">
          <div class="hdr-online-status">
            <span class="hdr-online-dot"></span> ONLINE
          </div>
          <span style="color:rgba(255,255,255,0.3); font-size:10px;">•</span>
          <div class="hdr-sync-badge">
            ⏱️ Last sync: ${dateStr} • ${timeStr}
          </div>
        </div>
      </div>

      <!-- Right Controls: Single Horizontal Line -->
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <button class="theme-toggle-btn" id="header-theme-toggle" style="position:static; padding:6px 12px; font-size:11px; font-weight:800; border-radius:4px;">
          🌓 Theme
        </button>

        <button class="hdr-install-btn" id="btn-how-to-install" style="border-radius:4px; padding:6px 12px; font-size:11px; font-weight:800;">
          📱 How to Install App
        </button>

        <div class="hdr-user-pill" id="btn-user-profile" title="Click to view chemist profile & drug licenses">
          👤 Logged in as '${currentRet.code}' (${currentRet.name.split(' ')[0]})
        </div>

        <button class="hdr-logout-btn" id="btn-logout">
          🚪 Log out
        </button>
      </div>
    </div>

    <!-- NEWS FLOW Ticker (Expiry, Total Credits Overdue, etc.) -->
    <div class="news-flow-container">
      <div class="news-flow-ticker">
        <div class="news-ticker-content">
          <span class="news-item" data-nav="#/retailer/returns">
            ⚠️ <strong>EXPIRY ALERT:</strong> 4 Items valued at ₹12,450 expiring in &lt; 60 days (FEFO Return Action Required)
          </span>
          <span class="news-item" id="news-overdue-trigger">
            💳 <strong>OVERDUE CREDIT:</strong> Invoice #INV-2026-D1-001 (₹14,500) due from ${currentDist.name}
          </span>
          <span class="news-item" data-nav="#/retailer/schemes">
            🎁 <strong>NEW SCHEME:</strong> Buy 10 Get 2 Free on Brand B3 (Calpol 650) from Distributor D2
          </span>
          <span class="news-item" id="news-fda-trigger">
            📜 <strong>FDA COMPLIANCE:</strong> Form 20B/21B Drug License Audit Desk Verified (Pune Zone)
          </span>
          <span class="news-item" data-nav="#/retailer/orders">
            🚚 <strong>ORDER DISPATCH:</strong> Order #ORD-8821 Dispatched via Speed Logistics (ETA Today 4 PM)
          </span>
        </div>
      </div>
    </div>

    <!-- Credit Line & Side-by-Side Invoices/Expiry Section -->
    <div class="credit-overview-grid">
      <!-- Left Card: Total Credit in Market (LIVE) -->
      <div class="credit-card-live">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; opacity:0.9;">
              Total Credit in Market
            </div>
            <div style="font-size:32px; font-weight:900; margin:4px 0;">
              ₹85,000 <span style="font-size:16px; font-weight:600; opacity:0.8;">/ ₹1,00,000</span>
            </div>
          </div>
          <span style="background:rgba(255,255,255,0.25); color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:10px; letter-spacing:1px;">
            LIVE
          </span>
        </div>

        <div style="margin:10px 0;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px; font-weight:600;">
            <span>85% Credit Utilized</span>
            <span>₹15,000 Available Line</span>
          </div>
          <div class="tile-bar-bg" style="height:8px; background:rgba(0,0,0,0.3);">
            <div class="tile-bar-fill" style="width:85%; background:linear-gradient(90deg, #34D399, #FBBF24);"></div>
          </div>
        </div>

        <button class="distributor-select-btn" id="btn-select-distributor">
          <span>🔍 Check Distributor-wise Credit</span>
          <span>▼</span>
        </button>
      </div>

      <!-- Right Side: 2 Side-by-Side Cards (Overdue Invoices & Expired Items) -->
      <div class="side-by-side-cards">
        <!-- Card 1: Overdue Invoices -->
        <div class="summary-card summary-card--overdue" id="card-overdue-invoices">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="font-size:26px;">📋</div>
            <span style="background:rgba(0,0,0,0.3); font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; text-transform:uppercase;">
              2 Pending
            </span>
          </div>
          <div>
            <div style="font-size:20px; font-weight:900; line-height:1.1;">Overdue Invoices</div>
            <div style="font-size:13px; font-weight:700; margin-top:4px; color:#FDE68A;">₹23,400 Total</div>
            <div style="font-size:11px; opacity:0.85; margin-top:2px;">Tap to Pay via UPI →</div>
          </div>
        </div>

        <!-- Card 2: Expired Items -->
        <div class="summary-card summary-card--expired" data-nav="#/retailer/returns">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="font-size:26px;">⚠️</div>
            <span style="background:rgba(0,0,0,0.3); font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; text-transform:uppercase;">
              4 Items
            </span>
          </div>
          <div>
            <div style="font-size:20px; font-weight:900; line-height:1.1;">Expired Items</div>
            <div style="font-size:13px; font-weight:700; margin-top:4px; color:#FECACA;">₹12,450 Value</div>
            <div style="font-size:11px; opacity:0.85; margin-top:2px;">FEFO Return Desk →</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Status Flow Bar (Place Orders -> Orders Dispatched -> Order Received) -->
    <div class="order-flow-section">
      <div class="order-flow-title">📦 Live Order Execution Pipeline</div>
      <div class="order-flow-bar">
        <!-- Step 1: Place Orders -->
        <div class="order-flow-step" data-nav="#/retailer/cart" title="Go to Smart Cart">
          <div class="order-flow-step__icon" style="background:rgba(0,120,215,0.2); color:var(--tile-blue);">
            🛒
          </div>
          <div class="order-flow-step__info">
            <div class="order-flow-step__label">Place Orders</div>
            <div class="order-flow-step__sub">3 Items in Cart (₹4,280)</div>
          </div>
        </div>

        <div class="order-flow-arrow">➔</div>

        <!-- Step 2: Orders Dispatched -->
        <div class="order-flow-step active" data-nav="#/retailer/orders" title="View Dispatched Orders">
          <div class="order-flow-step__icon" style="background:rgba(216,59,1,0.2); color:var(--tile-amber);">
            🚚
          </div>
          <div class="order-flow-step__info">
            <div class="order-flow-step__label">Orders Dispatched</div>
            <div class="order-flow-step__sub">2 Orders Out for Delivery</div>
          </div>
        </div>

        <div class="order-flow-arrow">➔</div>

        <!-- Step 3: Order Received (GRN) -->
        <div class="order-flow-step" data-nav="#/retailer/grn" title="GRN Delivery Confirmation">
          <div class="order-flow-step__icon" style="background:rgba(16,124,65,0.2); color:var(--tile-green);">
            📦
          </div>
          <div class="order-flow-step__info">
            <div class="order-flow-step__label">Order Received</div>
            <div class="order-flow-step__sub">1 GRN Pending Confirmation</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main 2-Column Action Blueprint Grid -->
    <div class="blueprint-grid-title">⚡ Retailer Action Grid (Blueprint Spec)</div>
    <div class="blueprint-main-columns">

      <!-- LEFT COLUMN: Place Orders (Catalogue & Schemes side-by-side, then Map, then Compliance) -->
      <div class="blueprint-column">
        <!-- Row 1: Catalogue & Schemes (Side-by-Side) -->
        <div class="blueprint-subgrid">
          <!-- Catalogue / search medicines -->
          <div class="blueprint-card bg-blue" data-nav="#/retailer/catalogue">
            <div>
              <div class="blueprint-card__title" style="font-size:16px;">Catalogue</div>
              <div class="blueprint-card__sub">Search medicines & 30 Brands</div>
            </div>
            <div style="font-size:24px;">🔍</div>
          </div>

          <!-- Schemes -->
          <div class="blueprint-card bg-teal" data-nav="#/retailer/schemes">
            <span class="tile-badge" style="background:rgba(0,0,0,0.3);">10 Active</span>
            <div>
              <div class="blueprint-card__title" style="font-size:16px;">Schemes</div>
              <div class="blueprint-card__sub">Bonus deals & margins</div>
            </div>
            <div style="font-size:24px;">🎁</div>
          </div>
        </div>

        <!-- Row 2: Distributor's Map (Wide) -->
        <div class="blueprint-card bg-darkblue" data-nav="#/retailer/locator">
          <div>
            <div class="blueprint-card__title">Distributor's Map</div>
            <div class="blueprint-card__sub">Pharma stockist locator & delivery routes</div>
          </div>
          <div style="font-size:28px;">🗺️</div>
        </div>

        <!-- Row 3: Schedules X, H, & M Compliance - Form 20B/21B (Wide) -->
        <div class="blueprint-card bg-purple" id="btn-fda-compliance">
          <span class="tile-badge" style="background:#107C41;">FDA Verified</span>
          <div>
            <div class="blueprint-card__title" style="font-size:16px;">Schedules X, H & M Compliance</div>
            <div class="blueprint-card__sub">Form 20B/21B license audit & drug registers</div>
          </div>
          <div style="font-size:28px;">📜</div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Orders Dispatched & Received (Inventory & GRN side-by-side, Invoices & Pay UPI, Ledger & Tally) -->
      <div class="blueprint-column">
        <!-- Row 1: Inventory / Stock & GRN Delivery Confirmation (Side-by-Side) -->
        <div class="blueprint-subgrid">
          <!-- Inventory / Stock -->
          <div class="blueprint-card bg-slate" data-nav="#/retailer/pos">
            <div>
              <div class="blueprint-card__title" style="font-size:15px;">Inventory / Stock</div>
              <div class="blueprint-card__sub">POS offline stock & barcode</div>
            </div>
            <div style="font-size:24px;">⚡</div>
          </div>

          <!-- GRN Delivery Confirmation / Returns -->
          <div class="blueprint-card bg-cyan" data-nav="#/retailer/grn">
            <div>
              <div class="blueprint-card__title" style="font-size:15px;">GRN Delivery Confirmation</div>
              <div class="blueprint-card__sub">Confirm physical goods & returns</div>
            </div>
            <div style="font-size:24px;">📦</div>
          </div>
        </div>

        <!-- Row 2: Invoices & Pay by UPI (Side-by-Side) -->
        <div class="blueprint-subgrid">
          <!-- Invoices -->
          <div class="blueprint-card bg-blue" data-nav="#/retailer/orders">
            <div>
              <div class="blueprint-card__title" style="font-size:16px;">Invoices</div>
              <div class="blueprint-card__sub">Tax invoices & billing history</div>
            </div>
            <div style="font-size:24px;">📄</div>
          </div>

          <!-- Pay by UPI -->
          <div class="blueprint-card bg-amber" id="btn-pay-upi">
            <span class="tile-badge" style="background:#DC2626;">Instant</span>
            <div>
              <div class="blueprint-card__title" style="font-size:16px;">Pay by UPI</div>
              <div class="blueprint-card__sub">1-Tap GPay / PhonePe / Paytm</div>
            </div>
            <div style="font-size:24px;">💳</div>
          </div>
        </div>

        <!-- Row 3: Ledger Statement & Tally (Side-by-Side) -->
        <div class="blueprint-subgrid">
          <!-- Ledger Statement -->
          <div class="blueprint-card bg-green" data-nav="#/retailer/ledger">
            <div>
              <div class="blueprint-card__title" style="font-size:15px;">Ledger Statement</div>
              <div class="blueprint-card__sub">Account statements & notes</div>
            </div>
            <div style="font-size:24px;">📊</div>
          </div>

          <!-- Tally -->
          <div class="blueprint-card bg-purple" id="btn-tally-sync">
            <span class="tile-badge" style="background:#0078D7;">ERP Bridge</span>
            <div>
              <div class="blueprint-card__title" style="font-size:16px;">Tally</div>
              <div class="blueprint-card__sub">Export XML/JSON vouchers</div>
            </div>
            <div style="font-size:24px;">🔄</div>
          </div>
        </div>
      </div>

    </div>


    <!-- Modal Container -->
    <div id="retailer-modal-container"></div>
  `;

  // Attach Event Handlers
  attachDashboardHandlers(container, currentRet, currentDist);
}

/**
 * Event Handlers & Modal Controllers
 */
function attachDashboardHandlers(container: HTMLElement, currentRet: any, currentDist: any): void {
  // Navigation elements
  container.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const path = el.getAttribute('data-nav');
      if (path) navigate(path);
    });
  });

  // Theme toggle button
  document.getElementById('header-theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('rxflow-theme', next);
    NotificationEngine.showToast(`Theme switched to ${next.toUpperCase()} mode`, 'info');
  });

  // Logout button
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    AuthStore.logout();
  });

  // 1. "How to Install App" Modal (Smart Attendance App Pattern)
  document.getElementById('btn-how-to-install')?.addEventListener('click', () => {
    openInstallAppModal(container);
  });

  // 2. Retailer Profile Modal
  document.getElementById('btn-user-profile')?.addEventListener('click', () => {
    openChemistProfileModal(container, currentRet);
  });

  // 3. Distributor Credit Selector Modal
  document.getElementById('btn-select-distributor')?.addEventListener('click', () => {
    openDistributorCreditModal(container, currentRet);
  });

  // 4. Overdue Invoices Breakdown & List Modal (Card & Overdue Trigger)
  document.getElementById('btn-pay-upi')?.addEventListener('click', () => {
    openOverdueInvoicesListModal(container, currentRet);
  });
  document.getElementById('card-overdue-invoices')?.addEventListener('click', () => {
    openOverdueInvoicesListModal(container, currentRet);
  });
  document.getElementById('news-overdue-trigger')?.addEventListener('click', () => {
    openOverdueInvoicesListModal(container, currentRet);
  });

  // 5. Tally ERP Sync Modal
  document.getElementById('btn-tally-sync')?.addEventListener('click', () => {
    openTallySyncModal(container);
  });

  // 6. FDA Compliance Modal
  document.getElementById('btn-fda-compliance')?.addEventListener('click', () => {
    openFdaComplianceModal(container, currentRet);
  });
  document.getElementById('news-fda-trigger')?.addEventListener('click', () => {
    openFdaComplianceModal(container, currentRet);
  });
}

// ==========================================================================
// MODAL DIALOG CONTROLLERS
// ==========================================================================

/**
 * 1. "How to Install App" Modal (Smart Attendance PWA Pattern)
 */
function openInstallAppModal(container: HTMLElement): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

  modalContainer.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box">
        <div class="rx-modal-header">
          <div class="rx-modal-title">
            <span style="font-size:24px;">📱</span> How to Install RxFlow App
          </div>
          <button class="rx-modal-close" id="modal-close">✕</button>
        </div>

        ${isStandalone ? `
          <div style="background:rgba(16,124,65,0.2); border:1px solid #107C41; color:#34D399; padding:12px 16px; border-radius:8px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:10px;">
            <span>✅</span> RxFlow is already installed and running in Standalone PWA Mode!
          </div>
        ` : ''}

        <div style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">
          Install RxFlow PWA on your phone or desktop to place offline pharma orders, receive real-time push notifications, and access your stock anytime without a browser address bar.
        </div>

        <!-- Device Selector Tabs -->
        <div class="install-tabs">
          <button class="install-tab-btn active" id="tab-android">🤖 Android (Chrome)</button>
          <button class="install-tab-btn" id="tab-ios">🍎 iOS (Safari)</button>
          <button class="install-tab-btn" id="tab-desktop">💻 Desktop (Chrome/Edge)</button>
        </div>

        <!-- Tab Content Body -->
        <div id="install-instructions-body">
          <!-- Default: Android Chrome -->
          <div class="install-step-card">
            <div class="install-step-num">1</div>
            <div class="install-step-text">
              Open <strong>Chrome Browser</strong> on your Android phone and visit <strong>RxFlow PWA</strong>.
            </div>
          </div>
          <div class="install-step-card">
            <div class="install-step-num">2</div>
            <div class="install-step-text">
              Tap the <strong>three dots menu (⋮)</strong> in the top-right corner of Chrome.
            </div>
          </div>
          <div class="install-step-card">
            <div class="install-step-num">3</div>
            <div class="install-step-text">
              Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong> and tap <strong>Add</strong>.
            </div>
          </div>
        </div>

        <!-- Interactive 1-Click Install Button -->
        <div style="margin-top:20px; text-align:center;">
          <button class="action-btn action-btn--success" id="btn-trigger-pwa-prompt" style="width:100%; padding:14px; font-size:15px; font-weight:800;">
            ⚡ Trigger Instant PWA Installation
          </button>
          <div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
            Supported on Chrome, Edge, Brave & modern PWA browsers
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach tab switching logic
  const tabAndroid = modalContainer.querySelector('#tab-android');
  const tabIos = modalContainer.querySelector('#tab-ios');
  const tabDesktop = modalContainer.querySelector('#tab-desktop');
  const body = modalContainer.querySelector('#install-instructions-body');

  tabAndroid?.addEventListener('click', () => {
    tabAndroid.classList.add('active');
    tabIos?.classList.remove('active');
    tabDesktop?.classList.remove('active');
    if (body) {
      body.innerHTML = `
        <div class="install-step-card">
          <div class="install-step-num">1</div>
          <div class="install-step-text">Open <strong>Chrome Browser</strong> on your Android phone.</div>
        </div>
        <div class="install-step-card">
          <div class="install-step-num">2</div>
          <div class="install-step-text">Tap the <strong>three dots menu (⋮)</strong> in top-right corner.</div>
        </div>
        <div class="install-step-card">
          <div class="install-step-num">3</div>
          <div class="install-step-text">Tap <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong>.</div>
        </div>
      `;
    }
  });

  tabIos?.addEventListener('click', () => {
    tabIos.classList.add('active');
    tabAndroid?.classList.remove('active');
    tabDesktop?.classList.remove('active');
    if (body) {
      body.innerHTML = `
        <div class="install-step-card">
          <div class="install-step-num">1</div>
          <div class="install-step-text">Open <strong>Safari Browser</strong> on your iPhone / iPad.</div>
        </div>
        <div class="install-step-card">
          <div class="install-step-num">2</div>
          <div class="install-step-text">Tap the <strong>Share button (⎋)</strong> at bottom navigation bar.</div>
        </div>
        <div class="install-step-card">
          <div class="install-step-num">3</div>
          <div class="install-step-text">Scroll down and tap <strong>"Add to Home Screen" (➕)</strong> then tap <strong>Add</strong>.</div>
        </div>
      `;
    }
  });

  tabDesktop?.addEventListener('click', () => {
    tabDesktop.classList.add('active');
    tabAndroid?.classList.remove('active');
    tabIos?.classList.remove('active');
    if (body) {
      body.innerHTML = `
        <div class="install-step-card">
          <div class="install-step-num">1</div>
          <div class="install-step-text">Open RxFlow in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on Windows/Mac.</div>
        </div>
        <div class="install-step-card">
          <div class="install-step-num">2</div>
          <div class="install-step-text">Look for the <strong>Install Icon (⊕)</strong> on the right side of the address bar.</div>
        </div>
        <div class="install-step-card">
          <div class="install-step-num">3</div>
          <div class="install-step-text">Click <strong>Install</strong> to launch RxFlow as a desktop window.</div>
        </div>
      `;
    }
  });

  // Trigger PWA install prompt button
  modalContainer.querySelector('#btn-trigger-pwa-prompt')?.addEventListener('click', async () => {
    const promptEvent = (window as any).deferredInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        NotificationEngine.showToast('RxFlow PWA installation accepted!', 'success');
      }
      (window as any).deferredInstallPrompt = null;
    } else {
      NotificationEngine.showToast('Please follow the step-by-step browser instructions above to install RxFlow.', 'info');
    }
  });

  // Close modal
  modalContainer.querySelector('#modal-close')?.addEventListener('click', () => {
    modalContainer.innerHTML = '';
  });
  modalContainer.querySelector('#modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) modalContainer.innerHTML = '';
  });
}

/**
 * 2. Chemist Profile Modal
 */
function openChemistProfileModal(container: HTMLElement, chemist: any): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box">
        <div class="rx-modal-header">
          <div class="rx-modal-title">
            <span style="font-size:24px;">🏪</span> Chemist Retailer Profile
          </div>
          <button class="rx-modal-close" id="modal-close">✕</button>
        </div>

        <div style="background:var(--bg-elevated); padding:16px; border-radius:8px; border:1px solid var(--border-subtle); margin-bottom:16px;">
          <div style="font-size:18px; font-weight:800; color:white;">${chemist.name}</div>
          <div style="font-size:13px; color:var(--tile-cyan); margin-top:2px;">Owner: ${chemist.owner} • Code: ${chemist.code}</div>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">📍 ${chemist.city}, Maharashtra</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:13px;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
            <span style="color:var(--text-secondary);">Drug License No. (Form 20B):</span>
            <strong style="color:white;">20B/MH-PUN-10492</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
            <span style="color:var(--text-secondary);">Drug License No. (Form 21B):</span>
            <strong style="color:white;">21B/MH-PUN-10493</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
            <span style="color:var(--text-secondary);">DL Verification Status:</span>
            <span style="background:#107C41; color:white; padding:2px 8px; border-radius:4px; font-weight:800; font-size:11px;">100% FDA VERIFIED</span>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
            <span style="color:var(--text-secondary);">GSTIN Number:</span>
            <strong style="color:white;">27AAAAA0000A1Z5</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
            <span style="color:var(--text-secondary);">Registered Phone:</span>
            <strong style="color:white;">${chemist.phone}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding-bottom:6px;">
            <span style="color:var(--text-secondary);">Linked Stockist Accounts:</span>
            <strong style="color:var(--tile-cyan);">10 Distributors (D1..D10)</strong>
          </div>
        </div>

        <button class="action-btn action-btn--primary" id="modal-close-btn" style="width:100%; margin-top:20px;">
          Close Profile
        </button>
      </div>
    </div>
  `;

  modalContainer.querySelector('#modal-close')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-close-btn')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) modalContainer.innerHTML = ''; });
}

/**
 * 3. Distributor Credit Selector Modal
 */
function openDistributorCreditModal(container: HTMLElement, chemist: any): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;

  const creditData = DISTRIBUTORS.map((d, idx) => {
    const limit = idx === 0 ? 40000 : idx === 1 ? 30000 : idx === 2 ? 30000 : idx === 3 ? 50000 : idx === 4 ? 20000 : 35000;
    const used = idx === 0 ? 35000 : idx === 1 ? 25000 : idx === 2 ? 25000 : idx === 3 ? 22000 : idx === 4 ? 12000 : 28000;
    const avail = Math.max(0, limit - used);
    const pctVal = Math.min(100, Math.round((used / limit) * 100));
    return { dist: d, limit, used, avail, pctVal };
  });

  modalContainer.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box no-scrollbar">
        <div class="rx-modal-header">
          <div class="rx-modal-title">
            <span style="font-size:24px;">💳</span> Distributor Credit Breakdown
          </div>
          <button class="rx-modal-close" id="modal-close">✕</button>
        </div>

        <!-- Extreme Top Search Bar -->
        <div style="margin-bottom:12px;">
          <input 
            type="text" 
            id="dist-credit-search-input" 
            placeholder="🔍 Type to search distributor by name, code, or city..." 
            style="width:100%; background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:10px 14px; color:white; font-size:13px; outline:none; transition:border-color 0.2s ease;"
          />
        </div>

        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
          Select a distributor to filter your active credit line & view overdue invoices.
        </div>

        <div class="no-scrollbar" id="distributor-credit-list" style="display:flex; flex-direction:column; gap:12px; max-height:360px; overflow-y:auto; padding-right:2px;">
        </div>

        <button class="action-btn action-btn--primary" id="modal-close-btn" style="width:100%; margin-top:20px;">
          DONE
        </button>
      </div>
    </div>
  `;

  const searchInput = modalContainer.querySelector<HTMLInputElement>('#dist-credit-search-input');
  const creditListContainer = modalContainer.querySelector('#distributor-credit-list');

  function renderList(query: string = ''): void {
    if (!creditListContainer) return;
    const q = query.trim().toLowerCase();
    const filtered = creditData.filter(c =>
      c.dist.name.toLowerCase().includes(q) ||
      c.dist.city.toLowerCase().includes(q) ||
      (c.dist.code && c.dist.code.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      creditListContainer.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:var(--text-secondary); font-size:13px;">
          🔍 No distributor found matching "<strong>${query}</strong>"
        </div>
      `;
      return;
    }

    creditListContainer.innerHTML = filtered.map(c => `
      <div class="distributor-credit-item" style="background:var(--bg-elevated); padding:14px; border-radius:8px; border:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:10px; cursor:pointer;" data-dist-id="${c.dist.id}">
        <!-- Top Row: Distributor Name & Credit Numbers -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
          <div>
            <div style="font-size:14px; font-weight:800; color:white;">${c.dist.name}</div>
            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">City: ${c.dist.city} • MOV: ₹${c.dist.mov}</div>
          </div>
          <div style="text-align:right; white-space:nowrap;">
            <div style="font-size:13px; font-weight:900; color:#34D399;">
              ₹${c.used.toLocaleString('en-IN')} (used) / ₹${c.limit.toLocaleString('en-IN')}
            </div>
            <div style="font-size:11px; font-weight:700; color:${c.pctVal >= 85 ? '#F87171' : c.pctVal >= 70 ? '#FBBF24' : '#34D399'}; margin-top:2px;">
              (${c.pctVal}% used)
            </div>
          </div>
        </div>

        <!-- Status Progress Bar (Matching Image 2 Spec) -->
        <div style="background:rgba(0,120,215,0.15); padding:8px 12px; border-radius:6px; border:1px solid rgba(0,120,215,0.25);">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; color:white; margin-bottom:5px;">
            <span>${c.pctVal}% Credit Utilized</span>
            <span style="color:#6EE7B7;">₹${c.avail.toLocaleString('en-IN')} Available Line</span>
          </div>
          <div style="width:100%; background:rgba(0,0,0,0.5); height:8px; border-radius:999px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.5);">
            <div style="width:${c.pctVal}%; height:100%; background:linear-gradient(90deg, #10B981 0%, #F59E0B 70%, #EF4444 100%); border-radius:999px; transition:width 0.4s ease;"></div>
          </div>
        </div>
      </div>
    `).join('');

    // Re-attach click listeners to items
    creditListContainer.querySelectorAll('.distributor-credit-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-dist-id');
        const dist = DISTRIBUTORS.find(d => d.id === id);
        const credInfo = creditData.find(c => c.dist.id === id);
        if (dist && credInfo) {
          openDistributorTransactionHistoryModal(container, chemist, dist, credInfo);
        }
      });
    });
  }

  // Initial render
  renderList('');

  // Live real-time search on keypress/input
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    renderList(query);
  });

  // Focus search input automatically
  setTimeout(() => searchInput?.focus(), 100);

  modalContainer.querySelector('#modal-close')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-close-btn')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) modalContainer.innerHTML = ''; });
}

/**
 * 3b. Distributor Transaction History Modal (with Live Credit Bar & Date Filters)
 */
function openDistributorTransactionHistoryModal(
  container: HTMLElement,
  chemist: any,
  distributor: any,
  creditInfo: { limit: number; used: number; avail: number; pctVal: number }
): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;
  const targetModal = modalContainer as HTMLElement;

  const distCode = distributor.code || 'D1';

  // Mock transaction history dataset per distributor
  const allTransactions = [
    {
      id: `tx-1`,
      type: 'Sales Invoice',
      voucherNo: `INV-2026-${distCode}-004`,
      date: '2026-08-01',
      dateFormatted: '01 Aug 2026, 04:30 PM',
      amount: 12500,
      isCredit: false,
      status: 'Pending',
      paymentMethod: 'Credit Terms (30 Days)',
      notes: '12 SKUs • FEFO Stock Approved',
    },
    {
      id: `tx-2`,
      type: 'UPI Payment',
      voucherNo: `PAY-2026-UPI-${distCode}`,
      date: '2026-07-29',
      dateFormatted: '29 Jul 2026, 11:15 AM',
      amount: 15000,
      isCredit: true,
      status: 'Completed',
      paymentMethod: 'UPI (GPay / PhonePe)',
      notes: 'Ref #UPI984281948291 • Tally Synced',
    },
    {
      id: `tx-3`,
      type: 'Sales Invoice',
      voucherNo: `INV-2026-${distCode}-001`,
      date: '2026-07-22',
      dateFormatted: '22 Jul 2026, 02:45 PM',
      amount: 14500,
      isCredit: false,
      status: 'Overdue',
      paymentMethod: 'Credit Terms (Due 29 Jul)',
      notes: '7 Days Overdue • Invoice #001',
      isOverdue: true,
    },
    {
      id: `tx-4`,
      type: 'Credit Note',
      voucherNo: `CN-2026-${distCode}-002`,
      date: '2026-07-14',
      dateFormatted: '14 Jul 2026, 06:10 PM',
      amount: 3200,
      isCredit: true,
      status: 'Approved',
      paymentMethod: 'Expiry GRN Return',
      notes: '4 Items (FEFO Return Batch B-402)',
    },
    {
      id: `tx-5`,
      type: 'Sales Invoice',
      voucherNo: `INV-2026-${distCode}-000`,
      date: '2026-07-07',
      dateFormatted: '07 Jul 2026, 10:20 AM',
      amount: 25700,
      isCredit: false,
      status: 'Paid',
      paymentMethod: 'Credit Terms (Paid in full)',
      notes: '18 SKUs • Delivered via Speed Logistics',
    },
    {
      id: `tx-6`,
      type: 'NEFT Payment',
      voucherNo: `PAY-2026-NEFT-${distCode}`,
      date: '2026-06-27',
      dateFormatted: '27 Jun 2026, 03:00 PM',
      amount: 25700,
      isCredit: true,
      status: 'Completed',
      paymentMethod: 'NEFT Transfer (HDFC Bank)',
      notes: 'Ref #HDFC000028194 • Full settlement',
    },
    {
      id: `tx-7`,
      type: 'Sales Order',
      voucherNo: `ORD-2026-${distCode}-771`,
      date: '2026-06-17',
      dateFormatted: '17 Jun 2026, 01:15 PM',
      amount: 18000,
      isCredit: false,
      status: 'Delivered',
      paymentMethod: 'Credit Order',
      notes: 'TallyPrime ERP Direct Sync',
    },
  ];

  let activePreset = 'all'; // 'all' | 'today' | '7days' | '30days' | 'month'
  let customFrom = '';
  let customTo = '';
  let searchQuery = '';

  function renderModalContent(): void {
    targetModal.innerHTML = `
      <div class="rx-modal-overlay" id="modal-overlay">
        <div class="rx-modal-box no-scrollbar" style="max-width:740px; width:95%;">
          
          <!-- Header with Back Button & Title -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <button class="action-btn" id="btn-back-to-credit" style="background:rgba(255,255,255,0.08); border:1px solid var(--border-subtle); color:white; padding:4px 10px; font-size:12px; border-radius:6px; cursor:pointer;">
                ⬅️ Back
              </button>
              <div>
                <div style="font-size:16px; font-weight:800; color:white; display:flex; align-items:center; gap:6px;">
                  📜 Transaction History — ${distributor.name}
                </div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                  GSTIN: ${distributor.gstin} • MOV: ₹${distributor.mov} • City: ${distributor.city}
                </div>
              </div>
            </div>
            <button class="rx-modal-close" id="modal-close">✕</button>
          </div>

          <!-- LIVE CREDIT BAR AT TOP -->
          <div style="background:linear-gradient(135deg, rgba(0,120,215,0.18), rgba(16,185,129,0.12)); border:1px solid rgba(0,120,215,0.35); border-radius:8px; padding:12px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="background:var(--tile-blue); color:white; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;">LIVE CREDIT BAR</span>
                <span style="font-size:12px; font-weight:800; color:white;">Credit Utilization Status</span>
              </div>
              <div style="font-size:13px; font-weight:900; color:#34D399;">
                ₹${creditInfo.used.toLocaleString('en-IN')} (used) / ₹${creditInfo.limit.toLocaleString('en-IN')}
                <span style="font-size:11px; font-weight:700; color:${creditInfo.pctVal >= 85 ? '#F87171' : creditInfo.pctVal >= 70 ? '#FBBF24' : '#34D399'};">(${creditInfo.pctVal}% used)</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div style="width:100%; background:rgba(0,0,0,0.5); height:9px; border-radius:999px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.5); margin:6px 0;">
              <div style="width:${creditInfo.pctVal}%; height:100%; background:linear-gradient(90deg, #10B981 0%, #F59E0B 70%, #EF4444 100%); border-radius:999px; transition:width 0.4s ease;"></div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:var(--text-secondary);">
              <span>⚡ Max Credit Days: 30 Days</span>
              <span style="color:#6EE7B7; font-weight:800;">₹${creditInfo.avail.toLocaleString('en-IN')} Available Credit Line</span>
            </div>
          </div>

          <!-- DATE FILTER BAR & SEARCH -->
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:12px; margin-bottom:14px;">
            <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--tile-cyan); margin-bottom:8px; display:flex; align-items:center; gap:6px;">
              <span>📅 Filter Transactions by Date</span>
            </div>

            <!-- Preset Filter Buttons -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
              <button class="tx-filter-chip ${activePreset === 'all' ? 'active' : ''}" data-preset="all">
                🌐 All Time
              </button>
              <button class="tx-filter-chip ${activePreset === 'today' ? 'active' : ''}" data-preset="today">
                ⚡ Today
              </button>
              <button class="tx-filter-chip ${activePreset === '7days' ? 'active' : ''}" data-preset="7days">
                🗓️ Last 7 Days
              </button>
              <button class="tx-filter-chip ${activePreset === '30days' ? 'active' : ''}" data-preset="30days">
                📆 Last 30 Days
              </button>
              <button class="tx-filter-chip ${activePreset === 'month' ? 'active' : ''}" data-preset="month">
                📊 This Month
              </button>
            </div>

            <!-- Custom Date Range Pickers & Search Input -->
            <div style="display:grid; grid-template-columns: 1fr 1fr 1.5fr; gap:8px; align-items:center;">
              <div>
                <label style="font-size:10px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">FROM DATE</label>
                <input type="date" id="tx-from-date" value="${customFrom}" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:5px 8px; color:white; font-size:11px; outline:none;" />
              </div>
              <div>
                <label style="font-size:10px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">TO DATE</label>
                <input type="date" id="tx-to-date" value="${customTo}" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:5px 8px; color:white; font-size:11px; outline:none;" />
              </div>
              <div>
                <label style="font-size:10px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">SEARCH</label>
                <input type="text" id="tx-search-input" value="${searchQuery}" placeholder="🔍 Search voucher #, inv #..." style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:5px 8px; color:white; font-size:11px; outline:none;" />
              </div>
            </div>
          </div>

          <!-- TRANSACTIONS LIST CONTAINER -->
          <div id="tx-list-container" class="no-scrollbar" style="max-height:280px; overflow-y:auto; padding-right:2px; display:flex; flex-direction:column; gap:8px;">
          </div>

          <!-- Footer Action Buttons -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; border-top:1px solid var(--border-subtle); padding-top:12px;">
            <button class="action-btn" id="btn-pay-overdue-direct" style="background:linear-gradient(135deg, #10B981, #059669); color:white; font-weight:800; font-size:12px; padding:8px 16px; border-radius:6px; border:none; cursor:pointer;">
              💳 Pay Overdue Invoice (₹14,500)
            </button>
            <button class="action-btn action-btn--primary" id="modal-close-history" style="padding:8px 20px;">
              DONE
            </button>
          </div>

        </div>
      </div>
    `;

    attachHistoryEventListeners();
    filterAndRenderTransactions();
  }

  function filterAndRenderTransactions(): void {
    const txListEl = targetModal.querySelector('#tx-list-container');
    if (!txListEl) return;

    const todayDate = new Date('2026-08-01');

    const filtered = allTransactions.filter(tx => {
      const txDate = new Date(tx.date);

      if (activePreset === 'today') {
        if (tx.date !== '2026-08-01') return false;
      } else if (activePreset === '7days') {
        const diffDays = (todayDate.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (activePreset === '30days') {
        const diffDays = (todayDate.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30 || diffDays < 0) return false;
      } else if (activePreset === 'month') {
        if (txDate.getMonth() !== todayDate.getMonth() || txDate.getFullYear() !== todayDate.getFullYear()) return false;
      }

      if (customFrom && tx.date < customFrom) return false;
      if (customTo && tx.date > customTo) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          tx.voucherNo.toLowerCase().includes(q) ||
          tx.type.toLowerCase().includes(q) ||
          tx.notes.toLowerCase().includes(q) ||
          tx.status.toLowerCase().includes(q) ||
          tx.amount.toString().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      txListEl.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:var(--text-secondary); font-size:12px; background:var(--bg-elevated); border-radius:8px;">
          🔍 No transactions found for the selected date filter / search criteria.
        </div>
      `;
      return;
    }

    txListEl.innerHTML = filtered.map(tx => {
      const isCredit = tx.isCredit;
      const amountColor = isCredit ? '#34D399' : tx.isOverdue ? '#F87171' : 'white';
      const statusBg = tx.isOverdue ? 'rgba(239,68,68,0.2)' : tx.status === 'Completed' || tx.status === 'Paid' ? 'rgba(16,185,129,0.2)' : 'rgba(0,120,215,0.2)';
      const statusColor = tx.isOverdue ? '#F87171' : tx.status === 'Completed' || tx.status === 'Paid' ? '#34D399' : '#60A5FA';

      return `
        <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:50%; background:${isCredit ? 'rgba(16,185,129,0.15)' : 'rgba(0,120,215,0.15)'}; color:${isCredit ? '#34D399' : '#60A5FA'}; display:flex; align-items:center; justify-content:center; font-size:16px;">
              ${isCredit ? '💸' : '📜'}
            </div>
            <div>
              <div style="font-size:13px; font-weight:800; color:white; display:flex; align-items:center; gap:6px;">
                <span>${tx.voucherNo}</span>
                <span style="font-size:9px; font-weight:800; padding:1px 6px; border-radius:4px; background:${statusBg}; color:${statusColor}; text-transform:uppercase;">
                  ${tx.status}
                </span>
              </div>
              <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                📅 ${tx.dateFormatted} • ${tx.type} • ${tx.paymentMethod}
              </div>
              <div style="font-size:10px; color:var(--tile-cyan); margin-top:1px;">
                ${tx.notes}
              </div>
            </div>
          </div>

          <div style="text-align:right; white-space:nowrap;">
            <div style="font-size:14px; font-weight:900; color:${amountColor};">
              ${isCredit ? '-' : '+'}₹${tx.amount.toLocaleString('en-IN')}
            </div>
            ${tx.isOverdue ? `
              <button class="action-btn btn-pay-tx-now" data-amount="${tx.amount}" style="margin-top:4px; background:#EF4444; color:white; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px; border:none; cursor:pointer;">
                Pay Now
              </button>
            ` : `
              <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">
                ${isCredit ? 'Credit Adj' : 'Invoice Amount'}
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    txListEl.querySelectorAll('.btn-pay-tx-now').forEach(btn => {
      btn.addEventListener('click', () => {
        openPayUpiModal(container, distributor);
      });
    });
  }

  function attachHistoryEventListeners(): void {
    targetModal.querySelectorAll('.tx-filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        activePreset = target.getAttribute('data-preset') || 'all';

        targetModal.querySelectorAll('.tx-filter-chip').forEach(c => c.classList.remove('active'));
        target.classList.add('active');

        customFrom = '';
        customTo = '';
        const fromEl = targetModal.querySelector<HTMLInputElement>('#tx-from-date');
        const toEl = targetModal.querySelector<HTMLInputElement>('#tx-to-date');
        if (fromEl) fromEl.value = '';
        if (toEl) toEl.value = '';

        filterAndRenderTransactions();
      });
    });

    const fromInput = targetModal.querySelector<HTMLInputElement>('#tx-from-date');
    const toInput = targetModal.querySelector<HTMLInputElement>('#tx-to-date');
    const searchInput = targetModal.querySelector<HTMLInputElement>('#tx-search-input');

    fromInput?.addEventListener('change', () => {
      customFrom = fromInput.value;
      activePreset = 'custom';
      targetModal.querySelectorAll('.tx-filter-chip').forEach(c => c.classList.remove('active'));
      filterAndRenderTransactions();
    });

    toInput?.addEventListener('change', () => {
      customTo = toInput.value;
      activePreset = 'custom';
      targetModal.querySelectorAll('.tx-filter-chip').forEach(c => c.classList.remove('active'));
      filterAndRenderTransactions();
    });

    searchInput?.addEventListener('input', () => {
      searchQuery = searchInput.value;
      filterAndRenderTransactions();
    });

    targetModal.querySelector('#btn-back-to-credit')?.addEventListener('click', () => {
      openDistributorCreditModal(container, chemist);
    });

    targetModal.querySelector('#btn-pay-overdue-direct')?.addEventListener('click', () => {
      openPayUpiModal(container, distributor);
    });

    targetModal.querySelector('#modal-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#modal-close-history')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
  }

  renderModalContent();
}

/**
 * 4. Overdue Invoices Breakdown & List Modal
 */
function openOverdueInvoicesListModal(container: HTMLElement, chemist: any): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;
  const targetModal = modalContainer as HTMLElement;

  // Overdue invoices dataset with distributor info & credit status
  const overdueInvoices = [
    {
      id: 'inv-d1-001',
      distributor: DISTRIBUTORS[0], // Distributor D1 (Stockist Agencies)
      invoiceNo: '#INV-2026-D1-001',
      invoiceDate: '15 Jul 2026',
      dueDate: '29 Jul 2026',
      overdueDays: 7,
      amount: 14500,
      limit: 40000,
      used: 35000,
      avail: 5000,
      pctVal: 88,
    },
    {
      id: 'inv-d2-008',
      distributor: DISTRIBUTORS[1], // Distributor D2 (Stockist Agencies)
      invoiceNo: '#INV-2026-D2-008',
      invoiceDate: '10 Jul 2026',
      dueDate: '24 Jul 2026',
      overdueDays: 12,
      amount: 12400,
      limit: 30000,
      used: 25000,
      avail: 5000,
      pctVal: 83,
    },
    {
      id: 'inv-d3-014',
      distributor: DISTRIBUTORS[2], // Distributor D3 (Stockist Agencies)
      invoiceNo: '#INV-2026-D3-014',
      invoiceDate: '05 Jul 2026',
      dueDate: '19 Jul 2026',
      overdueDays: 17,
      amount: 10000,
      limit: 30000,
      used: 25000,
      avail: 5000,
      pctVal: 83,
    },
  ];

  const totalOverdue = overdueInvoices.reduce((sum, item) => sum + item.amount, 0);

  function renderList(query: string = ''): void {
    const q = query.trim().toLowerCase();
    const filtered = overdueInvoices.filter(inv =>
      inv.distributor.name.toLowerCase().includes(q) ||
      inv.invoiceNo.toLowerCase().includes(q) ||
      inv.distributor.city.toLowerCase().includes(q)
    );

    targetModal.innerHTML = `
      <div class="rx-modal-overlay" id="modal-overlay">
        <div class="rx-modal-box no-scrollbar" style="max-width:720px; width:95%;">
          
          <!-- Modal Header -->
          <div class="rx-modal-header">
            <div class="rx-modal-title" style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:24px;">⚠️</span> Overdue Invoices Breakdown
            </div>
            <button class="rx-modal-close" id="modal-close">✕</button>
          </div>

          <!-- Total Summary Bar -->
          <div style="background:linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.15)); border:1px solid rgba(239,68,68,0.4); border-radius:8px; padding:14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#F87171;">
                Total Overdue Amount
              </div>
              <div style="font-size:26px; font-weight:900; color:white; margin-top:2px;">
                ₹${totalOverdue.toLocaleString('en-IN')}.00
              </div>
            </div>
            <div style="text-align:right;">
              <span style="background:rgba(239,68,68,0.25); color:#F87171; border:1px solid rgba(239,68,68,0.5); font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; display:inline-block;">
                ${overdueInvoices.length} Overdue Invoices Pending
              </span>
              <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                Settlement required to unblock credit lines
              </div>
            </div>
          </div>

          <!-- Search Input -->
          <div style="margin-bottom:12px;">
            <input 
              type="text" 
              id="overdue-search-input" 
              value="${query}"
              placeholder="🔍 Search by distributor name, invoice no, or city..." 
              style="width:100%; background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:10px 14px; color:white; font-size:13px; outline:none;"
            />
          </div>

          <!-- Overdue Invoices List -->
          <div class="no-scrollbar" id="overdue-invoices-list" style="display:flex; flex-direction:column; gap:12px; max-height:360px; overflow-y:auto; padding-right:2px;">
            ${filtered.length === 0 ? `
              <div style="text-align:center; padding:30px 10px; color:var(--text-secondary); font-size:13px;">
                🔍 No overdue invoices found matching "<strong>${query}</strong>"
              </div>
            ` : filtered.map(inv => `
              <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:12px;">
                
                <!-- Top Row: Distributor Name & Invoice Info -->
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                  <div>
                    <div style="font-size:15px; font-weight:800; color:white; display:flex; align-items:center; gap:8px;">
                      <span>${inv.distributor.name}</span>
                      <span style="font-size:10px; font-weight:800; background:rgba(239,68,68,0.2); color:#F87171; border:1px solid rgba(239,68,68,0.4); padding:2px 6px; border-radius:4px;">
                        ⚠️ ${inv.overdueDays} Days Overdue
                      </span>
                    </div>
                    <div style="font-size:12px; color:var(--tile-cyan); font-weight:700; margin-top:3px;">
                      Invoice No: ${inv.invoiceNo} • Due Date: ${inv.dueDate}
                    </div>
                  </div>
                  
                  <div style="text-align:right; white-space:nowrap;">
                    <div style="font-size:18px; font-weight:900; color:#F87171;">
                      ₹${inv.amount.toLocaleString('en-IN')}.00
                    </div>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">
                      Overdue Amount
                    </div>
                  </div>
                </div>

                <!-- Distributor Remaining Credit Line Status -->
                <div style="background:rgba(0,120,215,0.12); padding:10px 12px; border-radius:6px; border:1px solid rgba(0,120,215,0.25); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div>
                    <div style="font-size:10px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">
                      Distributor Credit Status
                    </div>
                    <div style="font-size:12px; font-weight:800; color:white; margin-top:2px;">
                      ₹${inv.used.toLocaleString('en-IN')} (used) / ₹${inv.limit.toLocaleString('en-IN')} limit
                    </div>
                  </div>

                  <div style="text-align:right;">
                    <div style="font-size:10px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">
                      Remaining Credit Line
                    </div>
                    <div style="font-size:13px; font-weight:900; color:#34D399; margin-top:2px;">
                      ₹${inv.avail.toLocaleString('en-IN')} Available
                    </div>
                  </div>
                </div>

                <!-- Action Row: Pay Now Button -->
                <div style="display:flex; justify-content:flex-end; align-items:center;">
                  <button class="action-btn btn-pay-invoice-now" data-inv-id="${inv.id}" style="background:linear-gradient(135deg, #10B981, #059669); color:white; font-weight:800; font-size:13px; padding:8px 20px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    💳 Pay Now via UPI
                  </button>
                </div>

              </div>
            `).join('')}
          </div>

          <button class="action-btn action-btn--primary" id="modal-close-btn" style="width:100%; margin-top:16px;">
            DONE
          </button>
        </div>
      </div>
    `;

    // Search input listener
    const searchInput = targetModal.querySelector<HTMLInputElement>('#overdue-search-input');
    searchInput?.addEventListener('input', (e) => {
      renderList((e.target as HTMLInputElement).value);
    });

    // Pay Now buttons listener -> openPayUpiModal
    targetModal.querySelectorAll('.btn-pay-invoice-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const invId = (e.currentTarget as HTMLElement).getAttribute('data-inv-id');
        const item = overdueInvoices.find(i => i.id === invId);
        if (item) {
          openPayUpiModal(container, item.distributor, {
            invoiceNo: item.invoiceNo,
            amount: item.amount,
            overdueDays: item.overdueDays,
          });
        }
      });
    });

    targetModal.querySelector('#modal-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#modal-close-btn')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
  }

  renderList('');
}

/**
 * 4b. Pay by UPI Modal
 */
function openPayUpiModal(
  container: HTMLElement,
  distributor: any,
  invoiceDetails?: { invoiceNo: string; amount: number; overdueDays?: number }
): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;
  const targetModal = modalContainer as HTMLElement;

  const invNo = invoiceDetails?.invoiceNo || '#INV-2026-D1-001';
  const payAmount = invoiceDetails?.amount || 14500;
  const overdueStr = invoiceDetails?.overdueDays ? ` (${invoiceDetails.overdueDays} Days Overdue)` : '';

  targetModal.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box">
        <div class="rx-modal-header">
          <div class="rx-modal-title" style="display:flex; align-items:center; gap:8px;">
            <button class="action-btn" id="btn-back-to-overdue-list" style="background:rgba(255,255,255,0.08); border:1px solid var(--border-subtle); color:white; padding:3px 8px; font-size:11px; border-radius:4px; cursor:pointer;">
              ⬅️ Back
            </button>
            <span style="font-size:22px;">💳</span> Pay Overdue Invoice via UPI
          </div>
          <button class="rx-modal-close" id="modal-close">✕</button>
        </div>

        <div style="background:linear-gradient(135deg, rgba(216,59,1,0.2), rgba(0,120,215,0.2)); padding:16px; border-radius:8px; border:1px solid var(--tile-amber); margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:13px;">
            <span style="color:var(--text-secondary);">Distributor:</span>
            <strong style="color:white;">${distributor.name}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13px; margin-top:4px;">
            <span style="color:var(--text-secondary);">Invoice No:</span>
            <strong style="color:var(--tile-cyan);">${invNo}${overdueStr}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:16px; margin-top:8px; font-weight:800;">
            <span>Amount Payable:</span>
            <span style="color:#FBBF24;">₹${payAmount.toLocaleString('en-IN')}.00</span>
          </div>
        </div>

        <!-- Simulated UPI QR Code -->
        <div style="text-align:center; padding:16px; background:white; border-radius:12px; margin-bottom:16px;">
          <div style="font-size:12px; font-weight:800; color:#111; margin-bottom:8px;">Scan with GPay / PhonePe / Paytm / BHIM</div>
          <div style="width:160px; height:160px; margin:0 auto; background:#111; display:flex; align-items:center; justify-content:center; border-radius:8px; color:white; font-family:monospace; font-size:11px; padding:10px; line-height:1.4;">
            [ QR CODE SIMULATION ]<br>UPI ID:<br>rxflow.${distributor.code ? distributor.code.toLowerCase() : 'd1'}@upi
          </div>
          <div style="font-size:12px; font-weight:700; color:#333; margin-top:8px;">VPA: rxflow.medico@okicici</div>
        </div>

        <!-- Quick 1-Tap Pay Action -->
        <button class="action-btn action-btn--success" id="btn-confirm-upi-pay" style="width:100%; padding:14px; font-size:15px; font-weight:800;">
          ✅ CONFIRM ₹${payAmount.toLocaleString('en-IN')} INSTANT UPI PAYMENT
        </button>
      </div>
    </div>
  `;

  targetModal.querySelector('#btn-back-to-overdue-list')?.addEventListener('click', () => {
    openOverdueInvoicesListModal(container, RETAILERS[0]);
  });

  targetModal.querySelector('#btn-confirm-upi-pay')?.addEventListener('click', () => {
    NotificationEngine.showToast(`✅ UPI Payment of ₹${payAmount.toLocaleString('en-IN')} recorded for Invoice ${invNo}!`, 'success');
    targetModal.innerHTML = '';
  });

  targetModal.querySelector('#modal-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
  targetModal.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
}

/**
 * 5. Tally ERP Sync Modal
 */
function openTallySyncModal(container: HTMLElement): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box">
        <div class="rx-modal-header">
          <div class="rx-modal-title">
            <span style="font-size:24px;">🔄</span> Tally ERP XML/JSON Sync Bridge
          </div>
          <button class="rx-modal-close" id="modal-close">✕</button>
        </div>

        <div style="font-size:13px; color:var(--text-secondary); margin-bottom:16px;">
          Seamlessly export purchase vouchers, sales invoices, and ledger statements to Tally Prime or Tally ERP 9.
        </div>

        <div style="background:var(--bg-elevated); padding:14px; border-radius:8px; border:1px solid var(--border-subtle); margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px;">
            <span>Tally Connector Status:</span>
            <span style="color:#10B981; font-weight:800;">● CONNECTED (Port 9000)</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-secondary); margin-top:6px;">
            <span>Last Sync Time:</span>
            <span>Today, 09:45 AM</span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="action-btn action-btn--primary" id="btn-export-xml" style="padding:12px;">
            📥 Export Tally XML Purchase Vouchers
          </button>
          <button class="action-btn action-btn--outline" id="btn-export-json" style="padding:12px;">
            📋 Export JSON Ledger Schema
          </button>
        </div>
      </div>
    </div>
  `;

  modalContainer.querySelector('#btn-export-xml')?.addEventListener('click', () => {
    NotificationEngine.showToast('📥 Tally XML Voucher exported successfully!', 'success');
  });

  modalContainer.querySelector('#btn-export-json')?.addEventListener('click', () => {
    NotificationEngine.showToast('📋 Tally JSON Schema copied to clipboard!', 'info');
  });

  modalContainer.querySelector('#modal-close')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) modalContainer.innerHTML = ''; });
}

/**
 * 6. FDA Compliance Desk Modal
 */
function openFdaComplianceModal(container: HTMLElement, chemist: any): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box">
        <div class="rx-modal-header">
          <div class="rx-modal-title">
            <span style="font-size:24px;">📜</span> Schedules X, H & M FDA Desk
          </div>
          <button class="rx-modal-close" id="modal-close">✕</button>
        </div>

        <div style="background:rgba(92,45,145,0.2); border:1px solid var(--tile-purple); padding:14px; border-radius:8px; margin-bottom:16px;">
          <div style="font-size:15px; font-weight:800; color:white;">Form 20B & Form 21B Retail License Audit</div>
          <div style="font-size:12px; color:var(--tile-cyan); margin-top:2px;">Chemist: ${chemist.name} (Pune Zone)</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:13px;">
          <div style="display:flex; justify-content:space-between; background:var(--bg-elevated); padding:10px; border-radius:6px;">
            <span>Schedule H1 Narcotic Register:</span>
            <strong style="color:#10B981;">100% Compliant (120 Entries)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; background:var(--bg-elevated); padding:10px; border-radius:6px;">
            <span>Schedule X Habit-Forming Log:</span>
            <strong style="color:#10B981;">Verified & Signed</strong>
          </div>
          <div style="display:flex; justify-content:space-between; background:var(--bg-elevated); padding:10px; border-radius:6px;">
            <span>NPPA Ceiling Price Verification:</span>
            <strong style="color:#10B981;">Compliant</strong>
          </div>
        </div>

        <button class="action-btn action-btn--primary" id="btn-download-fda" style="width:100%; margin-top:18px; padding:12px;">
          📄 Download Signed FDA Audit Report (PDF)
        </button>
      </div>
    </div>
  `;

  modalContainer.querySelector('#btn-download-fda')?.addEventListener('click', () => {
    NotificationEngine.showToast('📄 FDA Audit Report PDF downloaded successfully!', 'success');
  });

  modalContainer.querySelector('#modal-close')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) modalContainer.innerHTML = ''; });
}
