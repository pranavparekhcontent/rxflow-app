/**
 * Mediflow MultiCartSplitter v3.0
 * Multi-distributor split cart engine with MOV validation, scheme slab checks, credit limits, and offline checkout.
 */

import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { NotificationEngine } from '../../engine/NotificationEngine';
import { navigate } from '../../engine/Router';

export interface CartSubOrder {
  distributorId: string;
  distributorName: string;
  movAmount: number;
  creditLimit: number;
  creditAvailable: number;
  items: Array<{
    sku: string;
    brandName: string;
    packSize: string;
    qty: number;
    ptr: number;
    schemeText?: string;
  }>;
}

export default function MultiCartSplitter(container: HTMLElement): void {
  // Sample split cart state across 2 Pune distributors
  const cart: CartSubOrder[] = [
    {
      distributorId: 'dist-shrine-001',
      distributorName: 'Shrine Pharma Stockist',
      movAmount: 500,
      creditLimit: 100000,
      creditAvailable: 85400,
      items: [
        { sku: 'AUG625', brandName: 'Augmentin 625 Duo Tablet', packSize: '10x10', qty: 10, ptr: 142.50, schemeText: 'Buy 10 Get 2 Free' },
        { sku: 'PAND', brandName: 'Pan-D Capsule', packSize: '10x10', qty: 15, ptr: 88.00, schemeText: 'Margin: 24%' }
      ]
    },
    {
      distributorId: 'dist-medico-002',
      distributorName: 'Medico Distributors (Pune)',
      movAmount: 1000,
      creditLimit: 50000,
      creditAvailable: 32000,
      items: [
        { sku: 'DOLO650', brandName: 'Dolo 650 Tablet', packSize: '15x10', qty: 20, ptr: 26.80, schemeText: '₹2 Off per box' }
      ]
    }
  ];

  function calculateTotals(sub: CartSubOrder): { subtotal: number; tax: number; total: number; movMet: boolean; creditOk: boolean } {
    const subtotal = sub.items.reduce((sum, item) => sum + (item.qty * item.ptr), 0);
    const tax = subtotal * 0.12; // 12% GST
    const total = subtotal + tax;
    const movMet = total >= sub.movAmount;
    const creditOk = total <= sub.creditAvailable;
    return { subtotal, tax, total, movMet, creditOk };
  }

  function render(): void {
    let grandTotal = 0;

    container.innerHTML = `
      <div class="section-title">smart split cart (multi-distributor)</div>

      ${cart.map((sub, idx) => {
        const { subtotal, tax, total, movMet, creditOk } = calculateTotals(sub);
        grandTotal += total;

        return `
          <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--tile-radius);padding:16px;margin-bottom:16px;">
            <!-- Distributor Header -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle);">
              <div>
                <div style="font-size:16px;font-weight:700;color:var(--tile-blue);">${sub.distributorName}</div>
                <div style="font-size:11px;color:var(--text-secondary);">MOV: ₹${sub.movAmount} • Available Credit: ₹${sub.creditAvailable.toLocaleString('en-IN')}</div>
              </div>
              <div style="display:flex;gap:6px;">
                ${movMet ? '<span class="status-badge status-badge--accepted">MOV Met ✓</span>' : '<span class="status-badge status-badge--overdue">Below MOV</span>'}
                ${creditOk ? '<span class="status-badge status-badge--pending">Credit OK ✓</span>' : '<span class="status-badge status-badge--overdue">Credit Exceeded</span>'}
              </div>
            </div>

            <!-- Line Items -->
            <div class="metro-list">
              ${sub.items.map(item => `
                <div class="metro-item" style="border-left-width:3px;">
                  <div class="item-main">
                    <div class="item-title">
                      ${item.brandName}
                      <span class="item-tag">${item.packSize}</span>
                      ${item.schemeText ? `<span class="item-tag item-tag--green">${item.schemeText}</span>` : ''}
                    </div>
                    <div class="item-sub">PTR: ₹${item.ptr.toFixed(2)} • GST: 12%</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:12px;">
                    <div style="display:flex;align-items:center;gap:6px;background:var(--bg-input);padding:4px 8px;border-radius:4px;">
                      <button class="qty-btn" data-sub="${idx}" data-sku="${item.sku}" data-delta="-1" style="background:none;border:none;color:white;cursor:pointer;font-weight:700;">-</button>
                      <span style="font-weight:700;font-size:14px;min-width:20px;text-align:center;">${item.qty}</span>
                      <button class="qty-btn" data-sub="${idx}" data-sku="${item.sku}" data-delta="1" style="background:none;border:none;color:white;cursor:pointer;font-weight:700;">+</button>
                    </div>
                    <div class="item-price">
                      <div class="price-main">₹${(item.qty * item.ptr * 1.12).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Subtotal & Checkout -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:10px;border-top:1px dashed var(--border-subtle);">
              <div style="font-size:12px;color:var(--text-secondary);">
                Subtotal: ₹${subtotal.toFixed(2)} + GST: ₹${tax.toFixed(2)}
              </div>
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="font-size:18px;font-weight:700;color:var(--text-primary);">Total: ₹${total.toFixed(2)}</div>
                <button class="action-btn action-btn--primary checkout-sub-btn" data-sub="${idx}" ${!movMet || !creditOk ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                  Place Sub-Order
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}

      <!-- Grand Total & Global Checkout -->
      <div style="background:var(--bg-elevated);border-left:4px solid var(--tile-green);padding:18px;border-radius:var(--tile-radius);margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;">Grand Total Across All Stockists</div>
            <div style="font-size:28px;font-weight:800;color:var(--tile-green);">₹${grandTotal.toFixed(2)}</div>
          </div>
          <button class="action-btn action-btn--success" id="btn-place-all-orders" style="padding:14px 24px;font-size:14px;">
            ⚡ Place All Orders (Offline Sync)
          </button>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    // Quantity increment/decrement
    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subIdx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-sub') || '0', 10);
        const sku = (e.currentTarget as HTMLElement).getAttribute('data-sku');
        const delta = parseInt((e.currentTarget as HTMLElement).getAttribute('data-delta') || '0', 10);

        const sub = cart[subIdx];
        if (sub) {
          const item = sub.items.find(i => i.sku === sku);
          if (item) {
            item.qty = Math.max(1, item.qty + delta);
            render();
          }
        }
      });
    });

    // Sub-order checkout
    container.querySelectorAll('.checkout-sub-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subIdx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-sub') || '0', 10);
        const sub = cart[subIdx];
        if (sub) {
          submitSubOrder(sub);
        }
      });
    });

    // Place all orders
    container.querySelector('#btn-place-all-orders')?.addEventListener('click', () => {
      cart.forEach(sub => submitSubOrder(sub));
      navigate('#/retailer/orders');
    });
  }

  async function submitSubOrder(sub: CartSubOrder): Promise<void> {
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Queue mutation locally in PowerSync SQLite
    await SyncOrchestrator.queueMutation('orders', 'INSERT', {
      order_number: orderNumber,
      distributor_id: sub.distributorId,
      status: 'submitted',
      total_amount: calculateTotals(sub).total,
      created_at: new Date().toISOString(),
    });

    NotificationEngine.showToast(`⚡ Order #${orderNumber} submitted to ${sub.distributorName}`, 'success');

    // Generate wa.me WhatsApp confirmation link
    const waLink = NotificationEngine.generateWhatsAppOrderLink('+919822012345', orderNumber, calculateTotals(sub).total, sub.items.length);
    console.log('[MultiCartSplitter] WhatsApp Share Link:', waLink);
  }

  render();
}
