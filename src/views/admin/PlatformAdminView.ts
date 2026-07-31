/**
 * RxFlow PlatformAdminView v3.0
 * Platform governance desk: manual Drug License (DL) verification, account suspension, and dispute mediation.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface PendingDlVerification {
  id: string;
  firmName: string;
  district: string;
  dl20b: string;
  dl21b: string;
  expiryDate: string;
  status: string;
}

export default function PlatformAdminView(container: HTMLElement): void {
  const pendingDls: PendingDlVerification[] = [
    { id: 'ret-new-001', firmName: 'Shri Sai Chemist', district: 'Pune (Hadapsar)', dl20b: 'MH-MZ2-984011', dl21b: 'MH-MZ2-984012', expiryDate: '15 Dec 2028', status: 'pending_verification' },
    { id: 'ret-new-002', firmName: 'Mahavir Medical Store', district: 'Nashik', dl20b: 'MH-NSK-441029', dl21b: 'MH-NSK-441030', expiryDate: '20 Oct 2027', status: 'pending_verification' },
  ];

  function render(): void {
    container.innerHTML = `
      <div class="section-title">👑 platform admin — compliance & DL verification desk</div>

      <!-- Compliance Summary -->
      <div class="metro-grid" style="grid-auto-rows:120px;margin-bottom:20px;">
        <div class="tile tile-wide bg-purple">
          <div class="tile-badge">Manual DL Queue</div>
          <div class="tile-icon">🛡️</div>
          <div>
            <div class="tile-value">${pendingDls.length} Pending</div>
            <div class="tile-label">Drug License Verifications</div>
          </div>
        </div>
        <div class="tile tile-small bg-green">
          <div class="tile-badge">Pass Rate</div>
          <div class="tile-value" style="font-size:22px;">99.2%</div>
          <div class="tile-label">FDA Compliance</div>
        </div>
        <div class="tile tile-small bg-blue">
          <div class="tile-badge">Clients</div>
          <div class="tile-value" style="font-size:22px;">100</div>
          <div class="tile-label">Active Users</div>
        </div>
      </div>

      <!-- Pending DL Table -->
      <div class="section-title">pending manual drug license verification queue</div>
      <div class="metro-list">
        ${pendingDls.map(item => `
          <div class="metro-item metro-item--purple">
            <div class="item-main">
              <div class="item-title">
                ${item.firmName}
                <span class="item-tag">${item.district}</span>
                <span class="status-badge status-badge--pending">Pending Verification</span>
              </div>
              <div class="item-sub">20B: ${item.dl20b} • 21B: ${item.dl21b} • Expiry: ${item.expiryDate}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <button class="action-btn verify-dl-btn" data-id="${item.id}" style="padding:6px 12px;font-size:11px;background:var(--tile-green);">
                ✅ Verify Manual DL
              </button>
              <button class="action-btn reject-dl-btn" data-id="${item.id}" style="padding:6px 12px;font-size:11px;background:var(--tile-red);">
                ❌ Reject
              </button>
            </div>
          </div>
        `).join('')}

        ${pendingDls.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">✅</div>
            <div class="empty-state__text">All Drug Licenses verified! Queue empty.</div>
          </div>
        ` : ''}
      </div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    container.querySelectorAll('.verify-dl-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const idx = pendingDls.findIndex(i => i.id === id);
        if (idx !== -1) {
          const item = pendingDls[idx];
          pendingDls.splice(idx, 1);
          render();
          NotificationEngine.showToast(`✅ Manual DL verification approved for ${item.firmName}! Status: verified_manual ($0 cost)`, 'success');
        }
      });
    });

    container.querySelectorAll('.reject-dl-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const idx = pendingDls.findIndex(i => i.id === id);
        if (idx !== -1) {
          pendingDls.splice(idx, 1);
          render();
          NotificationEngine.showToast('DL verification rejected. Chemist notified to re-upload documents.', 'warning');
        }
      });
    });
  }

  render();
}
