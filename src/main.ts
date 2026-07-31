/**
 * RxFlow App Entry Point v3.0
 * Initializes Metro Live Tile PWA shell, router, theme, AuthStore, AppStartEngine, and NotificationEngine.
 */

import './styles/metro-tiles.css';
import { initRouter, getCurrentRole, getRoutesForRole, navigate, type UserRole } from './engine/Router';
import { AuthStore, type AuthState } from './engine/AuthStore';
import { AppStartEngine } from './engine/AppStartEngine';
import { NotificationEngine } from './engine/NotificationEngine';
import { SyncOrchestrator } from './engine/SyncOrchestrator';

// ---------- Theme Management ----------

function initTheme(): void {
  const saved = localStorage.getItem('rxflow-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme(): void {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rxflow-theme', next);
}

// ---------- Nav Bar Rendering ----------

function renderNavBar(): void {
  const role = getCurrentRole();
  const nav = document.getElementById('app-nav');
  if (!nav || !role) {
    if (nav) nav.innerHTML = '';
    return;
  }

  const routeItems = getRoutesForRole(role);

  nav.innerHTML = `
    <div class="nav-bar">
      ${routeItems.map(r => `
        <button class="nav-btn ${window.location.hash === r.path ? 'active' : ''}"
                onclick="location.hash='${r.path}'">
          ${r.title}
        </button>
      `).join('')}
    </div>
  `;
}

// ---------- App Initialization ----------

function init(): void {
  initTheme();

  // Render app shell
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="app-container">
      <!-- Metro Header -->
      <header class="metro-header" id="app-header">
        <div>
          <div class="metro-title">RxFlow <strong>PWA</strong></div>
          <div class="metro-subtitle" id="user-subtitle">Pharma B2B Live Tile Hub • Maharashtra</div>
        </div>
        <div class="flex items-center gap-sm">
          <div id="sync-status"></div>
          <button class="theme-toggle-btn" id="theme-toggle" style="position:static;">🌓 Theme</button>
        </div>
      </header>

      <!-- Navigation Bar -->
      <nav id="app-nav"></nav>

      <!-- Main View Container -->
      <main id="app-view">
        <div class="skeleton" style="height: 140px; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 140px; margin-bottom: 12px;"></div>
        <div class="skeleton" style="height: 60px;"></div>
      </main>

      <!-- Toast Container -->
      <div class="toast-container" id="toast-container"></div>
    </div>
  `;

  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Listen for hash changes to update nav
  window.addEventListener('hashchange', renderNavBar);

  // Subscribe to AuthStore state
  AuthStore.subscribe((state: AuthState) => {
    const subtitle = document.getElementById('user-subtitle');
    if (subtitle && state.user) {
      subtitle.innerHTML = `${state.user.fullName} (${state.user.role.toUpperCase()}) • Maharashtra`;
    }
    renderNavBar();
  });

  // Hide header & nav until user logs in (login page manages visibility)
  const authState = AuthStore.getState();
  if (!authState.isAuthenticated) {
    const header = document.getElementById('app-header');
    const nav = document.getElementById('app-nav');
    if (header) header.style.display = 'none';
    if (nav) nav.style.display = 'none';
  }

  // Initialize AppStartEngine & Dev Drawer
  AppStartEngine.init();

  // Initialize router
  initRouter();
}

// Expose on window for dev console & handlers
(window as any).rxflow = {
  setRole: (role: UserRole) => {
    AuthStore.switchRole(role);
    renderNavBar();
  },
  navigate,
  toggleTheme,
  auth: AuthStore,
  sync: SyncOrchestrator,
  notify: NotificationEngine,
};

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
