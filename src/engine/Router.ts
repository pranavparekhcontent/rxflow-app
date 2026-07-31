/**
 * RxFlow Hash Router v3.0
 * RBAC-guarded hash router with View Transitions API support.
 * Routes: #/retailer/*, #/distributor/*, #/manufacturer/*, #/sales/*, #/admin/*
 */

export type UserRole = 'retailer' | 'distributor' | 'manufacturer' | 'sales_rep' | 'platform_admin';

export interface RouteConfig {
  path: string;
  role: UserRole[];
  title: string;
  component: () => Promise<{ default: (container: HTMLElement) => void }>;
}

interface RouterState {
  currentPath: string;
  currentRole: UserRole | null;
  routes: Map<string, RouteConfig>;
}

const state: RouterState = {
  currentPath: '',
  currentRole: null,
  routes: new Map(),
};

// ---------- Route Registry ----------

const routes: RouteConfig[] = [
  // Retailer
  { path: '#/retailer/home', role: ['retailer'], title: 'Dashboard', component: () => import('../views/retailer/RetailerHome') },
  { path: '#/retailer/catalogue', role: ['retailer'], title: 'Catalogue', component: () => import('../views/retailer/CatalogueView') },
  { path: '#/retailer/cart', role: ['retailer'], title: 'Smart Cart', component: () => import('../views/retailer/MultiCartSplitter') },
  { path: '#/retailer/voice', role: ['retailer'], title: 'Voice / Slip AI', component: () => import('../views/retailer/VoiceReceiptParser') },
  { path: '#/retailer/orders', role: ['retailer'], title: 'Orders', component: () => import('../views/retailer/OrdersView') },
  { path: '#/retailer/grn', role: ['retailer'], title: 'GRN Delivery', component: () => import('../views/retailer/OrderDeliveryReceipt') },
  { path: '#/retailer/pos', role: ['retailer'], title: 'POS Stock', component: () => import('../views/retailer/RetailerPosInventory') },
  { path: '#/retailer/ledger', role: ['retailer'], title: 'Ledger', component: () => import('../views/retailer/LedgerView') },
  { path: '#/retailer/reminders', role: ['retailer'], title: 'Pay UPI', component: () => import('../views/retailer/RetailerPaymentReminders') },
  { path: '#/retailer/schemes', role: ['retailer'], title: 'Schemes', component: () => import('../views/retailer/SmartSchemeFinder') },
  { path: '#/retailer/returns', role: ['retailer'], title: 'Returns', component: () => import('../views/retailer/ExpiryReturnsView') },
  { path: '#/retailer/nppa', role: ['retailer'], title: 'NPPA Check', component: () => import('../views/retailer/NppaPriceCheckerView') },
  { path: '#/retailer/locator', role: ['retailer'], title: 'Stockist Map', component: () => import('../views/retailer/StoreLocatorView') },
  { path: '#/retailer/autofill', role: ['retailer'], title: 'AI Auto-Fill', component: () => import('../views/retailer/SmartAiCartAutoFill') },

  // Distributor
  { path: '#/distributor/home', role: ['distributor'], title: 'Dashboard', component: () => import('../views/distributor/DistributorHome') },
  { path: '#/distributor/orders', role: ['distributor'], title: 'Order Queue', component: () => import('../views/distributor/OrderQueueView') },
  { path: '#/distributor/accept-order', role: ['distributor'], title: 'FEFO Approval', component: () => import('../views/distributor/AcceptRejectOrderView') },
  { path: '#/distributor/inventory', role: ['distributor'], title: 'Inventory', component: () => import('../views/distributor/FefoInventoryView') },
  { path: '#/distributor/dead-stock', role: ['distributor'], title: 'Dead Stock', component: () => import('../views/distributor/DeadStockHubView') },
  { path: '#/distributor/recall', role: ['distributor'], title: 'Batch Recall', component: () => import('../views/distributor/BatchRecallView') },
  { path: '#/distributor/schemes', role: ['distributor'], title: 'Schemes', component: () => import('../views/distributor/SchemeBuilderView') },
  { path: '#/distributor/credit', role: ['distributor'], title: 'Credit Control', component: () => import('../views/distributor/CreditControlView') },
  { path: '#/distributor/erp', role: ['distributor'], title: 'Tally Sync', component: () => import('../views/distributor/ErpSyncAgent') },
  { path: '#/distributor/financials', role: ['distributor'], title: 'Financials', component: () => import('../views/distributor/FinancialsView') },

  // Manufacturer
  { path: '#/manufacturer/home', role: ['manufacturer'], title: 'Dashboard', component: () => import('../views/manufacturer/ManufacturerHome') },
  { path: '#/manufacturer/catalog', role: ['manufacturer'], title: 'Master Catalog', component: () => import('../views/manufacturer/MasterCatalogUploadView') },
  { path: '#/manufacturer/analytics', role: ['manufacturer'], title: 'Analytics', component: () => import('../views/manufacturer/MarketAnalyticsView') },

  // Sales Rep
  { path: '#/sales/home', role: ['sales_rep'], title: 'Beat Plan', component: () => import('../views/sales/SalesRepView') },

  // Admin
  { path: '#/admin/home', role: ['platform_admin'], title: 'Admin Panel', component: () => import('../views/admin/PlatformAdminView') },
];

export function initRouter(): void {
  routes.forEach(route => {
    state.routes.set(route.path, route);
  });

  window.addEventListener('hashchange', () => handleRouteChange());

  if (!window.location.hash) {
    window.location.hash = '#/login';
  } else {
    handleRouteChange();
  }
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function setCurrentRole(role: UserRole): void {
  state.currentRole = role;
  navigate(`#/${role === 'sales_rep' ? 'sales' : role === 'platform_admin' ? 'admin' : role}/home`);
}

async function handleRouteChange(): Promise<void> {
  const hash = window.location.hash || '#/login';
  state.currentPath = hash;

  const container = document.getElementById('app-view');
  if (!container) return;

  if (hash === '#/login') {
    await renderLoginView(container);
    return;
  }

  const route = state.routes.get(hash);

  if (!route) {
    renderNotFound(container);
    return;
  }

  if (!state.currentRole || !route.role.includes(state.currentRole)) {
    renderUnauthorized(container);
    return;
  }

  try {
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(async () => {
        await loadAndRenderView(route, container);
      });
    } else {
      await loadAndRenderView(route, container);
    }
  } catch (err) {
    console.error('[Router] Failed to load view:', err);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__text">Failed to load view</div>
      </div>
    `;
  }
}

async function loadAndRenderView(route: RouteConfig, container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div class="skeleton" style="height: 140px; margin-bottom: 12px;"></div>
    <div class="skeleton" style="height: 140px; margin-bottom: 12px;"></div>
    <div class="skeleton" style="height: 60px;"></div>
  `;

  const module = await route.component();
  container.innerHTML = '';
  module.default(container);

  document.title = `${route.title} — RxFlow`;
}

async function renderLoginView(container: HTMLElement): Promise<void> {
  const module = await import('../views/LoginView');
  container.innerHTML = '';
  module.default(container);
  document.title = 'Login — RxFlow';
}

function renderNotFound(container: HTMLElement): void {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">🔍</div>
      <div class="empty-state__text">Page not found</div>
      <button class="action-btn action-btn--primary" onclick="location.hash='#/login'" style="max-width:200px;">
        Go to Login
      </button>
    </div>
  `;
}

function renderUnauthorized(container: HTMLElement): void {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">🔒</div>
      <div class="empty-state__text">Unauthorized — insufficient permissions</div>
      <button class="action-btn action-btn--primary" onclick="location.hash='#/login'" style="max-width:200px;">
        Go to Login
      </button>
    </div>
  `;
}

export function getCurrentRole(): UserRole | null {
  return state.currentRole;
}

export function getCurrentPath(): string {
  return state.currentPath;
}

export function getRoutesForRole(role: UserRole): RouteConfig[] {
  return routes.filter(r => r.role.includes(role));
}
