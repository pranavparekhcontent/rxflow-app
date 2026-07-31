/**
 * RxFlow SalesRepView v3.0
 * Medical Representative (MR) SalesReps S1 to S10 beat plan, GPS check-in, on-behalf order booking.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { SALES_REPS, RETAILERS } from '../../data/mockDataStore';

export default function SalesRepView(container: HTMLElement): void {
  const activeRep = SALES_REPS[0]; // SalesRep S1 by default
  const chemists = RETAILERS.map((r, i) => ({
    id: r.id,
    firmName: r.name,
    area: `Beat Zone Z${i + 1}`,
    outstanding: (i + 1) * 3500,
    visited: i < 3,
    orderBooked: i < 2,
  }));

  function render(): void {
    const visitedCount = chemists.filter(c => c.visited).length;

    container.innerHTML = `
      <div class="section-title">👨‍💼 Sales Rep Beat Plan (${activeRep.name} • ${activeRep.distributorName})</div>

      <!-- Beat Summary Card -->
      <div class="metro-grid" style="grid-auto-rows:120px;margin-bottom:16px;">
        <div class="tile tile-wide bg-cyan">
          <div class="tile-badge">Today's Beat: ${activeRep.beat}</div>
          <div class="tile-icon">📍</div>
          <div>
            <div class="tile-value">${visitedCount} / ${chemists.length} Visited</div>
            <div class="tile-label">${activeRep.name} • ${activeRep.distributorName}</div>
          </div>
          <div class="tile-bar-bg">
            <div class="tile-bar-fill" style="width:${(visitedCount / chemists.length * 100).toFixed(0)}%;"></div>
          </div>
        </div>
        <div class="tile tile-small bg-green">
          <div class="tile-icon">💰</div>
          <div class="tile-value" style="font-size:20px;">₹45.0K</div>
          <div class="tile-label">Collected</div>
        </div>
        <div class="tile tile-small bg-blue">
          <div class="tile-icon">🛒</div>
          <div class="tile-value" style="font-size:20px;">₹68.4K</div>
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
          chemist.visited = true;
          NotificationEngine.showToast(`📍 GPS Check-in verified for ${chemist.firmName} by ${activeRep.name}!`, 'success');
          render();
        }
      });
    });

    container.querySelectorAll('.book-order-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        NotificationEngine.showToast(`🛒 Order booked by ${activeRep.name} (placed_via = "mr_app")`, 'info');
      });
    });

    container.querySelectorAll('.collect-cash-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await SyncOrchestrator.queueMutation('ledgers', 'INSERT', {
          narrative: `Cash collection recorded by ${activeRep.name}`,
          credit_amount: 5000,
          created_at: new Date().toISOString(),
        });
        NotificationEngine.showToast(`💰 Cash collection recorded by ${activeRep.name}!`, 'success');
      });
    });
  }

  render();
}
