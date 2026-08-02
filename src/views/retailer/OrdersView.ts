/**
 * RxFlow Retailer Order Tracker & Invoice Desk v5.0
 * Features:
 * 1. 🚚 DISPATCHED ORDERS DESK: Displays active dispatched orders in transit with live logistics tracking, vehicle #, driver contact & delivery progress.
 * 2. 📦 ORDERS RECEIVED / DELIVERED DESK: Displays delivered orders with Proof of Delivery (POD), receiver signature & delivered history.
 * 3. 📑 INVOICES & PAYMENT TRACKER DESK: Displays distributor bills with PDF viewer, direct download from Supabase storage, print & 1-click Pay Now.
 * 4. 🌗 Full Dark & Light Theme compatibility (zero hidden text).
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  orderNo: string;
  distributorName: string;
  distributorPhone: string;
  distributorGstin: string;
  distributorAddress: string;
  date: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  paidDate?: string;
  paymentMode?: string;
  pdfUrl: string;
  items: Array<{
    name: string;
    salt: string;
    hsn: string;
    batch: string;
    qty: number;
    ptr: number;
    mrp: number;
    gstPct: number;
    total: number;
  }>;
}

export interface DispatchedOrder {
  orderNo: string;
  invoiceNo: string;
  distributorName: string;
  distributorPhone: string;
  dispatchDate: string;
  expectedDelivery: string;
  courierName: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  totalAmount: number;
  itemCount: number;
  status: 'DISPATCHED' | 'OUT_FOR_DELIVERY';
  liveProgressPct: number;
  trackingSteps: Array<{ title: string; time: string; done: boolean; current?: boolean }>;
}

export interface DeliveredOrder {
  orderNo: string;
  invoiceNo: string;
  distributorName: string;
  distributorPhone: string;
  deliveredDate: string;
  deliveredTime: string;
  receivedBy: string;
  podNumber: string;
  totalAmount: number;
  itemCount: number;
  verificationStatus: string;
}

export default function OrdersView(container: HTMLElement): void {
  // Dispatched Orders Mock Data
  const dispatchedOrders: DispatchedOrder[] = [
    {
      orderNo: 'ORD-2026-8821',
      invoiceNo: 'INV-2026-8821',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      dispatchDate: 'Today, 02:15 PM',
      expectedDelivery: 'Today by 04:45 PM',
      courierName: 'Speed Logistics Pune',
      vehicleNo: 'MH 12 AB 9921',
      driverName: 'Sunil More',
      driverPhone: '+91 98220 99887',
      totalAmount: 18450,
      itemCount: 12,
      status: 'OUT_FOR_DELIVERY',
      liveProgressPct: 75,
      trackingSteps: [
        { title: 'Order Confirmed & Billed', time: '01:30 PM', done: true },
        { title: 'Packed & FEFO Checked', time: '02:00 PM', done: true },
        { title: 'Dispatched from Warehouse', time: '02:15 PM', done: true },
        { title: 'Out for Delivery (Swargate Route)', time: '03:10 PM', done: true, current: true },
        { title: 'Expected Delivery at Pharmacy', time: '04:45 PM', done: false }
      ]
    },
    {
      orderNo: 'ORD-2026-8824',
      invoiceNo: 'INV-2026-8824',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      dispatchDate: 'Today, 11:30 AM',
      expectedDelivery: 'Today by 05:30 PM',
      courierName: 'Express Pharma Cargo',
      vehicleNo: 'MH 12 CD 4410',
      driverName: 'Ramesh Shinde',
      driverPhone: '+91 98230 44551',
      totalAmount: 9200,
      itemCount: 6,
      status: 'DISPATCHED',
      liveProgressPct: 50,
      trackingSteps: [
        { title: 'Order Confirmed & Billed', time: '10:45 AM', done: true },
        { title: 'Packed & Sealed', time: '11:15 AM', done: true },
        { title: 'Dispatched in Transit', time: '11:30 AM', done: true, current: true },
        { title: 'Arrived at Local Transit Hub', time: 'Pending', done: false },
        { title: 'Delivery to Pharmacy', time: '05:30 PM', done: false }
      ]
    }
  ];

  // Delivered / Received Orders Mock Data
  const deliveredOrders: DeliveredOrder[] = [
    {
      orderNo: 'ORD-2026-4519',
      invoiceNo: 'INV-2026-8813',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      deliveredDate: '26-07-2026',
      deliveredTime: '11:30 AM',
      receivedBy: 'Ramesh (Store Manager)',
      podNumber: 'POD-991823',
      totalAmount: 7800.00,
      itemCount: 2,
      verificationStatus: '100% Items & Batch Verified ✓'
    },
    {
      orderNo: 'ORD-2026-4402',
      invoiceNo: 'INV-2026-8790',
      distributorName: 'Swastik Medical Wholesaler',
      distributorPhone: '+91 98230 30003',
      deliveredDate: '16-07-2026',
      deliveredTime: '02:45 PM',
      receivedBy: 'Pranav (Owner)',
      podNumber: 'POD-884102',
      totalAmount: 24150.00,
      itemCount: 3,
      verificationStatus: '100% Items & Batch Verified ✓'
    },
    {
      orderNo: 'ORD-2026-4290',
      invoiceNo: 'INV-2026-8710',
      distributorName: 'Apex Pharma',
      distributorPhone: '+91 98230 40004',
      deliveredDate: '03-07-2026',
      deliveredTime: '10:15 AM',
      receivedBy: 'Suresh (Chemist Assistant)',
      podNumber: 'POD-773011',
      totalAmount: 5400.00,
      itemCount: 2,
      verificationStatus: '100% Items & Batch Verified ✓'
    }
  ];

  // Invoices List Data
  const invoicesList: InvoiceRecord[] = [
    {
      id: 'inv-101',
      invoiceNo: 'INV-2026-8812',
      orderNo: 'ORD-2026-4518',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      distributorGstin: '27AAAAA0000A1Z5',
      distributorAddress: 'Swargate Industrial Estate, Pune, MH 411037',
      date: '2026-07-28',
      dueDate: '2026-08-10',
      amount: 12450.00,
      taxAmount: 1333.92,
      status: 'UNPAID',
      pdfUrl: 'https://hspvkmjpcnkqqpoksveo.supabase.co/storage/v1/object/public/distributor-invoices/INV-2026-8812.pdf',
      items: [
        { name: 'Augmentin 625 Duo Tablet', salt: 'Amoxicillin + Clavulanic Acid', hsn: '3004', batch: 'AUG-8821', qty: 10, ptr: 142.50, mrp: 201.71, gstPct: 12, total: 1596.00 },
        { name: 'Pan-D Capsule', salt: 'Pantoprazole + Domperidone', hsn: '3004', batch: 'PND-3401', qty: 15, ptr: 88.00, mrp: 156.00, gstPct: 12, total: 1478.40 },
        { name: 'Shelcal 500 Tablet', salt: 'Calcium + Vitamin D3', hsn: '3004', batch: 'SHL-9912', qty: 15, ptr: 110.00, mrp: 140.00, gstPct: 12, total: 1848.00 },
      ]
    },
    {
      id: 'inv-102',
      invoiceNo: 'INV-2026-8813',
      orderNo: 'ORD-2026-4519',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      distributorGstin: '27BBBBB1111B2Z8',
      distributorAddress: 'Market Yard Depot, Gultekdi, Pune, MH 411037',
      date: '2026-07-25',
      dueDate: '2026-08-05',
      amount: 7800.00,
      taxAmount: 835.71,
      status: 'PAID',
      paidDate: '2026-07-26',
      paymentMode: 'UPI / NetBanking',
      pdfUrl: 'https://hspvkmjpcnkqqpoksveo.supabase.co/storage/v1/object/public/distributor-invoices/INV-2026-8813.pdf',
      items: [
        { name: 'Dolo 650 Tablet', salt: 'Paracetamol 650mg', hsn: '3004', batch: 'DOL-1029', qty: 20, ptr: 26.80, mrp: 34.00, gstPct: 12, total: 600.32 },
        { name: 'Azithral 500 Tablet', salt: 'Azithromycin 500mg', hsn: '3004', batch: 'AZI-4410', qty: 5, ptr: 95.00, mrp: 122.50, gstPct: 12, total: 532.00 },
      ]
    },
    {
      id: 'inv-103',
      invoiceNo: 'INV-2026-8790',
      orderNo: 'ORD-2026-4402',
      distributorName: 'Swastik Medical Wholesaler',
      distributorPhone: '+91 98230 30003',
      distributorGstin: '27CCCCC2222C3Z1',
      distributorAddress: 'Sadashiv Peth, Near City Post, Pune, MH 411030',
      date: '2026-07-15',
      dueDate: '2026-07-28',
      amount: 24150.00,
      taxAmount: 2587.50,
      status: 'PAID',
      paidDate: '2026-07-16',
      paymentMode: 'NEFT / RTGS',
      pdfUrl: 'https://hspvkmjpcnkqqpoksveo.supabase.co/storage/v1/object/public/distributor-invoices/INV-2026-8790.pdf',
      items: [
        { name: 'Combiflam Tablet', salt: 'Ibuprofen + Paracetamol', hsn: '3004', batch: 'CMB-3319', qty: 25, ptr: 32.00, mrp: 41.50, gstPct: 12, total: 896.00 },
        { name: 'Foracort 200 Inhaler', salt: 'Formoterol + Budesonide', hsn: '3004', batch: 'FOR-1188', qty: 5, ptr: 410.00, mrp: 520.00, gstPct: 12, total: 2296.00 },
        { name: 'Glycomet 500 SR', salt: 'Metformin Hydrochloride', hsn: '3004', batch: 'GLY-4490', qty: 30, ptr: 28.50, mrp: 36.80, gstPct: 12, total: 957.60 },
      ]
    },
    {
      id: 'inv-104',
      invoiceNo: 'INV-2026-8710',
      orderNo: 'ORD-2026-4290',
      distributorName: 'Apex Pharma',
      distributorPhone: '+91 98230 40004',
      distributorGstin: '27DDDDD3333D4Z4',
      distributorAddress: 'Bhiwandi Pharma Hub, Thane, MH 421302',
      date: '2026-07-02',
      dueDate: '2026-07-15',
      amount: 5400.00,
      taxAmount: 578.57,
      status: 'OVERDUE',
      pdfUrl: 'https://hspvkmjpcnkqqpoksveo.supabase.co/storage/v1/object/public/distributor-invoices/INV-2026-8710.pdf',
      items: [
        { name: 'Zincovit Tablet', salt: 'Multivitamins + Minerals', hsn: '3004', batch: 'ZNC-9941', qty: 10, ptr: 82.00, mrp: 105.00, gstPct: 12, total: 918.40 },
        { name: 'Telma 40 Tablet', salt: 'Telmisartan 40mg', hsn: '3004', batch: 'TLM-5523', qty: 10, ptr: 175.00, mrp: 224.00, gstPct: 12, total: 1960.00 },
      ]
    }
  ];

  let activeDesk: 'DISPATCHED' | 'RECEIVED' | 'INVOICES' = 'DISPATCHED';
  let activeStatusFilter: string = 'ALL';
  let searchQuery: string = '';
  let selectedInvoice: InvoiceRecord | null = null;

  function render(): void {
    const totalUnpaidAmount = invoicesList
      .filter(i => i.status !== 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);

    const paidCount = invoicesList.filter(i => i.status === 'PAID').length;
    const unpaidCount = invoicesList.filter(i => i.status === 'UNPAID').length;
    const overdueCount = invoicesList.filter(i => i.status === 'OVERDUE').length;

    // Filtered invoices for Invoices tab
    let filteredInvoices = invoicesList.filter(inv => {
      let matchesStatus = true;
      if (activeStatusFilter === 'PAID') matchesStatus = inv.status === 'PAID';
      else if (activeStatusFilter === 'UNPAID') matchesStatus = inv.status === 'UNPAID' || inv.status === 'OVERDUE';
      else if (activeStatusFilter === 'OVERDUE') matchesStatus = inv.status === 'OVERDUE';

      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch = inv.invoiceNo.toLowerCase().includes(q) ||
                        inv.orderNo.toLowerCase().includes(q) ||
                        inv.distributorName.toLowerCase().includes(q) ||
                        inv.date.includes(q) ||
                        inv.dueDate.includes(q) ||
                        inv.amount.toString().includes(q) ||
                        inv.items.some(i => i.name.toLowerCase().includes(q) || i.salt.toLowerCase().includes(q));
      }

      return matchesStatus && matchesSearch;
    });

    container.innerHTML = `
      <!-- Page Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:16px; border-bottom:2px solid var(--tile-blue); padding-bottom:8px;">
        <div>
          <h1 style="font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:1px; margin:0; display:flex; align-items:center; gap:8px;">
            🚚 ORDERS & INVOICE MANAGEMENT HUB
          </h1>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
            Live Order Tracking, Delivered Orders Archive & Distributor Invoice Tracker
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:6px 14px; text-align:right;">
            <div style="font-size:10px; font-weight:800; color:#FCA5A5; text-transform:uppercase;">TOTAL DUE AMOUNT</div>
            <div style="font-size:16px; font-weight:900; color:#F87171;">₹${totalUnpaidAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <!-- ====================================================================== -->
      <!-- TOP DESK SWITCHER SEGMENTED CONTROL -->
      <!-- ====================================================================== -->
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:12px; padding:6px; margin-bottom:16px; display:flex; gap:6px; flex-wrap:wrap;">
        <button class="desk-btn ${activeDesk === 'DISPATCHED' ? 'desk-active' : ''}" id="tab-desk-dispatched" style="flex:1; min-width:180px; padding:10px 14px; border:none; border-radius:8px; font-size:12px; font-weight:900; cursor:pointer; background:${activeDesk === 'DISPATCHED' ? 'var(--tile-blue)' : 'transparent'}; color:${activeDesk === 'DISPATCHED' ? 'white' : 'var(--text-secondary)'}; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s ease;">
          <span>🚚 ORDERS DISPATCHED</span>
          <span style="background:rgba(255,255,255,0.25); color:white; font-size:10px; padding:2px 8px; border-radius:12px; font-weight:800;">${dispatchedOrders.length}</span>
        </button>

        <button class="desk-btn ${activeDesk === 'RECEIVED' ? 'desk-active' : ''}" id="tab-desk-received" style="flex:1; min-width:180px; padding:10px 14px; border:none; border-radius:8px; font-size:12px; font-weight:900; cursor:pointer; background:${activeDesk === 'RECEIVED' ? 'var(--tile-green)' : 'transparent'}; color:${activeDesk === 'RECEIVED' ? 'white' : 'var(--text-secondary)'}; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s ease;">
          <span>📦 ORDERS RECEIVED / DELIVERED</span>
          <span style="background:rgba(255,255,255,0.25); color:white; font-size:10px; padding:2px 8px; border-radius:12px; font-weight:800;">${deliveredOrders.length}</span>
        </button>

        <button class="desk-btn ${activeDesk === 'INVOICES' ? 'desk-active' : ''}" id="tab-desk-invoices" style="flex:1; min-width:180px; padding:10px 14px; border:none; border-radius:8px; font-size:12px; font-weight:900; cursor:pointer; background:${activeDesk === 'INVOICES' ? 'var(--tile-purple)' : 'transparent'}; color:${activeDesk === 'INVOICES' ? 'white' : 'var(--text-secondary)'}; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s ease;">
          <span>📑 INVOICES & PAYMENT TRACKER</span>
          <span style="background:rgba(255,255,255,0.25); color:white; font-size:10px; padding:2px 8px; border-radius:12px; font-weight:800;">${invoicesList.length}</span>
        </button>
      </div>

      <!-- ====================================================================== -->
      <!-- DESK 1: DISPATCHED ORDERS DESK (WITH LIVE TRACKING) -->
      <!-- ====================================================================== -->
      ${activeDesk === 'DISPATCHED' ? `
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${dispatchedOrders.map(order => `
            <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-left:5px solid #0078D7; border-radius:12px; padding:16px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; flex-wrap:wrap; gap:12px;">
                <div>
                  <div style="font-size:16px; font-weight:900; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span>Order #${order.orderNo}</span>
                    <span style="font-size:10px; background:rgba(0,120,215,0.2); color:#60A5FA; padding:2px 8px; border-radius:4px; font-weight:800;">
                      ${order.status === 'OUT_FOR_DELIVERY' ? '🚚 OUT FOR DELIVERY' : '📦 IN TRANSIT'}
                    </span>
                    <span style="font-size:11px; color:var(--text-secondary); font-weight:700;">Invoice #${order.invoiceNo}</span>
                  </div>
                  <div style="font-size:13px; color:var(--tile-cyan); font-weight:800; margin-top:4px;">
                    🏢 ${order.distributorName} (${order.distributorPhone})
                  </div>
                </div>

                <div style="text-align:right;">
                  <div style="font-size:18px; font-weight:900; color:var(--tile-blue);">₹${order.totalAmount.toLocaleString('en-IN')}</div>
                  <div style="font-size:11px; color:var(--text-secondary); font-weight:700;">${order.itemCount} Items • Dispatched: ${order.dispatchDate}</div>
                </div>
              </div>

              <!-- Live Logistics Info Banner -->
              <div style="background:rgba(0,120,215,0.08); border:1px solid rgba(0,120,215,0.25); border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:24px;">🚛</span>
                  <div>
                    <div style="font-size:12px; font-weight:800;">Courier: <strong>${order.courierName}</strong> (${order.vehicleNo})</div>
                    <div style="font-size:11px; color:var(--text-secondary);">Driver: <strong>${order.driverName}</strong> (${order.driverPhone})</div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:8px;">
                  <a href="tel:${order.driverPhone}" style="background:var(--tile-green); color:white; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                    📞 Call Driver
                  </a>
                  <button class="btn-track-live" data-ord="${order.orderNo}" style="background:var(--tile-blue); color:white; border:none; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:800; cursor:pointer;">
                    📍 Live GPS
                  </button>
                </div>
              </div>

              <!-- Live Tracking Progress Bar -->
              <div style="margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;">
                  <span>LIVE TRACKING PROGRESS</span>
                  <span style="color:#34D399;">${order.liveProgressPct}% COMPLETE (ETA: ${order.expectedDelivery})</span>
                </div>
                <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
                  <div style="height:100%; width:${order.liveProgressPct}%; background:linear-gradient(90deg, #0078D7, #10B981); border-radius:4px;"></div>
                </div>
              </div>

              <!-- Tracking Steps Horizontal Stepper -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:8px; background:rgba(0,0,0,0.15); padding:10px; border-radius:8px;">
                ${order.trackingSteps.map(st => `
                  <div style="font-size:10px; padding:6px; border-radius:4px; background:${st.current ? 'rgba(0,120,215,0.25)' : st.done ? 'rgba(16,185,129,0.15)' : 'transparent'}; border:1px solid ${st.current ? '#0078D7' : st.done ? '#10B981' : 'rgba(255,255,255,0.1)'};">
                    <div style="font-weight:800; color:${st.current ? '#60A5FA' : st.done ? '#34D399' : 'var(--text-secondary)'};">
                      ${st.done ? '✓' : '⏳'} ${st.title}
                    </div>
                    <div style="color:var(--text-secondary); font-size:9px; margin-top:2px;">${st.time}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- ====================================================================== -->
      <!-- DESK 2: ORDERS RECEIVED / DELIVERED DESK -->
      <!-- ====================================================================== -->
      ${activeDesk === 'RECEIVED' ? `
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${deliveredOrders.map(order => `
            <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-left:5px solid #10B981; border-radius:12px; padding:16px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; flex-wrap:wrap; gap:12px;">
                <div>
                  <div style="font-size:16px; font-weight:900; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <span>Order #${order.orderNo}</span>
                    <span style="font-size:10px; background:rgba(16,185,129,0.2); color:#34D399; padding:2px 8px; border-radius:4px; font-weight:800;">
                      ✓ DELIVERED
                    </span>
                    <span style="font-size:11px; color:var(--text-secondary); font-weight:700;">Invoice #${order.invoiceNo}</span>
                  </div>
                  <div style="font-size:13px; color:var(--tile-cyan); font-weight:800; margin-top:4px;">
                    🏢 ${order.distributorName} (${order.distributorPhone})
                  </div>
                </div>

                <div style="text-align:right;">
                  <div style="font-size:18px; font-weight:900; color:var(--tile-green);">₹${order.totalAmount.toLocaleString('en-IN')}</div>
                  <div style="font-size:11px; color:var(--text-secondary); font-weight:700;">${order.itemCount} Items Delivered</div>
                </div>
              </div>

              <!-- Delivered Info Badge -->
              <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:22px;">📦</span>
                  <div>
                    <div style="font-size:12px; font-weight:800;">Delivered On: <strong>${order.deliveredDate} at ${order.deliveredTime}</strong></div>
                    <div style="font-size:11px; color:var(--text-secondary);">Received By: <strong>${order.receivedBy}</strong> • POD: <strong>${order.podNumber}</strong></div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:11px; font-weight:800; color:#34D399; background:rgba(16,185,129,0.15); padding:4px 10px; border-radius:6px;">
                    ${order.verificationStatus}
                  </span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- ====================================================================== -->
      <!-- DESK 3: INVOICES & PAYMENT TRACKER DESK -->
      <!-- ====================================================================== -->
      ${activeDesk === 'INVOICES' ? `
        <!-- Status Filter Bar & Search -->
        <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:12px; padding:10px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:nowrap; overflow-x:auto; flex:1; min-width:280px;">
            <span style="font-size:10px; font-weight:900; color:var(--text-secondary); letter-spacing:0.5px; text-transform:uppercase; white-space:nowrap;">STATUS FILTERS:</span>
            
            <button class="filter-pill ${activeStatusFilter === 'ALL' ? 'pill-active' : ''}" data-status="ALL" style="border:none; border-radius:20px; padding:4px 12px; font-size:10px; font-weight:800; cursor:pointer; background:${activeStatusFilter === 'ALL' ? '#0078D7' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
              ALL INVOICES (${invoicesList.length})
            </button>
            
            <button class="filter-pill ${activeStatusFilter === 'UNPAID' ? 'pill-active' : ''}" data-status="UNPAID" style="border:none; border-radius:20px; padding:4px 12px; font-size:10px; font-weight:800; cursor:pointer; background:${activeStatusFilter === 'UNPAID' ? '#F59E0B' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
              UNPAID (${unpaidCount})
            </button>

            <button class="filter-pill ${activeStatusFilter === 'OVERDUE' ? 'pill-active' : ''}" data-status="OVERDUE" style="border:none; border-radius:20px; padding:4px 12px; font-size:10px; font-weight:800; cursor:pointer; background:${activeStatusFilter === 'OVERDUE' ? '#EF4444' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
              ⚠️ OVERDUE (${overdueCount})
            </button>

            <button class="filter-pill ${activeStatusFilter === 'PAID' ? 'pill-active' : ''}" data-status="PAID" style="border:none; border-radius:20px; padding:4px 12px; font-size:10px; font-weight:800; cursor:pointer; background:${activeStatusFilter === 'PAID' ? '#10B981' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
              ✓ PAID STAMPED (${paidCount})
            </button>
          </div>

          <div style="position:relative; width:280px; flex-shrink:0;">
            <input type="text" id="invoice-search-input" value="${searchQuery}" placeholder="🔍 Search date, distributor, salt, brand, inv #..." style="width:100%; background:var(--bg-input); border:1.5px solid #38BDF8; border-radius:10px; padding:6px 12px 6px 32px; font-size:11px; font-weight:700; color:var(--text-primary);" />
            <span style="position:absolute; left:10px; top:6px; font-size:12px; opacity:0.8;">🔍</span>
          </div>
        </div>

        <!-- Invoices List -->
        <div style="display:flex; flex-direction:column; gap:14px;">
          ${filteredInvoices.length === 0 ? `
            <div style="text-align:center; padding:40px; background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:10px; color:var(--text-secondary); font-size:13px;">
              🔍 No invoices match the current search or status filter.
            </div>
          ` : filteredInvoices.map(inv => {
            const isPaid = inv.status === 'PAID';
            const isOverdue = inv.status === 'OVERDUE';

            return `
              <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-left:4px solid ${isPaid ? '#10B981' : isOverdue ? '#EF4444' : '#F59E0B'}; border-radius:12px; padding:16px; position:relative; overflow:hidden;">
                
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:16px; flex-wrap:wrap;">
                  <div>
                    <div style="font-size:16px; font-weight:900; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                      <span>Invoice #${inv.invoiceNo}</span>
                      <span style="font-size:10px; color:var(--text-secondary); background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px; font-weight:700;">
                        Order #${inv.orderNo}
                      </span>
                      <span style="font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px; background:${isPaid ? 'rgba(16,185,129,0.2)' : isOverdue ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}; color:${isPaid ? '#34D399' : isOverdue ? '#F87171' : '#FBBF24'}; display:inline-flex; align-items:center; gap:4px;">
                        ${isPaid ? '✓ PAID SETTLED' : isOverdue ? '⚠️ OVERDUE' : '⏳ UNPAID DUE'}
                      </span>
                      ${isPaid ? `
                        <span style="border:1.5px solid #10B981; color:#10B981; font-weight:900; font-size:10px; letter-spacing:1px; padding:1px 6px; border-radius:4px; background:rgba(16,185,129,0.1);">
                          PAID ✓
                        </span>
                      ` : ''}
                    </div>

                    <div style="font-size:12px; color:var(--tile-cyan); font-weight:800; margin-top:4px;">
                      🏢 ${inv.distributorName} (${inv.distributorPhone})
                    </div>
                    <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                      📍 ${inv.distributorAddress} • GSTIN: ${inv.distributorGstin}
                    </div>
                  </div>

                  <div style="text-align:right;">
                    <div style="font-size:20px; font-weight:900; color:${isPaid ? '#10B981' : isOverdue ? '#EF4444' : '#F59E0B'};">
                      ₹${inv.amount.toLocaleString('en-IN')}
                    </div>
                    <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">
                      GST Tax Included: ₹${inv.taxAmount.toLocaleString('en-IN')}
                    </div>

                    ${!isPaid ? `
                      <button class="btn-pay-now-small" data-id="${inv.id}" style="margin-top:6px; background:linear-gradient(135deg, #10B981, #008272); color:white; border:none; padding:4px 14px; border-radius:6px; font-size:11px; font-weight:900; cursor:pointer; box-shadow:0 3px 8px rgba(16,185,129,0.3); transition:all 0.15s ease; display:inline-flex; align-items:center; gap:4px;">
                        💳 Pay Now
                      </button>
                    ` : `
                      <div style="font-size:10px; color:#10B981; font-weight:800; margin-top:4px;">
                        Paid on ${inv.paidDate} (${inv.paymentMode})
                      </div>
                    `}
                  </div>
                </div>

                <!-- Items Preview Badges -->
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; background:rgba(0,0,0,0.1); padding:8px 12px; border-radius:8px;">
                  <span style="font-size:10px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-right:4px;">ITEMS INVOICED:</span>
                  ${inv.items.map(item => `
                    <span style="font-size:10px; background:rgba(56,189,248,0.15); color:var(--text-primary); border:1px solid rgba(56,189,248,0.3); padding:2px 8px; border-radius:4px; font-weight:700;">
                      💊 ${item.name} (${item.qty} Qty)
                    </span>
                  `).join('')}
                </div>

                <!-- Action Buttons -->
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:10px; flex-wrap:wrap; gap:10px;">
                  <div style="font-size:11px; color:var(--text-secondary);">
                    📅 Bill Date: <strong>${inv.date}</strong> | Due Date: <strong>${inv.dueDate}</strong>
                  </div>

                  <div style="display:flex; gap:8px;">
                    <button class="btn-view-invoice" data-id="${inv.id}" style="background:var(--tile-blue); color:white; border:none; padding:6px 14px; border-radius:6px; font-size:11px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                      👁️ View & Download PDF
                    </button>

                    <a href="${inv.pdfUrl}" target="_blank" download style="background:rgba(255,255,255,0.08); color:var(--text-primary); border:1px solid var(--border-subtle); padding:6px 12px; border-radius:6px; font-size:11px; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                      📥 Direct PDF Link
                    </a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- ====================================================================== -->
      <!-- INVOICE DETAILS & PDF MODAL -->
      <!-- ====================================================================== -->
      ${selectedInvoice ? `
        <div class="rx-modal-overlay" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px;">
          <div class="rx-modal-card" style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:14px; width:min(720px, 95vw); max-height:90vh; overflow-y:auto; box-shadow:0 20px 40px rgba(0,0,0,0.6); position:relative;">
            
            <div class="rx-modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; sticky:top; background:var(--bg-card); z-index:10;">
              <div>
                <div style="font-size:18px; font-weight:900; display:flex; align-items:center; gap:8px;">
                  <span>🧾 Tax Invoice #${selectedInvoice.invoiceNo}</span>
                  ${selectedInvoice.status === 'PAID' ? `
                    <span style="font-size:11px; border:2px solid #10B981; color:#10B981; font-weight:900; padding:2px 8px; border-radius:4px; transform:rotate(-4deg); display:inline-block;">
                      PAID ✓
                    </span>
                  ` : ''}
                </div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                  Issued by ${selectedInvoice.distributorName}
                </div>
              </div>

              <button id="close-invoice-modal" style="background:transparent; border:none; font-size:20px; color:var(--text-secondary); cursor:pointer;">✖</button>
            </div>

            <div class="rx-modal-body" style="padding:20px;">
              <!-- Supabase Cloud Storage Status Banner -->
              <div style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:10px 14px; margin-bottom:16px; font-size:11px; color:#38BDF8; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div>☁️ <strong>Supabase Cloud Storage:</strong> Connected to distributor bucket <code>distributor-invoices</code></div>
                <a href="${selectedInvoice.pdfUrl}" target="_blank" style="color:#38BDF8; font-weight:800; text-decoration:underline;">View Raw File</a>
              </div>

              <!-- Bill Details Table -->
              <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:20px;">
                <thead>
                  <tr style="background:rgba(255,255,255,0.05); text-align:left;">
                    <th style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">Item Name</th>
                    <th style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">Batch</th>
                    <th style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">Qty</th>
                    <th style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">PTR</th>
                    <th style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">GST %</th>
                    <th style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${selectedInvoice.items.map(it => `
                    <tr>
                      <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:700;">${it.name}<br><span style="font-size:10px; color:var(--text-secondary);">${it.salt}</span></td>
                      <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-family:monospace;">${it.batch}</td>
                      <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-weight:800;">${it.qty}</td>
                      <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">₹${it.ptr.toFixed(2)}</td>
                      <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle);">${it.gstPct}%</td>
                      <td style="padding:8px 10px; border-bottom:1px solid var(--border-subtle); text-align:right; font-weight:900;">₹${it.total.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Total Breakdown -->
              <div style="display:flex; justify-content:flex-end; gap:20px; font-size:14px; font-weight:900; margin-bottom:20px;">
                <div>GST Tax: ₹${selectedInvoice.taxAmount.toLocaleString('en-IN')}</div>
                <div style="color:var(--tile-blue);">Grand Total: ₹${selectedInvoice.amount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div class="rx-modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <button id="btn-print-invoice" style="background:rgba(255,255,255,0.1); color:var(--text-primary); border:1px solid var(--border-subtle); padding:8px 16px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer;">
                🖨️ Print Invoice
              </button>

              <div style="display:flex; gap:10px;">
                <a href="${selectedInvoice.pdfUrl}" target="_blank" download style="background:var(--tile-green); color:white; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:900; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                  📥 Download PDF
                </a>
              </div>
            </div>

          </div>
        </div>
      ` : ''}
    `;

    // Event listeners
    container.querySelector('#tab-desk-dispatched')?.addEventListener('click', () => {
      activeDesk = 'DISPATCHED';
      render();
    });

    container.querySelector('#tab-desk-received')?.addEventListener('click', () => {
      activeDesk = 'RECEIVED';
      render();
    });

    container.querySelector('#tab-desk-invoices')?.addEventListener('click', () => {
      activeDesk = 'INVOICES';
      render();
    });

    // Status filter buttons
    container.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const st = (e.currentTarget as HTMLElement).getAttribute('data-status');
        if (st) {
          activeStatusFilter = st;
          render();
        }
      });
    });

    // Search input
    const searchInput = container.querySelector('#invoice-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        // Keep focus
        const curVal = searchQuery;
        render();
        const newInp = container.querySelector('#invoice-search-input') as HTMLInputElement;
        if (newInp) {
          newInp.value = curVal;
          newInp.focus();
        }
      });
    }

    // View Invoice Modal
    container.querySelectorAll('.btn-view-invoice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        selectedInvoice = invoicesList.find(i => i.id === id) || null;
        render();
      });
    });

    container.querySelector('#close-invoice-modal')?.addEventListener('click', () => {
      selectedInvoice = null;
      render();
    });

    container.querySelector('#btn-print-invoice')?.addEventListener('click', () => {
      window.print();
    });

    // Pay Now buttons
    container.querySelectorAll('.btn-pay-now-small').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const inv = invoicesList.find(i => i.id === id);
        if (inv) {
          NotificationEngine.showToast(`💳 Initiated UPI / NetBanking payment for Invoice #${inv.invoiceNo} (₹${inv.amount.toLocaleString('en-IN')})`, 'success');
        }
      });
    });

    // Live GPS tracking button
    container.querySelectorAll('.btn-track-live').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ord = (e.currentTarget as HTMLElement).getAttribute('data-ord');
        NotificationEngine.showToast(`📍 Opening Live GPS Tracking Map for Order #${ord}...`, 'info');
      });
    });
  }

  render();
}
