/**
 * Mediflow RetailerPaymentReminders v3.0
 * Overdue & due bill alerts with 1-tap UPI payment deep links (`upi://pay`).
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface DueInvoice {
  invoiceNumber: string;
  distributorName: string;
  amount: number;
  dueDate: string;
  status: 'due_soon' | 'overdue' | 'paid';
  upiVpa: string;
}

export default function RetailerPaymentReminders(container: HTMLElement): void {
  const invoices: DueInvoice[] = [
    { invoiceNumber: 'INV-2026-0847', distributorName: 'Shrine Pharma Stockist', amount: 12450.00, dueDate: '30 Jul 2026', status: 'due_soon', upiVpa: 'shrinepharma@upi' },
    { invoiceNumber: 'INV-2026-0832', distributorName: 'Medico Distributors', amount: 8200.00, dueDate: '01 Aug 2026', status: 'due_soon', upiVpa: 'medicodistributors@upi' },
    { invoiceNumber: 'INV-2026-0799', distributorName: 'Swastik Wholesaler', amount: 4500.00, dueDate: '20 Jul 2026', status: 'overdue', upiVpa: 'swastikpharma@upi' },
  ];

  container.innerHTML = `
    <div class="section-title">💳 due payments & 1-tap UPI checkout</div>

    <!-- Outstanding Summary -->
    <div class="metro-grid" style="grid-auto-rows:120px;margin-bottom:16px;">
      <div class="tile tile-wide bg-amber">
        <div class="tile-badge">Alert</div>
        <div class="tile-icon">💳</div>
        <div>
          <div class="tile-value">₹25,150</div>
          <div class="tile-label">Total Outstanding Due</div>
          <div class="tile-subtext">3 Invoices Across Stockists</div>
        </div>
      </div>
      <div class="tile tile-wide bg-red">
        <div class="tile-badge">Overdue</div>
        <div class="tile-icon">⚠️</div>
        <div>
          <div class="tile-value">₹4,500</div>
          <div class="tile-label">Overdue Payment</div>
          <div class="tile-subtext">Pay immediately to avoid credit lock</div>
        </div>
      </div>
    </div>

    <!-- Invoices List -->
    <div class="metro-list">
      ${invoices.map(inv => {
        const isOverdue = inv.status === 'overdue';

        return `
          <div class="metro-item ${isOverdue ? 'metro-item--red' : 'metro-item--amber'}">
            <div class="item-main">
              <div class="item-title">
                ${inv.invoiceNumber}
                <span class="status-badge ${isOverdue ? 'status-badge--overdue' : 'status-badge--pending'}">
                  ${isOverdue ? '⚠️ Overdue' : 'Due Soon'}
                </span>
              </div>
              <div class="item-sub">Stockist: ${inv.distributorName} • Due: ${inv.dueDate}</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="item-price">
                <div class="price-main">₹${inv.amount.toLocaleString('en-IN')}</div>
              </div>
              <button class="action-btn pay-upi-btn" data-inv="${inv.invoiceNumber}" data-amt="${inv.amount}" data-vpa="${inv.upiVpa}"
                      style="padding:8px 14px;font-size:11px;background:var(--tile-cyan);">
                📱 Pay UPI
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="action-bar" style="margin-top:20px;">
      <button class="action-btn action-btn--success" id="btn-notify-reminders">
        🔔 Send Daily Payment Summary via VAPID Push ($0)
      </button>
    </div>
  `;

  attachEvents();

  function attachEvents(): void {
    container.querySelectorAll('.pay-upi-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const inv = (e.currentTarget as HTMLElement).getAttribute('data-inv') || '';
        const amt = parseFloat((e.currentTarget as HTMLElement).getAttribute('data-amt') || '0');
        const vpa = (e.currentTarget as HTMLElement).getAttribute('data-vpa') || 'shrinepharma@upi';

        // Launch native UPI app (GPay, PhonePe, Paytm) via upi:// URI scheme
        const upiUrl = `upi://pay?pa=${vpa}&pn=RxFlow&am=${amt}&tr=${inv}&cu=INR`;
        NotificationEngine.showToast(`Launching UPI App for Invoice ${inv} (₹${amt})...`, 'success');

        // Open UPI deep link
        window.location.href = upiUrl;
      });
    });

    container.querySelector('#btn-notify-reminders')?.addEventListener('click', () => {
      NotificationEngine.showToast('🔔 Sent VAPID push payment reminder to device!', 'success');
    });
  }
}
