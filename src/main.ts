/**
 * RxFlow App Entry Point v3.0
 * Initializes Metro Live Tile PWA shell, router, theme, AuthStore, AppStartEngine, and NotificationEngine.
 */

import './styles/metro-tiles.css';
import { initRouter, getCurrentRole, navigate } from './engine/Router';
import { AuthStore, type AuthState } from './engine/AuthStore';
import { AppStartEngine } from './engine/AppStartEngine';

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

import { LicenseEngine } from './engine/LicenseEngine';

// ---------- App Initialization ----------

async function init(): Promise<void> {
  initTheme();

  // Render app shell without top horizontal nav bar
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="app-container">
      <!-- Metro Header -->
      <header class="metro-header" id="app-header">
        <div>
          <div class="metro-title">RxFlow <strong>PWA</strong></div>
          <div class="metro-subtitle" id="user-subtitle">Pharma B2B Hub • Maharashtra</div>
        </div>
        <div class="flex items-center gap-sm">
          <div id="sync-status"></div>
          <button class="theme-toggle-btn" id="theme-toggle" style="position:static;">🌓 Theme</button>
        </div>
      </header>

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

  // Subscribe to AuthStore state
  AuthStore.subscribe((state: AuthState) => {
    const subtitle = document.getElementById('user-subtitle');
    if (subtitle && state.user) {
      subtitle.innerHTML = `${state.user.fullName} (${state.user.role.toUpperCase()}) • Maharashtra`;
    }
  });

  // 1. Initialize LicenseEngine FIRST
  const licStatus = await LicenseEngine.init();

  // If license is NOT verified, clear stale auth session & force header hidden
  if (!licStatus.ok) {
    AuthStore.logoutWithoutRedirect();
    const header = document.getElementById('app-header');
    if (header) header.style.display = 'none';
  } else {
    // Hide header if not logged in
    const authState = AuthStore.getState();
    if (!authState.isAuthenticated) {
      const header = document.getElementById('app-header');
      if (header) header.style.display = 'none';
    }
  }

  // 2. Initialize AppStartEngine & Dev Drawer
  AppStartEngine.init();

  // 3. Initialize router
  initRouter();
}

// Expose on window for dev console & handlers
(window as any).RxFlow = {
  navigate,
  getCurrentRole,
};

document.addEventListener('DOMContentLoaded', init);
