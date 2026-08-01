/**
 * Retailer Home — Metro Live Tile Hub v3.0
 * 100% Faithful Implementation of Retailer Dashboard Blueprint (WhatsApp Image Spec)
 * Wired with Interactive Modals, PWA Installation Guide, News Flow, Credit Control, Order Flow, & Tally Bridge.
 */

import { navigate } from '../../engine/Router';
import { AuthStore } from '../../engine/AuthStore';
import { RETAILERS, DISTRIBUTORS } from '../../data/mockDataStore';
import { NotificationEngine } from '../../engine/NotificationEngine';

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

    <!-- Header Section (As per WhatsApp Image Blueprint) -->
    <!-- RxFlow PWA | DATE | Last sync | Online | Theme | Logged in as R1 | Log out | How to Install app -->
    <div class="blueprint-header-bar">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <div style="font-size:18px; font-weight:900; color:white; display:flex; align-items:center; gap:6px;">
          <span style="background:var(--tile-blue); color:white; padding:2px 8px; border-radius:4px; font-size:14px;">RxFlow</span>
          <span style="color:var(--tile-cyan);">PWA</span>
        </div>
        <div class="hdr-date-badge">📅 ${dateStr}</div>
        <div class="hdr-sync-badge">⏱️ Last sync: ${timeStr}</div>
        <div style="display:flex; align-items:center; gap:5px; font-size:12px; font-weight:700; color:#10B981;">
          <span class="hdr-online-dot"></span> Online
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <button class="theme-toggle-btn" id="header-theme-toggle" style="position:static; padding:5px 10px; font-size:12px;">
          🌓 Theme
        </button>

        <button class="hdr-install-btn" id="btn-how-to-install">
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
      <div class="news-flow-label">
        <span style="animation: pulse-green 1.5s infinite; display:inline-block; margin-right:4px;">🔴</span> NEWS FLOW
      </div>
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

      <!-- LEFT COLUMN: Place Orders / Search / Map / Compliance -->
      <div class="blueprint-column">
        <!-- 1. Catalogue / search medicines -->
        <div class="blueprint-card bg-blue" data-nav="#/retailer/catalogue">
          <div>
            <div class="blueprint-card__title">Catalogue</div>
            <div class="blueprint-card__sub">Search medicines & 30 Brands (B1-B30)</div>
          </div>
          <div style="font-size:28px;">🔍</div>
        </div>

        <!-- 2. Schemes -->
        <div class="blueprint-card bg-teal" data-nav="#/retailer/schemes">
          <span class="tile-badge" style="background:rgba(0,0,0,0.3);">10 Active</span>
          <div>
            <div class="blueprint-card__title">Schemes</div>
            <div class="blueprint-card__sub">Bonus deals & distributor margins (D1..D10)</div>
          </div>
          <div style="font-size:28px;">🎁</div>
        </div>

        <!-- 3. Distributor's Map -->
        <div class="blueprint-card bg-darkblue" data-nav="#/retailer/locator">
          <div>
            <div class="blueprint-card__title">Distributor's Map</div>
            <div class="blueprint-card__sub">Pharma stockist locator & delivery routes</div>
          </div>
          <div style="font-size:28px;">🗺️</div>
        </div>

        <!-- 4. Schedules X, H, & M Compliance - Form 20B/21B -->
        <div class="blueprint-card bg-purple" id="btn-fda-compliance">
          <span class="tile-badge" style="background:#107C41;">FDA Verified</span>
          <div>
            <div class="blueprint-card__title" style="font-size:16px;">Schedules X, H & M Compliance</div>
            <div class="blueprint-card__sub">Form 20B/21B license audit & drug registers</div>
          </div>
          <div style="font-size:28px;">📜</div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Inventory / GRN / Invoices / Pay UPI / Ledger / Tally -->
      <div class="blueprint-column">
        <!-- 1. Inventory / Stock -->
        <div class="blueprint-card bg-slate" data-nav="#/retailer/pos">
          <div>
            <div class="blueprint-card__title">Inventory / Stock</div>
            <div class="blueprint-card__sub">POS offline stock & barcode management</div>
          </div>
          <div style="font-size:28px;">⚡</div>
        </div>

        <!-- 2. GRN Delivery Confirmation / Returns -->
        <div class="blueprint-card bg-cyan" data-nav="#/retailer/grn">
          <div>
            <div class="blueprint-card__title" style="font-size:16px;">GRN Delivery Confirmation</div>
            <div class="blueprint-card__sub">Confirm physical goods received & returns</div>
          </div>
          <div style="font-size:28px;">📦</div>
        </div>

        <!-- 3. Invoices -->
        <div class="blueprint-card bg-blue" data-nav="#/retailer/orders">
          <div>
            <div class="blueprint-card__title">Invoices</div>
            <div class="blueprint-card__sub">Tax invoices, billing history & receipts</div>
          </div>
          <div style="font-size:28px;">📄</div>
        </div>

        <!-- 4. Pay by UPI -->
        <div class="blueprint-card bg-amber" id="btn-pay-upi">
          <span class="tile-badge" style="background:#DC2626;">Instant</span>
          <div>
            <div class="blueprint-card__title">Pay by UPI</div>
            <div class="blueprint-card__sub">1-Tap GPay / PhonePe / Paytm settlement</div>
          </div>
          <div style="font-size:28px;">💳</div>
        </div>

        <!-- 5. Ledger Statement -->
        <div class="blueprint-card bg-green" data-nav="#/retailer/ledger">
          <div>
            <div class="blueprint-card__title">Ledger Statement</div>
            <div class="blueprint-card__sub">Account statements, credits & debit notes</div>
          </div>
          <div style="font-size:28px;">📊</div>
        </div>

        <!-- 6. Tally -->
        <div class="blueprint-card bg-purple" id="btn-tally-sync">
          <span class="tile-badge" style="background:#0078D7;">ERP Bridge</span>
          <div>
            <div class="blueprint-card__title">Tally</div>
            <div class="blueprint-card__sub">Export XML/JSON vouchers & ERP sync</div>
          </div>
          <div style="font-size:28px;">🔄</div>
        </div>
      </div>

    </div>

    <!-- Blinking Capital Notification Footer (NOTIFICATIONS IN CAPITAL (BLINK)) -->
    <div class="blinking-capital-banner">
      <div class="blinking-text">
        🚨 URGENT NOTIFICATIONS: FDA SCHEDULE H1 AUDIT DUE FOR FORM 20B/21B | OVERDUE INVOICE #INV-2026-D1-001 (₹14,500) PAYABLE IMMEDIATELY VIA UPI | BATCH B-2026-X1 DISPATCHED VIA FEFO LOGISTICS | NEW PROMO SCHEME 10+2 AVAILABLE ON BRAND B3
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

  // 4. Pay by UPI Modal (Card & Overdue Trigger)
  document.getElementById('btn-pay-upi')?.addEventListener('click', () => {
    openPayUpiModal(container, currentDist);
  });
  document.getElementById('card-overdue-invoices')?.addEventListener('click', () => {
    openPayUpiModal(container, currentDist);
  });
  document.getElementById('news-overdue-trigger')?.addEventListener('click', () => {
    openPayUpiModal(container, currentDist);
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

  const creditData = DISTRIBUTORS.map((d, idx) => ({
    dist: d,
    limit: idx === 0 ? 40000 : idx === 1 ? 30000 : 30000,
    used: idx === 0 ? 35000 : idx === 1 ? 25000 : 25000,
  }));

  modalContainer.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box">
        <div class="rx-modal-header">
          <div class="rx-modal-title">
            <span style="font-size:24px;">💳</span> Distributor Credit Breakdown
          </div>
          <button class="rx-modal-close" id="modal-close">✕</button>
        </div>

        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">
          Select a distributor to filter your active credit line & view overdue invoices.
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;">
          ${creditData.slice(0, 5).map(c => `
            <div class="distributor-credit-item" style="background:var(--bg-elevated); padding:12px; border-radius:6px; border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; cursor:pointer;" data-dist-id="${c.dist.id}">
              <div>
                <div style="font-size:14px; font-weight:800; color:white;">${c.dist.name}</div>
                <div style="font-size:11px; color:var(--text-secondary);">City: ${c.dist.city} • MOV: ₹${c.dist.mov}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:14px; font-weight:900; color:#34D399;">₹${c.used.toLocaleString('en-IN')}</div>
                <div style="font-size:10px; color:var(--text-muted);">Limit: ₹${c.limit.toLocaleString('en-IN')}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <button class="action-btn action-btn--primary" id="modal-close-btn" style="width:100%; margin-top:20px;">
          Done
        </button>
      </div>
    </div>
  `;

  modalContainer.querySelectorAll('.distributor-credit-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-dist-id');
      const dist = DISTRIBUTORS.find(d => d.id === id);
      if (dist) {
        NotificationEngine.showToast(`Selected Distributor ${dist.name} for credit inspection`, 'success');
        modalContainer.innerHTML = '';
      }
    });
  });

  modalContainer.querySelector('#modal-close')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-close-btn')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) modalContainer.innerHTML = ''; });
}

/**
 * 4. Pay by UPI Modal
 */
function openPayUpiModal(container: HTMLElement, distributor: any): void {
  const modalContainer = container.querySelector('#retailer-modal-container');
  if (!modalContainer) return;

  modalContainer.innerHTML = `
    <div class="rx-modal-overlay" id="modal-overlay">
      <div class="rx-modal-box">
        <div class="rx-modal-header">
          <div class="rx-modal-title">
            <span style="font-size:24px;">💳</span> Pay Overdue Invoice via UPI
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
            <strong style="color:var(--tile-cyan);">#INV-2026-D1-001</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:16px; margin-top:8px; font-weight:800;">
            <span>Amount Payable:</span>
            <span style="color:#FBBF24;">₹14,500.00</span>
          </div>
        </div>

        <!-- Simulated UPI QR Code -->
        <div style="text-align:center; padding:16px; background:white; border-radius:12px; margin-bottom:16px;">
          <div style="font-size:12px; font-weight:800; color:#111; margin-bottom:8px;">Scan with GPay / PhonePe / Paytm / BHIM</div>
          <div style="width:160px; height:160px; margin:0 auto; background:#111; display:flex; align-items:center; justify-content:center; border-radius:8px; color:white; font-family:monospace; font-size:11px; padding:10px;">
            [ QR CODE SIMULATION ]<br>UPI ID:<br>rxflow.d1@upi
          </div>
          <div style="font-size:12px; font-weight:700; color:#333; margin-top:8px;">VPA: rxflow.medico@okicici</div>
        </div>

        <!-- Quick 1-Tap Pay Action -->
        <button class="action-btn action-btn--success" id="btn-confirm-upi-pay" style="width:100%; padding:14px; font-size:15px; font-weight:800;">
          ✅ Confirm ₹14,500 Instant UPI Payment
        </button>
      </div>
    </div>
  `;

  modalContainer.querySelector('#btn-confirm-upi-pay')?.addEventListener('click', () => {
    NotificationEngine.showToast('✅ UPI Payment of ₹14,500 recorded! Receipt generated.', 'success');
    modalContainer.innerHTML = '';
  });

  modalContainer.querySelector('#modal-close')?.addEventListener('click', () => { modalContainer.innerHTML = ''; });
  modalContainer.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) modalContainer.innerHTML = ''; });
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
