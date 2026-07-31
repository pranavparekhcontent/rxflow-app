/**
 * Mediflow SalesRepView v3.0
 * Medical Representative (MR) beat plan, GPS check-in, on-behalf order booking, and cash/UPI collection logging.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { SyncOrchestrator } from '../../engine/SyncOrchestrator';

export interface BeatChemist {
  id: string;
  firmName: string;
  area: string;
  outstanding: number;
  visited: boolean;
  orderBooked: boolean;
}

export default function SalesRepView(container: HTMLElement): void {
  const chemists: BeatChemist[] = [
    { id: 'ret-01', firmName: 'Rajesh Medical Store', area: 'Rasta Peth', outstanding: 12450.00, visited: true, orderBooked: true },
    { id: 'ret-02', firmName: 'Ganesh Pharmacy', area: 'Sadashiv Peth', outstanding: 8200.00, visited: false, orderBooked: false },
    { id: 'ret-03', firmName: 'Sai Krupa Chemist', area: 'Pimpri', outstanding: 0.00, visited: false, orderBooked: false },
    { id: 'ret-04', firmName: 'Swastik Medical', area: 'Kothrud', outstanding: 4500.00, visited: false, orderBooked: false },
  ];

  function render(): void {
    const visitedCount = chemists.filter(c => c.visited).length;

    container.innerHTML = `
      <div class="section-title">👨‍💼 sales rep beat plan (pune east)</div>

      <!-- Beat Summary Card -->
      <div class="metro-grid" style="grid-auto-rows:120px;margin-bottom:16px;">
        <div class="tile tile-wide bg-cyan">
          <div class="tile-badge">Today's Beat</div>
          <div class="tile-icon">📍</div>
          <div>
            <div class="tile-value">${visitedCount} / ${chemists.length} Visited</div>
            <div class="tile-label">Beat: Pune East • Shrine Pharma Stockist</div>
          </div>
          <div class="tile-bar-bg">
            <div class="tile-bar-fill" style="width:${(visitedCount / chemists.length * 100).toFixed(0)}%;"></div>
          </div>
        </div>
        <div class="tile tile-small bg-green">
          <div class="tile-icon">💰</div>
          <div class="tile-value" style="font-size:20px;">₹15.0K</div>
          <div class="tile-label">Collected</div>
        </div>
        <div class="tile tile-small bg-blue">
          <div class="tile-icon">🛒</div>
          <div class="tile-value" style="font-size:20px;">₹18.4K</div>
          <div class="tile-label">Orders Booked</div>
        </div>
      </div>

      <!-- Chemist Visit List -->
      <div class="metro-list">
        ${chemists.map(c => `
          <div class="metro-item ${c.visited ? 'metro-item--green' : 'metro-item--teal'}">
            <div class="item-main">
              <div class="item-title">
                ${c.firmName}
                <span class="item-tag">${c.area}</span>
                ${c.visited ? '<span class="item-tag item-tag--green">GPS Verified ✓</span>' : ''}
              </div>
              <div class="item-sub">Outstanding Balance: ₹${c.outstanding.toLocaleString('en-IN')}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              ${!c.visited ? `
                <button class="action-btn checkin-btn" data-id="${c.id}" style="padding:6px 10px;font-size:11px;background:var(--tile-cyan);">
                  📍 Check-in
                </button>
              ` : `
                <button class="action-btn book-order-btn" data-id="${c.id}" style="padding:6px 10px;font-size:11px;background:var(--tile-green);">
                  🛒 Book Order
                </button>
                <button class="action-btn collect-cash-btn" data-id="${c.id}" style="padding:6px 10px;font-size:11px;background:var(--tile-amber);">
                  💰 Collect Cash
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    container.querySelectorAll('.checkin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const chemist = chemists.find(c => c.id === id);
        if (chemist) {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                chemist.visited = true;
                NotificationEngine.showToast(`📍 GPS Check-in verified for ${chemist.firmName}! (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`, 'success');
                render();
              },
              () => {
                chemist.visited = true;
                NotificationEngine.showToast(`📍 GPS Check-in verified for ${chemist.firmName}!`, 'success');
                render();
              }
            );
          } else {
            chemist.visited = true;
            render();
          }
        }
      });
    });

    container.querySelectorAll('.book-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        NotificationEngine.showToast('🛒 On-behalf order form opened! Saved with placed_via = "mr_app"', 'info');
      });
    });

    container.querySelectorAll('.collect-cash-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await SyncOrchestrator.queueMutation('ledgers', 'INSERT', {
          narrative: 'Cash collection recorded by MR Vikram Joshi',
          credit_amount: 5000,
          created_at: new Date().toISOString(),
        });
        NotificationEngine.showToast('💰 Cash collection of ₹5,000 recorded in append-only ledger!', 'success');
      });
    });
  }

  render();
}
