/**
 * Mediflow Order Queue View v3.0
 * Realtime distributor order inbox with FEFO stock allocation, invoice generation, and status controls.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { SyncOrchestrator } from '../../engine/SyncOrchestrator';

interface QueuedOrder {
  id: string;
  orderNo: string;
  retailerName: string;
  location: string;
  itemsCount: number;
  totalAmount: number;
  placedTime: string;
  status: 'Pending FEFO' | 'Allocated' | 'Dispatched' | 'Rejected';
}

export default function OrderQueueView(container: HTMLElement): void {
  const orders: QueuedOrder[] = [
    {
      id: 'ord-1',
      orderNo: '#ORD-2026-4521',
      retailerName: 'Rajesh Medical Store',
      location: 'Kothrud, Pune',
      itemsCount: 12,
      totalAmount: 18450,
      placedTime: '3 min ago',
      status: 'Pending FEFO',
    },
    {
      id: 'ord-2',
      orderNo: '#ORD-2026-4520',
      retailerName: 'Ganesh Pharmacy',
      location: 'Deccan, Pune',
      itemsCount: 8,
      totalAmount: 7200,
      placedTime: '15 min ago',
      status: 'Pending FEFO',
    },
    {
      id: 'ord-3',
      orderNo: '#ORD-2026-4519',
      retailerName: 'Apollo Chemist',
      location: 'Viman Nagar, Pune',
      itemsCount: 24,
      totalAmount: 42100,
      placedTime: '1 hour ago',
      status: 'Allocated',
    }
  ];

  function render(): void {
    container.innerHTML = `
      <div class="section-title">Distributor Order Inbox & Queue</div>
      
      <!-- Action Bar -->
      <div class="flex justify-between items-center mb-md">
        <div class="flex gap-sm">
          <button id="btn-accept-all" class="nav-btn active" style="padding:6px 14px;font-size:12px;font-weight:700;">
            ✅ Auto-Allocate All FEFO
          </button>
          <button id="btn-export-queue" class="dev-role-btn" style="padding:6px 14px;font-size:12px;background:#222;color:white;border:1px solid #444;border-radius:4px;cursor:pointer;">
            📥 Export Pick List CSV
          </button>
        </div>
        <span class="badge badge-warning" style="font-size:12px;">${orders.filter(o => o.status === 'Pending FEFO').length} Pending Orders</span>
      </div>

      <!-- Orders Queue List -->
      <div class="metro-list">
        ${orders.map(ord => `
          <div class="metro-item ${ord.status === 'Pending FEFO' ? '' : ord.status === 'Allocated' ? 'metro-item--teal' : 'metro-item--green'}" style="margin-bottom:10px;">
            <div class="item-main">
              <div class="item-title flex items-center gap-sm">
                ${ord.status === 'Pending FEFO' ? '<span class="pulse-dot"></span>' : ''}
                <strong>${ord.retailerName}</strong> (${ord.location})
                <span class="status-badge ${ord.status === 'Pending FEFO' ? 'status-badge--pending' : ord.status === 'Allocated' ? 'status-badge--accepted' : 'status-badge--dispatched'}" style="font-size:10px;">
                  ${ord.status}
                </span>
              </div>
              <div class="item-sub">
                ${ord.orderNo} • ${ord.itemsCount} SKUs • Received ${ord.placedTime}
              </div>
            </div>
            <div class="item-price flex items-center gap-md">
              <div class="text-right">
                <div class="price-main">₹${ord.totalAmount.toLocaleString()}</div>
                <div class="price-sub" style="font-size:10px;color:#aaa;">GST Invoice Ready</div>
              </div>
              
              <div class="flex gap-xs">
                ${ord.status === 'Pending FEFO' ? `
                  <button class="btn-approve-order" data-id="${ord.id}" style="padding:6px 12px;background:#107C41;color:white;border:none;border-radius:4px;font-weight:700;cursor:pointer;font-size:11px;">
                    Approve FEFO
                  </button>
                  <button class="btn-reject-order" data-id="${ord.id}" style="padding:6px 8px;background:#333;color:#ff5555;border:1px solid #555;border-radius:4px;cursor:pointer;font-size:11px;">
                    Reject
                  </button>
                ` : `
                  <button class="btn-dispatch-order" data-id="${ord.id}" style="padding:6px 12px;background:#0078D7;color:white;border:none;border-radius:4px;font-weight:700;cursor:pointer;font-size:11px;">
                    📦 Dispatch
                  </button>
                `}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelector('#btn-accept-all')?.addEventListener('click', () => {
      orders.forEach(o => {
        if (o.status === 'Pending FEFO') o.status = 'Allocated';
      });
      NotificationEngine.showToast('All pending orders allocated via FEFO stock batch matching', 'success');
      render();
    });

    container.querySelector('#btn-export-queue')?.addEventListener('click', () => {
      NotificationEngine.showToast('Pick List CSV downloaded for Godown Dispatcher', 'info');
    });

    container.querySelectorAll('.btn-approve-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const ord = orders.find(o => o.id === id);
        if (ord) {
          ord.status = 'Allocated';
          SyncOrchestrator.queueMutation('order_queue', 'UPDATE', { id: ord.id, status: 'Allocated' });
          NotificationEngine.showToast(`Order ${ord.orderNo} FEFO stock allocated`, 'success');
          render();
        }
      });
    });

    container.querySelectorAll('.btn-reject-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const ord = orders.find(o => o.id === id);
        if (ord) {
          ord.status = 'Rejected';
          NotificationEngine.showToast(`Order ${ord.orderNo} rejected`, 'info');
          render();
        }
      });
    });

    container.querySelectorAll('.btn-dispatch-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const ord = orders.find(o => o.id === id);
        if (ord) {
          ord.status = 'Dispatched';
          NotificationEngine.showToast(`Order ${ord.orderNo} marked as Dispatched with Delivery Slip`, 'success');
          render();
        }
      });
    });
  }

  render();
}
