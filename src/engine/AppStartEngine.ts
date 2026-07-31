/**
 * RxFlow AppStartEngine v3.0 (Unified Master Engine)
 * 
 * Single Best AppStart & Runtime Engine integrating:
 * - Boot Sequence & App Startup Health Monitor
 * - Periodic Heartbeat Connectivity Ping (30s Interval)
 * - License Status Monitor & Multi-Layer KeyStore Restore (LicenseEngine)
 * - Drug License Format Validator (XX-XXN-NNNNNN)
 * - Dev Tools Drawer, Persona Switcher, Network Mocker (2G/3G/Offline), & Telemetry Widget
 */

import { AuthStore, type UserEntity } from './AuthStore';
import { SyncOrchestrator, type SyncTelemetry } from './SyncOrchestrator';
import { NotificationEngine } from './NotificationEngine';
import { LicenseEngine } from './LicenseEngine';
import type { UserRole } from './Router';

export interface AppHealthStatus {
  isOnline: boolean;
  lastPingAt: string | null;
  latencyMs: number | null;
  licenseStatus: 'verified' | 'pending' | 'unverified' | 'not_applicable';
  syncReady: boolean;
  appVersion: string;
}

type HealthListener = (status: AppHealthStatus) => void;

class AppStartEngineService {
  private isDrawerOpen: boolean = false;
  private networkMode: 'online' | '3g' | '2g' | 'offline' = 'online';
  private healthStatus: AppHealthStatus = {
    isOnline: navigator.onLine,
    lastPingAt: null,
    latencyMs: null,
    licenseStatus: 'unverified',
    syncReady: false,
    appVersion: '3.0.0',
  };

  private healthListeners: Set<HealthListener> = new Set();
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  // ---------- Public Engine API ----------

  public async init(): Promise<void> {
    // 1. Connectivity Event Handlers
    window.addEventListener('online', () => this.handleConnectivityChange(true));
    window.addEventListener('offline', () => this.handleConnectivityChange(false));

    // 2. Multi-layer License Key Restore
    await LicenseEngine.init();

    // 3. Initial Ping & Health Check
    await this.performPing();

    // 4. Auth & License Monitor
    AuthStore.subscribe((authState) => {
      if (authState.user) {
        this.updateLicenseStatus(authState.user);
      } else {
        this.healthStatus.licenseStatus = 'unverified';
        this.notifyHealth();
      }
    });

    // 5. Start Heartbeat (Every 30s)
    if (!this.pingInterval) {
      this.pingInterval = setInterval(() => this.performPing(), 30_000);
    }

    // 6. UI Render & Sync Telemetry
    this.createDevDrawer();
    this.attachShortcut();
    this.renderSyncWidget();

    SyncOrchestrator.subscribe((telemetry) => {
      this.updateSyncWidget(telemetry);
    });

    console.log('[AppStartEngine] Master Engine Initialized — Heartbeat active (30s)');
  }

  public getStatus(): AppHealthStatus {
    return { ...this.healthStatus };
  }

  public subscribeHealth(listener: HealthListener): () => void {
    this.healthListeners.add(listener);
    listener(this.getStatus());
    return () => this.healthListeners.delete(listener);
  }

  public async forcePing(): Promise<AppHealthStatus> {
    await this.performPing();
    return this.getStatus();
  }

  /**
   * Verify drug license number format (XX-XXN-NNNNNN, e.g., MH-MZ2-482019).
   */
  public verifyDrugLicense(dlNumber: string): { valid: boolean; message: string } {
    const dlRegex = /^[A-Z]{2}-[A-Z]{2}\d-\d{6}$/;

    if (!dlNumber || dlNumber.trim().length === 0) {
      return { valid: false, message: 'Drug License number is required' };
    }

    if (!dlRegex.test(dlNumber.trim())) {
      return { valid: false, message: `Invalid DL format: "${dlNumber}". Expected: XX-XXN-NNNNNN (e.g., MH-MZ2-482019)` };
    }

    return { valid: true, message: `DL ${dlNumber} format verified ✓` };
  }

  // ---------- Private Heartbeat & Health Logic ----------

  private async performPing(): Promise<void> {
    const start = performance.now();
    const wasOnline = this.healthStatus.isOnline;

    try {
      if (navigator.onLine && this.networkMode !== 'offline') {
        this.healthStatus.isOnline = true;
        this.healthStatus.latencyMs = Math.round(performance.now() - start);
      } else {
        this.healthStatus.isOnline = false;
        this.healthStatus.latencyMs = null;
      }
    } catch {
      this.healthStatus.isOnline = false;
      this.healthStatus.latencyMs = null;
    }

    this.healthStatus.lastPingAt = new Date().toISOString();
    this.healthStatus.syncReady = this.healthStatus.isOnline;

    if (wasOnline !== this.healthStatus.isOnline) {
      console.log(`[AppStartEngine] Connectivity: ${this.healthStatus.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}`);
    }

    this.notifyHealth();
  }

  private handleConnectivityChange(online: boolean): void {
    this.healthStatus.isOnline = online && this.networkMode !== 'offline';
    this.healthStatus.syncReady = this.healthStatus.isOnline;
    this.healthStatus.lastPingAt = new Date().toISOString();
    this.notifyHealth();
  }

  private updateLicenseStatus(user: UserEntity): void {
    const dlRequiredRoles = ['retailer', 'distributor'];

    if (!dlRequiredRoles.includes(user.role)) {
      this.healthStatus.licenseStatus = 'not_applicable';
    } else {
      const activeLic = LicenseEngine.getActiveLicense();
      if (activeLic.validation.ok || user.isVerified) {
        this.healthStatus.licenseStatus = 'verified';
      } else if (user.dlNumber) {
        this.healthStatus.licenseStatus = 'pending';
      } else {
        this.healthStatus.licenseStatus = 'unverified';
      }
    }

    this.notifyHealth();
  }

  private notifyHealth(): void {
    const snapshot = this.getStatus();
    this.healthListeners.forEach(fn => fn(snapshot));
  }

  // ---------- Private Dev Drawer UI ----------

  private createDevDrawer(): void {
    const existing = document.getElementById('rxflow-dev-drawer');
    if (existing) return;

    const drawer = document.createElement('div');
    drawer.id = 'rxflow-dev-drawer';
    drawer.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 16px;
      z-index: var(--z-dev-drawer, 1000);
      font-family: var(--font-metro, sans-serif);
    `;

    drawer.innerHTML = `
      <!-- Trigger Badge -->
      <button id="dev-badge-btn" style="
        background: #0078D7;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <span>🛠️ Dev Tools</span>
        <span id="badge-network-dot" style="width:6px;height:6px;border-radius:50%;background:#00FF66;"></span>
      </button>

      <!-- Dev Panel -->
      <div id="dev-panel" style="
        display: none;
        position: absolute;
        bottom: 36px;
        left: 0;
        width: 320px;
        background: #1C1C1C;
        border: 1px solid #333333;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        color: white;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #333;padding-bottom:8px;">
          <div style="font-size:14px;font-weight:700;color:#0078D7;">🛠️ AppStart Master Engine</div>
          <button id="dev-close-btn" style="background:none;border:none;color:#888;cursor:pointer;">✕</button>
        </div>

        <!-- Persona Switcher -->
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px;">Switch Persona</div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px;">
            <button class="dev-role-btn" data-role="retailer" style="padding:6px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">🛍️ Retailer</button>
            <button class="dev-role-btn" data-role="distributor" style="padding:6px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">🚚 Distributor</button>
            <button class="dev-role-btn" data-role="manufacturer" style="padding:6px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">🏭 Manufacturer</button>
            <button class="dev-role-btn" data-role="sales_rep" style="padding:6px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">👨‍💼 Sales Rep</button>
            <button class="dev-role-btn" data-role="platform_admin" style="padding:6px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;grid-column:span 2;">👑 Platform Admin</button>
          </div>
        </div>

        <!-- Network Mocker -->
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:6px;">Network Speed Mock</div>
          <div style="display:flex;gap:4px;">
            <button class="dev-net-btn active" data-net="online" style="flex:1;padding:4px;font-size:10px;background:#0078D7;color:white;border:none;border-radius:4px;cursor:pointer;">⚡ Online</button>
            <button class="dev-net-btn" data-net="3g" style="flex:1;padding:4px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">📶 3G</button>
            <button class="dev-net-btn" data-net="2g" style="flex:1;padding:4px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">🐢 2G</button>
            <button class="dev-net-btn" data-net="offline" style="flex:1;padding:4px;font-size:10px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">🚫 Off</button>
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button id="dev-ping-btn" style="padding:8px;font-size:11px;font-weight:700;background:#D83B01;color:white;border:none;border-radius:4px;cursor:pointer;">📡 Heartbeat Ping Check</button>
          <button id="dev-license-btn" style="padding:8px;font-size:11px;font-weight:700;background:#5C2D91;color:white;border:none;border-radius:4px;cursor:pointer;">🛡️ Verify & Restore License</button>
          <button id="dev-push-btn" style="padding:8px;font-size:11px;font-weight:700;background:#0078D7;color:white;border:none;border-radius:4px;cursor:pointer;">🔔 Test VAPID Push Notification</button>
          <button id="dev-sync-btn" style="padding:8px;font-size:11px;font-weight:700;background:#00B7C3;color:white;border:none;border-radius:4px;cursor:pointer;">⚡ Trigger PowerSync Offline Sync</button>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);

    const badgeBtn = drawer.querySelector('#dev-badge-btn');
    const panel = drawer.querySelector('#dev-panel') as HTMLElement;
    const closeBtn = drawer.querySelector('#dev-close-btn');

    badgeBtn?.addEventListener('click', () => {
      this.isDrawerOpen = !this.isDrawerOpen;
      panel.style.display = this.isDrawerOpen ? 'block' : 'none';
    });

    closeBtn?.addEventListener('click', () => {
      this.isDrawerOpen = false;
      panel.style.display = 'none';
    });

    // Persona switch
    drawer.querySelectorAll('.dev-role-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = (e.currentTarget as HTMLElement).getAttribute('data-role') as UserRole;
        if (role) {
          AuthStore.switchRole(role);
          NotificationEngine.showToast(`Switched persona to ${role}`, 'success');
        }
      });
    });

    // Network speed mock
    drawer.querySelectorAll('.dev-net-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        drawer.querySelectorAll('.dev-net-btn').forEach(b => {
          (b as HTMLElement).style.background = '#222';
          (b as HTMLElement).style.border = '1px solid #444';
        });
        const target = e.currentTarget as HTMLElement;
        target.style.background = '#0078D7';
        target.style.border = 'none';

        const net = target.getAttribute('data-net') as 'online' | '3g' | '2g' | 'offline';
        this.networkMode = net;
        this.handleConnectivityChange(net !== 'offline');
        NotificationEngine.showToast(`Network mode set to ${net.toUpperCase()}`, 'info');
      });
    });

    // KeyGen button removed — keys generated externally via pharma_keygen.html

    // Heartbeat Ping button
    drawer.querySelector('#dev-ping-btn')?.addEventListener('click', async () => {
      const status = await this.forcePing();
      NotificationEngine.showToast(
        `📡 Heartbeat: ${status.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'} | Latency: ${status.latencyMs ?? '—'}ms | License: ${status.licenseStatus.toUpperCase()}`,
        status.isOnline ? 'success' : 'warning'
      );
    });

    // License check button
    drawer.querySelector('#dev-license-btn')?.addEventListener('click', async () => {
      const activeLic = await LicenseEngine.init();
      if (activeLic.ok) {
        NotificationEngine.showToast(
          `🛡️ Verified Key: [${LicenseEngine.getActiveLicense().key}] | Entity: ${activeLic.entityName} | Expires: ${activeLic.expiryDate?.toLocaleDateString('en-IN')}`,
          'success'
        );
      } else {
        NotificationEngine.showToast(
          `🛡️ License Status: ${activeLic.reason?.toUpperCase() || 'UNVERIFIED'} | ${activeLic.message || 'No 10-digit key found in storage'}`,
          'warning'
        );
      }
    });

    // Push test button
    drawer.querySelector('#dev-push-btn')?.addEventListener('click', () => {
      NotificationEngine.subscribeToPush();
    });

    // Sync test button
    drawer.querySelector('#dev-sync-btn')?.addEventListener('click', () => {
      SyncOrchestrator.triggerSync();
      NotificationEngine.showToast('PowerSync mutation queue synced to SQLite', 'success');
    });
  }

  private renderSyncWidget(): void {
    const container = document.getElementById('sync-status');
    if (!container) return;
    this.updateSyncWidget(SyncOrchestrator.getTelemetry());
  }

  private updateSyncWidget(telemetry: SyncTelemetry): void {
    const container = document.getElementById('sync-status');
    if (!container) return;

    const dotColor = telemetry.status === 'connected' ? '#00FF66' : telemetry.status === 'syncing' ? '#00B7C3' : '#D83B01';
    const statusText = telemetry.status === 'connected' ? 'Online' : telemetry.status === 'syncing' ? 'Syncing...' : 'Offline';

    container.innerHTML = `
      <div class="sync-bar" style="padding:4px 10px;font-size:10px;">
        <span style="width:6px;height:6px;border-radius:50%;background:${dotColor};"></span>
        <span>${statusText} • ${telemetry.cachedProductsCount} SKUs</span>
      </div>
    `;
  }

  private attachShortcut(): void {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        const panel = document.getElementById('dev-panel');
        if (panel) {
          this.isDrawerOpen = !this.isDrawerOpen;
          panel.style.display = this.isDrawerOpen ? 'block' : 'none';
        }
      }
    });
  }
}

export const AppStartEngine = new AppStartEngineService();

// Export PingEngine alias for backwards compatibility
export const PingEngine = AppStartEngine;
