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
          <div style="display:flex; align-items:center; gap:10px; cursor:pointer;" onclick="window.location.hash='#/'">
            <img src="/rxflow-logo.png" alt="RxFlow Logo" style="height:64px; width:auto; object-fit:contain; filter:drop-shadow(0 3px 12px rgba(0,120,215,0.5));" />
            <span style="font-size:14px; font-weight:900; color:var(--tile-cyan); background:rgba(0,183,195,0.15); padding:3px 10px; border-radius:6px; text-transform:uppercase; letter-spacing:1px;">PWA</span>
          </div>
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

// Register Service Worker & capture PWA install prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update();
    }).catch(err => {
      console.log('SW registration notice:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).deferredInstallPrompt = e;
});

// Expose on window for dev console & handlers
(window as any).RxFlow = {
  navigate,
  getCurrentRole,
  toggleTheme,
};

document.addEventListener('DOMContentLoaded', init);

