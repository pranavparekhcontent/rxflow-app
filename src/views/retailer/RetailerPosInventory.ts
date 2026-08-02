/**
 * Mediflow RetailerPosInventory v9.0
 * Features:
 * 1. Smart Continuous Search without losing input focus/selection bar.
 * 2. Targeted DOM updating for Compare Drawer Distributor Search & Main Inventory Search.
 * 3. Filter options: Lowest PTR Rate, Best Scheme Yield, Nearest Express, Highest Margin %,
 *    and Live Custom Distributor Search.
 * 4. Direct '🛒 ADD TO BASKET' fast add to central basket.
 * 5. Nokia Live Tile Dashboard with Drug Schedules & Stock Health.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { BasketStore } from '../../store/BasketStore';

export type DrugSchedule = 'OTC' | 'SCHEDULE H' | 'SCHEDULE H1' | 'SCHEDULE X';
export type StockHealthStatus = 'NORMAL' | 'LOW_STOCK' | 'NEAR_EXPIRY' | 'EXPIRED';

export interface PosStockItem {
  id: string;
  sku: string;
  brandName: string;
  genericSalt: string;
  manufacturer: string;
  schedule: DrugSchedule;
  currentQty: number;
  minReorderLevel: number;
  ptr: number;
  mrp: number;
  expiryDate: string;
  healthStatus: StockHealthStatus;
  batchNo: string;
  distributorName: string;
  distributorPhone: string;
  distanceKm: number;
  activeScheme: string;
}

export interface DistributorOption {
  name: string;
  ptr: number;
  mrp: number;
  scheme: string;
  distanceKm: number;
  deliveryTime: string;
  marginPct: number;
  tag: string;
}

export default function RetailerPosInventory(container: HTMLElement): void {
  const inventoryItems: PosStockItem[] = [
    { id: '1', sku: 'AUG625', brandName: 'Augmentin 625 Duo', genericSalt: 'Amoxicillin + Clavulanic Acid', manufacturer: 'GSK Pharma', schedule: 'SCHEDULE H1', currentQty: 4, minReorderLevel: 10, ptr: 142.50, mrp: 201.71, expiryDate: '2026-11-15', healthStatus: 'LOW_STOCK', batchNo: 'AUG-8821', distributorName: 'Shrine Pharma Stockist', distributorPhone: '+91 98220 12345', distanceKm: 1.8, activeScheme: 'Buy 10 + Get 1 Free' },
    { id: '2', sku: 'PAND', brandName: 'Pan-D Capsule', genericSalt: 'Pantoprazole + Domperidone', manufacturer: 'Alkem Labs', schedule: 'SCHEDULE H', currentQty: 18, minReorderLevel: 10, ptr: 88.00, mrp: 156.00, expiryDate: '2027-04-20', healthStatus: 'NORMAL', batchNo: 'PND-3401', distributorName: 'Medico Distributors', distributorPhone: '+91 98230 20002', distanceKm: 3.4, activeScheme: '12% Flat Discount' },
    { id: '3', sku: 'DOLO650', brandName: 'Dolo 650 Tablet', genericSalt: 'Paracetamol 650mg', manufacturer: 'Micro Labs', schedule: 'OTC', currentQty: 2, minReorderLevel: 10, ptr: 26.80, mrp: 34.00, expiryDate: '2026-08-25', healthStatus: 'LOW_STOCK', batchNo: 'DOL-1029', distributorName: 'Swastik Medical Wholesaler', distributorPhone: '+91 98230 30003', distanceKm: 12.1, activeScheme: 'Buy 20 + Get 2 Free' },
    { id: '4', sku: 'CAL500', brandName: 'Shelcal 500', genericSalt: 'Calcium + Vitamin D3', manufacturer: 'Torrent Pharma', schedule: 'OTC', currentQty: 25, minReorderLevel: 10, ptr: 110.00, mrp: 140.00, expiryDate: '2027-09-10', healthStatus: 'NORMAL', batchNo: 'SHL-9912', distributorName: 'Apex Pharma', distributorPhone: '+91 98230 40004', distanceKm: 148.0, activeScheme: 'Buy 15 + Get 1 Free' },
    { id: '5', sku: 'ALP050', brandName: 'Alprax 0.5mg', genericSalt: 'Alprazolam', manufacturer: 'Torrent Pharma', schedule: 'SCHEDULE X', currentQty: 2, minReorderLevel: 5, ptr: 38.50, mrp: 45.00, expiryDate: '2026-08-15', healthStatus: 'NEAR_EXPIRY', batchNo: 'ALP-5512', distributorName: 'Shrine Pharma Stockist', distributorPhone: '+91 98220 12345', distanceKm: 1.8, activeScheme: 'No Scheme (Rx)' },
    { id: '6', sku: 'MONLC', brandName: 'Montair-LC Tablet', genericSalt: 'Montelukast + Levocetirizine', manufacturer: 'Cipla Ltd', schedule: 'SCHEDULE H', currentQty: 15, minReorderLevel: 8, ptr: 165.00, mrp: 215.00, expiryDate: '2027-01-30', healthStatus: 'NORMAL', batchNo: 'MON-7718', distributorName: 'Medico Distributors', distributorPhone: '+91 98230 20002', distanceKm: 3.4, activeScheme: 'Buy 10 + Get 1 Free' },
    { id: '7', sku: 'AZI500', brandName: 'Azithral 500', genericSalt: 'Azithromycin 500mg', manufacturer: 'Alembic Pharma', schedule: 'SCHEDULE H1', currentQty: 3, minReorderLevel: 8, ptr: 95.00, mrp: 122.50, expiryDate: '2026-08-28', healthStatus: 'LOW_STOCK', batchNo: 'AZI-4410', distributorName: 'Apex Pharma', distributorPhone: '+91 98230 40004', distanceKm: 148.0, activeScheme: '10% Flat Discount' },
    { id: '8', sku: 'COMB', brandName: 'Combiflam Tablet', genericSalt: 'Ibuprofen + Paracetamol', manufacturer: 'Sanofi India', schedule: 'OTC', currentQty: 45, minReorderLevel: 15, ptr: 32.00, mrp: 41.50, expiryDate: '2027-06-15', healthStatus: 'NORMAL', batchNo: 'CMB-3319', distributorName: 'Swastik Medical Wholesaler', distributorPhone: '+91 98230 30003', distanceKm: 12.1, activeScheme: 'Buy 25 + Get 3 Free' },
    { id: '9', sku: 'VOM10', brandName: 'Voveran SR 100', genericSalt: 'Diclofenac Sodium', manufacturer: 'Novartis', schedule: 'SCHEDULE H', currentQty: 12, minReorderLevel: 6, ptr: 140.00, mrp: 178.00, expiryDate: '2026-07-10', healthStatus: 'EXPIRED', batchNo: 'VOV-2201', distributorName: 'Shrine Pharma Stockist', distributorPhone: '+91 98220 12345', distanceKm: 1.8, activeScheme: 'Disposal Clearout' },
    { id: '10', sku: 'CLO025', brandName: 'Clonafit 0.25mg', genericSalt: 'Clonazepam', manufacturer: 'Mankind Pharma', schedule: 'SCHEDULE X', currentQty: 6, minReorderLevel: 5, ptr: 42.00, mrp: 54.00, expiryDate: '2027-03-20', healthStatus: 'NORMAL', batchNo: 'CLN-6602', distributorName: 'Medico Distributors', distributorPhone: '+91 98230 20002', distanceKm: 3.4, activeScheme: 'No Scheme (Rx)' },
    { id: '11', sku: 'ZINCV', brandName: 'Zincovit Tablet', genericSalt: 'Multivitamins + Minerals + Zinc', manufacturer: 'Apex Labs', schedule: 'OTC', currentQty: 30, minReorderLevel: 10, ptr: 82.00, mrp: 105.00, expiryDate: '2027-11-05', healthStatus: 'NORMAL', batchNo: 'ZNC-9941', distributorName: 'Apex Pharma', distributorPhone: '+91 98230 40004', distanceKm: 148.0, activeScheme: 'Buy 10 + Get 1 Free' },
    { id: '12', sku: 'FORAC', brandName: 'Foracort 200 Inhaler', genericSalt: 'Formoterol + Budesonide', manufacturer: 'Cipla Ltd', schedule: 'SCHEDULE H', currentQty: 8, minReorderLevel: 4, ptr: 410.00, mrp: 520.00, expiryDate: '2027-08-14', healthStatus: 'NORMAL', batchNo: 'FOR-1188', distributorName: 'Swastik Medical Wholesaler', distributorPhone: '+91 98230 30003', distanceKm: 12.1, activeScheme: '5% Special Offer' },
    { id: '13', sku: 'CIP500', brandName: 'Ciplox 500 Tablet', genericSalt: 'Ciprofloxacin 500mg', manufacturer: 'Cipla Ltd', schedule: 'SCHEDULE H1', currentQty: 5, minReorderLevel: 10, ptr: 38.00, mrp: 48.90, expiryDate: '2026-08-22', healthStatus: 'LOW_STOCK', batchNo: 'CIP-7740', distributorName: 'Shrine Pharma Stockist', distributorPhone: '+91 98220 12345', distanceKm: 1.8, activeScheme: 'Buy 10 + Get 1 Free' },
    { id: '14', sku: 'BENAD', brandName: 'Benadryl Cough Syrup', genericSalt: 'Diphenhydramine + Ammonium Chloride', manufacturer: 'J&J India', schedule: 'OTC', currentQty: 14, minReorderLevel: 6, ptr: 98.00, mrp: 128.00, expiryDate: '2027-05-12', healthStatus: 'NORMAL', batchNo: 'BEN-8831', distributorName: 'Medico Distributors', distributorPhone: '+91 98230 20002', distanceKm: 3.4, activeScheme: 'Buy 12 + Get 1 Free' },
    { id: '15', sku: 'TELM40', brandName: 'Telma 40 Tablet', genericSalt: 'Telmisartan 40mg', manufacturer: 'Glenmark Pharma', schedule: 'SCHEDULE H', currentQty: 22, minReorderLevel: 8, ptr: 175.00, mrp: 224.00, expiryDate: '2027-10-30', healthStatus: 'NORMAL', batchNo: 'TLM-5523', distributorName: 'Apex Pharma', distributorPhone: '+91 98230 40004', distanceKm: 148.0, activeScheme: '8% Flat Discount' },
    { id: '16', sku: 'GLU500', brandName: 'Glycomet 500 SR', genericSalt: 'Metformin Hydrochloride', manufacturer: 'USV Pvt Ltd', schedule: 'SCHEDULE H', currentQty: 40, minReorderLevel: 12, ptr: 28.50, mrp: 36.80, expiryDate: '2027-12-18', healthStatus: 'NORMAL', batchNo: 'GLY-4490', distributorName: 'Swastik Medical Wholesaler', distributorPhone: '+91 98230 30003', distanceKm: 12.1, activeScheme: 'Buy 30 + Get 3 Free' },
    { id: '17', sku: 'ORSL10', brandName: 'ORS Liquid Apple', genericSalt: 'Oral Rehydration Salts', manufacturer: 'J&J India', schedule: 'OTC', currentQty: 50, minReorderLevel: 15, ptr: 24.00, mrp: 31.50, expiryDate: '2027-07-25', healthStatus: 'NORMAL', batchNo: 'ORS-3321', distributorName: 'Shrine Pharma Stockist', distributorPhone: '+91 98220 12345', distanceKm: 1.8, activeScheme: 'Buy 50 + Get 5 Free' },
    { id: '18', sku: 'TAX100', brandName: 'Taxim-O 200 Tablet', genericSalt: 'Cefixime 200mg', manufacturer: 'Alkem Labs', schedule: 'SCHEDULE H1', currentQty: 2, minReorderLevel: 8, ptr: 84.00, mrp: 108.00, expiryDate: '2026-08-20', healthStatus: 'NEAR_EXPIRY', batchNo: 'TAX-9901', distributorName: 'Medico Distributors', distributorPhone: '+91 98230 20002', distanceKm: 3.4, activeScheme: 'Buy 10 + Get 1 Free' },
  ];

  let activeFilter: string = 'ALL';
  let distributorFilter: string = 'ALL';
  let searchQuery: string = '';

  // Compare Drawer state & filter criteria inside drawer
  let selectedCompareItem: PosStockItem | null = null;
  let compareSortCriteria: string = 'PTR_ASC';
  let drawerCustomDistributorText: string = '';

  function getDistributorOptionsForItem(item: PosStockItem): DistributorOption[] {
    let list: DistributorOption[] = [
      {
        name: 'Shrine Pharma Stockist',
        ptr: Math.round(item.ptr * 0.98 * 100) / 100, // 2% cheaper
        mrp: item.mrp,
        scheme: 'Buy 10 + Get 1 Free',
        distanceKm: 1.8,
        deliveryTime: '2 Hours (Same Day)',
        marginPct: Math.round(((item.mrp - (item.ptr * 0.98)) / item.mrp) * 100),
        tag: '🏷️ LOWEST PTR RATE'
      },
      {
        name: 'Medico Distributors',
        ptr: item.ptr,
        mrp: item.mrp,
        scheme: 'Buy 8 + Get 1 Free (Best Bonus)',
        distanceKm: 3.4,
        deliveryTime: '4 Hours',
        marginPct: Math.round(((item.mrp - item.ptr) / item.mrp) * 100) + 4,
        tag: '🎁 BEST SCHEME YIELD'
      },
      {
        name: 'Swastik Medical Wholesaler',
        ptr: Math.round(item.ptr * 1.01 * 100) / 100,
        mrp: item.mrp,
        scheme: '10% Cash Discount',
        distanceKm: 0.8,
        deliveryTime: '30 Mins (Express)',
        marginPct: Math.round(((item.mrp - (item.ptr * 1.01)) / item.mrp) * 100),
        tag: '⚡ NEAREST EXPRESS'
      },
      {
        name: 'Apex Pharma',
        ptr: item.ptr,
        mrp: item.mrp,
        scheme: 'Buy 15 + Get 2 Free',
        distanceKm: 12.1,
        deliveryTime: 'Next Day Morning',
        marginPct: Math.round(((item.mrp - item.ptr) / item.mrp) * 100),
        tag: '🏭 LAST PURCHASES'
      }
    ];

    // If user entered custom text, dynamically filter or append custom distributor
    if (drawerCustomDistributorText.trim() !== '') {
      const customName = drawerCustomDistributorText.trim();
      const filtered = list.filter(o => o.name.toLowerCase().includes(customName.toLowerCase()));
      if (filtered.length > 0) {
        list = filtered;
      } else {
        list.unshift({
          name: customName,
          ptr: Math.round(item.ptr * 0.97 * 100) / 100,
          mrp: item.mrp,
          scheme: 'Custom Direct Deal (Special Quote)',
          distanceKm: 2.5,
          deliveryTime: 'Same Day Express',
          marginPct: Math.round(((item.mrp - (item.ptr * 0.97)) / item.mrp) * 100),
          tag: '🔍 CUSTOM SEARCH DISTRIBUTOR'
        });
      }
    } else if (compareSortCriteria === 'PTR_ASC') {
      list.sort((a, b) => a.ptr - b.ptr);
    } else if (compareSortCriteria === 'SCHEME_BEST') {
      list.sort((a, b) => b.marginPct - a.marginPct);
    } else if (compareSortCriteria === 'NEAREST') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (compareSortCriteria === 'MARGIN_DESC') {
      list.sort((a, b) => b.marginPct - a.marginPct);
    }

    return list;
  }

  function renderDrawerMatrixHtml(): string {
    if (!selectedCompareItem) return '';
    const options = getDistributorOptionsForItem(selectedCompareItem);
    return `
      <div style="font-size:11px; font-weight:900; color:white; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <span>📊 Matching Distributors Matrix:</span>
        <span style="font-size:10px; color:#A78BFA; font-weight:800;">${options.length} Distributors Available</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
        ${options.map((opt) => `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(139,92,246,0.3); border-radius:10px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
            
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:13px; font-weight:800; color:white;">🏭 ${opt.name}</span>
                <span style="font-size:9px; font-weight:900; background:rgba(139,92,246,0.25); color:#C4B5FD; padding:2px 6px; border-radius:4px;">${opt.tag}</span>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 14px; margin-top:6px; font-size:11px;">
                <div><span style="color:#94A3B8;">PTR:</span> <strong style="color:#60A5FA;">₹${opt.ptr.toFixed(2)}</strong> <span style="color:#34D399; font-size:10px; font-weight:800;">(${opt.marginPct}% Margin)</span></div>
                <div><span style="color:#94A3B8;">Scheme:</span> <strong style="color:#FBBF24;">${opt.scheme}</strong></div>
                <div><span style="color:#94A3B8;">Delivery:</span> <strong style="color:white;">${opt.deliveryTime} (${opt.distanceKm} km)</strong></div>
                <div><span style="color:#94A3B8;">MRP:</span> <strong style="color:#E2E8F0;">₹${opt.mrp.toFixed(2)}</strong></div>
              </div>
            </div>

            <!-- Small Square Green Basket Icon Button (Strict 38x38 Square) -->
            <button class="select-compare-add-btn" data-dist="${opt.name}" data-ptr="${opt.ptr}" data-scheme="${opt.scheme}" style="background:linear-gradient(135deg, #10B981, #059669); color:white; font-size:15px; font-weight:900; width:38px !important; min-width:38px !important; max-width:38px !important; height:38px !important; border-radius:10px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(16,185,129,0.35); flex-shrink:0; padding:0 !important; margin:0 !important;" title="Select & Add to Basket from ${opt.name}">
              🛒+
            </button>

          </div>
        `).join('')}
      </div>
    `;
  }

  function updateDrawerMatrixOnly(): void {
    const containerEl = container.querySelector('#compare-matrix-list-container');
    if (containerEl) {
      containerEl.innerHTML = renderDrawerMatrixHtml();

      // Re-attach select & add event handlers inside drawer matrix
      containerEl.querySelectorAll('.select-compare-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement;
          const distName = target.getAttribute('data-dist') || '';
          const ptr = parseFloat(target.getAttribute('data-ptr') || '0');
          const scheme = target.getAttribute('data-scheme') || '';

          if (selectedCompareItem) {
            BasketStore.addItem({
              sku: selectedCompareItem.sku,
              brandName: selectedCompareItem.brandName,
              genericSalt: selectedCompareItem.genericSalt,
              category: selectedCompareItem.schedule,
              packSize: '10x10',
              qty: 1,
              ptr: ptr || selectedCompareItem.ptr,
              gstPct: 12,
              schemeText: scheme || selectedCompareItem.activeScheme,
              distributorName: distName || selectedCompareItem.distributorName,
              distributorPhone: selectedCompareItem.distributorPhone,
            });

            NotificationEngine.showToast(`🛒 ${selectedCompareItem.brandName} selected & added from ${distName}!`, 'success');
            selectedCompareItem = null;
            drawerCustomDistributorText = '';
            render();
          }
        });
      });
    }
  }

  function render(): void {
    // Preserve focus & cursor position before re-render
    const activeEl = document.activeElement as HTMLInputElement | null;
    const activeId = activeEl?.id;
    const cursorPos = activeEl?.selectionStart ?? null;

    // 1. Stats
    const totalSKUs = inventoryItems.length;
    const totalValuationVal = inventoryItems.reduce((sum, item) => sum + (item.currentQty * item.ptr), 0);
    const valuationFormatted = totalValuationVal >= 100000 
      ? `₹${(totalValuationVal / 100000).toFixed(2)}L` 
      : `₹${totalValuationVal.toLocaleString('en-IN')}`;

    const lowStockCount = inventoryItems.filter(i => i.currentQty <= i.minReorderLevel || i.healthStatus === 'LOW_STOCK').length;
    const nearExpiryCount = inventoryItems.filter(i => i.healthStatus === 'NEAR_EXPIRY').length;
    const expiredCount = inventoryItems.filter(i => i.healthStatus === 'EXPIRED').length;

    const otcCount = inventoryItems.filter(i => i.schedule === 'OTC').length;
    const scheduleHCount = inventoryItems.filter(i => i.schedule === 'SCHEDULE H').length;
    const scheduleH1Count = inventoryItems.filter(i => i.schedule === 'SCHEDULE H1').length;
    const scheduleXCount = inventoryItems.filter(i => i.schedule === 'SCHEDULE X').length;

    // 2. Filter & Sort Items
    let filteredItems = inventoryItems.filter(item => {
      let matchesCategory = true;
      if (activeFilter === 'LOW_STOCK') matchesCategory = item.currentQty <= item.minReorderLevel || item.healthStatus === 'LOW_STOCK';
      else if (activeFilter === 'NEAR_EXPIRY') matchesCategory = item.healthStatus === 'NEAR_EXPIRY';
      else if (activeFilter === 'EXPIRED') matchesCategory = item.healthStatus === 'EXPIRED';
      else if (activeFilter === 'OTC') matchesCategory = item.schedule === 'OTC';
      else if (activeFilter === 'SCHEDULE H') matchesCategory = item.schedule === 'SCHEDULE H';
      else if (activeFilter === 'SCHEDULE H1') matchesCategory = item.schedule === 'SCHEDULE H1';
      else if (activeFilter === 'SCHEDULE X') matchesCategory = item.schedule === 'SCHEDULE X';

      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch = item.brandName.toLowerCase().includes(q) ||
                        item.sku.toLowerCase().includes(q) ||
                        item.genericSalt.toLowerCase().includes(q) ||
                        item.schedule.toLowerCase().includes(q) ||
                        item.manufacturer.toLowerCase().includes(q) ||
                        item.distributorName.toLowerCase().includes(q) ||
                        item.activeScheme.toLowerCase().includes(q) ||
                        item.batchNo.toLowerCase().includes(q) ||
                        item.healthStatus.toLowerCase().includes(q) ||
                        item.ptr.toString().includes(q) ||
                        item.mrp.toString().includes(q);
      }

      return matchesCategory && matchesSearch;
    });

    if (distributorFilter === 'SORT_NEAREST') {
      filteredItems.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (distributorFilter === 'SORT_SCHEMES') {
      filteredItems.sort((a, b) => a.activeScheme.localeCompare(b.activeScheme));
    } else if (distributorFilter === 'SORT_PRICE') {
      filteredItems.sort((a, b) => a.ptr - b.ptr);
    }

    container.innerHTML = `
      <!-- Page Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:2px solid var(--tile-blue); padding-bottom:8px;">
        <div>
          <h1 style="font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:white; margin:0; display:flex; align-items:center; gap:8px;">
            🧱 POS COUNTER STOCK & INVENTORY DASHBOARD
          </h1>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
            Classic Nokia Grid live stock valuation, regulatory drug schedules & automated short-book alerts
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="action-btn action-btn--primary" id="btn-scan-barcode" style="padding:7px 14px; font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px;">
            📷 Scan Barcode
          </button>
        </div>
      </div>

      <!-- ====================================================================== -->
      <!-- NOKIA LIVE TILE DASHBOARD GRID (STRICT 5 COLUMNS x 2 ROWS) -->
      <!-- ====================================================================== -->
      <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:14px; margin-bottom:20px;">
        
        <!-- Row 1 - Tile 1: Stock Valuation (Rs badge removed) -->
        <div class="nokia-tile tile-btn ${activeFilter === 'ALL' ? 'active-tile' : ''}" data-filter="ALL" style="background:#0F172A; border:2px solid #38BDF8; border-radius:14px; padding:14px; cursor:pointer; position:relative; overflow:hidden; box-shadow:0 4px 14px rgba(56,189,248,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#94A3B8; letter-spacing:1px; text-transform:uppercase;">STOCK VALUATION</span>
            <span style="font-size:14px;">💰</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:white; margin-top:6px; letter-spacing:-0.5px;">${valuationFormatted}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:10px; color:#94A3B8;">
            <span>Across ${totalSKUs} SKUs</span>
            <span style="background:rgba(16,185,129,0.2); color:#34D399; padding:2px 6px; border-radius:4px; font-weight:800;">+2.1%</span>
          </div>
        </div>

        <!-- Row 1 - Tile 2: Low Stock -->
        <div class="nokia-tile tile-btn ${activeFilter === 'LOW_STOCK' ? 'active-tile' : ''}" data-filter="LOW_STOCK" style="background:#1E1B18; border:2px solid #F59E0B; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(245,158,11,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#FCD34D; letter-spacing:1px; text-transform:uppercase;">LOW STOCK</span>
            <span style="font-size:14px;">⚠️</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:#FBBF24; margin-top:6px;">${lowStockCount}</div>
          <div style="font-size:10px; color:#FDE68A; margin-top:8px;">Items below threshold</div>
        </div>

        <!-- Row 1 - Tile 3: Near Expiry -->
        <div class="nokia-tile tile-btn ${activeFilter === 'NEAR_EXPIRY' ? 'active-tile' : ''}" data-filter="NEAR_EXPIRY" style="background:#1F1A12; border:2px solid #F97316; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(249,115,22,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#FDBA74; letter-spacing:1px; text-transform:uppercase;">NEAR EXPIRY</span>
            <span style="font-size:14px;">🕒</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:#FB923C; margin-top:6px;">${nearExpiryCount}</div>
          <div style="font-size:10px; color:#FFEDD5; margin-top:8px;">Within 30 days</div>
        </div>

        <!-- Row 1 - Tile 4: Expired Stock (Updated text: Require disposal / Return) -->
        <div class="nokia-tile tile-btn ${activeFilter === 'EXPIRED' ? 'active-tile' : ''}" data-filter="EXPIRED" style="background:#201214; border:2px solid #EF4444; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(239,68,68,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#FCA5A5; letter-spacing:1px; text-transform:uppercase;">EXPIRED</span>
            <span style="font-size:14px;">🚫</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:#F87171; margin-top:6px;">${expiredCount}</div>
          <div style="font-size:10px; color:#FEE2E2; margin-top:8px;">Require disposal / Return</div>
        </div>

        <!-- Row 1 - Tile 5: OTC Products -->
        <div class="nokia-tile tile-btn ${activeFilter === 'OTC' ? 'active-tile' : ''}" data-filter="OTC" style="background:#0F1F17; border:2px solid #10B981; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(16,185,129,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#6EE7B7; letter-spacing:1px; text-transform:uppercase;">OTC PRODUCTS</span>
            <span style="font-size:14px;">💊</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:#34D399; margin-top:6px;">${otcCount}</div>
          <div style="font-size:10px; color:#D1FAE5; margin-top:8px;">Over the counter</div>
        </div>

        <!-- Row 2 - Tile 1: Export to Excel (Positioned Directly Below Stock Valuation) -->
        <div id="btn-export-excel-tile" style="background:#0A231C; border:2px solid #107C41; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(16,124,65,0.25); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#6EE7B7; letter-spacing:1px; text-transform:uppercase;">EXPORT TO EXCEL</span>
            <span style="font-size:14px;">📊</span>
          </div>
          <div style="font-size:16px; font-weight:900; color:#34D399; margin-top:8px; display:flex; align-items:center; gap:6px;">
            📥 <span>Download .XLSX</span>
          </div>
          <div style="font-size:10px; color:#A7F3D0; margin-top:8px;">Stock sheet report</div>
        </div>

        <!-- Row 2 - Tile 2: Schedule H (Shifted to vacant place) -->
        <div class="nokia-tile tile-btn ${activeFilter === 'SCHEDULE H' ? 'active-tile' : ''}" data-filter="SCHEDULE H" style="background:#0E1B2D; border:2px solid #3B82F6; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(59,130,246,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#93C5FD; letter-spacing:1px; text-transform:uppercase;">SCHEDULE H</span>
            <span style="font-size:14px;">📋</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:#60A5FA; margin-top:6px;">${scheduleHCount}</div>
          <div style="font-size:10px; color:#DBEAFE; margin-top:8px;">Prescription drugs</div>
        </div>

        <!-- Row 2 - Tile 3: Schedule H1 -->
        <div class="nokia-tile tile-btn ${activeFilter === 'SCHEDULE H1' ? 'active-tile' : ''}" data-filter="SCHEDULE H1" style="background:#20170F; border:2px solid #E11D48; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(225,29,72,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#FDA4AF; letter-spacing:1px; text-transform:uppercase;">SCHEDULE H1</span>
            <span style="font-size:14px;">🔴</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:#FB7185; margin-top:6px;">${scheduleH1Count}</div>
          <div style="font-size:10px; color:#FFE4E6; margin-top:8px;">Restricted Rx drugs</div>
        </div>

        <!-- Row 2 - Tile 4: Schedule X -->
        <div class="nokia-tile tile-btn ${activeFilter === 'SCHEDULE X' ? 'active-tile' : ''}" data-filter="SCHEDULE X" style="background:#1B1528; border:2px solid #8B5CF6; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(139,92,246,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#C4B5FD; letter-spacing:1px; text-transform:uppercase;">SCHEDULE X</span>
            <span style="font-size:14px;">⚡</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:#A78BFA; margin-top:6px;">${scheduleXCount}</div>
          <div style="font-size:10px; color:#EDE9FE; margin-top:8px;">Controlled substances</div>
        </div>

        <!-- Row 2 - Tile 5: All Products (Kept at absolute last place) -->
        <div class="nokia-tile tile-btn ${activeFilter === 'ALL' ? 'active-tile' : ''}" data-filter="ALL" style="background:#131C2E; border:2px solid #64748B; border-radius:14px; padding:14px; cursor:pointer; position:relative; box-shadow:0 4px 14px rgba(100,116,139,0.15); transition:transform 0.15s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:10px; font-weight:900; color:#CBD5E1; letter-spacing:1px; text-transform:uppercase;">ALL PRODUCTS</span>
            <span style="font-size:14px;">🧱</span>
          </div>
          <div style="font-size:24px; font-weight:900; color:white; margin-top:6px;">${totalSKUs}</div>
          <div style="font-size:10px; color:#94A3B8; margin-top:8px;">Total active SKUs</div>
        </div>

      </div>

      <!-- ====================================================================== -->
      <!-- INTERACTIVE QUICK FILTERS & SMART SEARCH BAR (SINGLE ELEGANT LINE) -->
      <!-- ====================================================================== -->
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:12px; padding:10px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:nowrap;">
        
        <!-- Filter Pills in Single Line -->
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:nowrap; overflow-x:auto; flex:1;">
          <span style="font-size:10px; font-weight:900; color:var(--text-secondary); letter-spacing:0.5px; text-transform:uppercase; white-space:nowrap; margin-right:2px;">FILTERS:</span>
          
          <button class="filter-pill ${activeFilter === 'ALL' ? 'pill-active' : ''}" data-filter="ALL" style="border:none; border-radius:20px; padding:4px 10px; font-size:10px; font-weight:800; cursor:pointer; background:${activeFilter === 'ALL' ? '#0078D7' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
            ALL (${totalSKUs})
          </button>
          
          <button class="filter-pill ${activeFilter === 'OTC' ? 'pill-active' : ''}" data-filter="OTC" style="border:none; border-radius:20px; padding:4px 10px; font-size:10px; font-weight:800; cursor:pointer; background:${activeFilter === 'OTC' ? '#10B981' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
            OTC (${otcCount})
          </button>

          <button class="filter-pill ${activeFilter === 'SCHEDULE H' ? 'pill-active' : ''}" data-filter="SCHEDULE H" style="border:none; border-radius:20px; padding:4px 10px; font-size:10px; font-weight:800; cursor:pointer; background:${activeFilter === 'SCHEDULE H' ? '#3B82F6' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
            SCHED H (${scheduleHCount})
          </button>

          <button class="filter-pill ${activeFilter === 'SCHEDULE H1' ? 'pill-active' : ''}" data-filter="SCHEDULE H1" style="border:none; border-radius:20px; padding:4px 10px; font-size:10px; font-weight:800; cursor:pointer; background:${activeFilter === 'SCHEDULE H1' ? '#E11D48' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
            SCHED H1 (${scheduleH1Count})
          </button>

          <button class="filter-pill ${activeFilter === 'SCHEDULE X' ? 'pill-active' : ''}" data-filter="SCHEDULE X" style="border:none; border-radius:20px; padding:4px 10px; font-size:10px; font-weight:800; cursor:pointer; background:${activeFilter === 'SCHEDULE X' ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
            SCHED X (${scheduleXCount})
          </button>

          <button class="filter-pill ${activeFilter === 'LOW_STOCK' ? 'pill-active' : ''}" data-filter="LOW_STOCK" style="border:none; border-radius:20px; padding:4px 10px; font-size:10px; font-weight:800; cursor:pointer; background:${activeFilter === 'LOW_STOCK' ? '#F59E0B' : 'rgba(255,255,255,0.08)'}; color:white; white-space:nowrap;">
            ⚠️ LOW STOCK (${lowStockCount})
          </button>
        </div>

        <!-- Smart Unified Search Bar (Single Line Right Aligned) -->
        <div style="position:relative; width:280px; flex-shrink:0;">
          <input type="text" id="inventory-search-input" value="${searchQuery}" placeholder="🔍 Search brand, salt, distributor..." style="width:100%; background:#0F172A; border:1.5px solid #38BDF8; border-radius:10px; padding:6px 12px 6px 32px; font-size:11px; font-weight:700; color:white; box-shadow:0 3px 8px rgba(56,189,248,0.15);" />
          <span style="position:absolute; left:10px; top:6px; font-size:12px; opacity:0.8;">🔍</span>
        </div>
      </div>

      <!-- ====================================================================== -->
      <!-- FILTERED INVENTORY LIST -->
      <!-- ====================================================================== -->
      <div style="font-size:12px; font-weight:800; color:var(--text-secondary); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <span>Showing ${filteredItems.length} of ${inventoryItems.length} Products (${activeFilter.replace('_', ' ')})</span>
        ${(activeFilter !== 'ALL' || distributorFilter !== 'ALL' || searchQuery !== '') ? `<button id="btn-reset-filter" style="background:none; border:none; color:var(--tile-cyan); font-size:11px; cursor:pointer; text-decoration:underline;">Reset All Filters</button>` : ''}
      </div>

      <div class="metro-list" style="display:flex; flex-direction:column; gap:12px;">
        ${filteredItems.length === 0 ? `
          <div style="text-align:center; padding:40px; background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:10px; color:var(--text-secondary); font-size:13px;">
            🔍 No inventory items match the current filter or search criteria.
          </div>
        ` : filteredItems.map(item => {
          const isLow = item.currentQty <= item.minReorderLevel || item.healthStatus === 'LOW_STOCK';
          const isNearExp = item.healthStatus === 'NEAR_EXPIRY';
          const isExpired = item.healthStatus === 'EXPIRED';

          let schedBadgeBg = 'rgba(16,185,129,0.2)';
          let schedBadgeColor = '#34D399';
          if (item.schedule === 'SCHEDULE H') { schedBadgeBg = 'rgba(59,130,246,0.2)'; schedBadgeColor = '#60A5FA'; }
          else if (item.schedule === 'SCHEDULE H1') { schedBadgeBg = 'rgba(225,29,72,0.2)'; schedBadgeColor = '#FB7185'; }
          else if (item.schedule === 'SCHEDULE X') { schedBadgeBg = 'rgba(139,92,246,0.2)'; schedBadgeColor = '#C4B5FD'; }

          return `
            <div class="metro-item" style="background:var(--bg-card); border:1px solid var(--border-subtle); border-left:4px solid ${isExpired ? '#EF4444' : isNearExp ? '#F97316' : isLow ? '#F59E0B' : '#10B981'}; border-radius:10px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; gap:16px;">
              
              <!-- LEFT COLUMN: Product & Salt Details -->
              <div style="flex:1.2;">
                <div style="font-size:16px; font-weight:800; color:white; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <span>${item.brandName}</span>
                  <span style="background:${schedBadgeBg}; color:${schedBadgeColor}; font-size:10px; font-weight:900; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                    ${item.schedule}
                  </span>
                  <span style="font-size:10px; color:var(--text-secondary); background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px;">
                    SKU: ${item.sku}
                  </span>
                  ${isLow ? '<span style="background:rgba(245,158,11,0.2); color:#FBBF24; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">⚠️ Short-Book Alert</span>' : ''}
                  ${isNearExp ? '<span style="background:rgba(249,115,22,0.2); color:#FB923C; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">🕒 Near Expiry</span>' : ''}
                  ${isExpired ? '<span style="background:rgba(239,68,68,0.2); color:#F87171; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">🚫 EXPIRED</span>' : ''}
                </div>

                <div style="font-size:12px; color:var(--tile-cyan); font-weight:700; margin-top:4px;">
                  Salt: ${item.genericSalt} • <span style="color:var(--text-secondary);">Mfr: ${item.manufacturer}</span>
                </div>

                <div style="font-size:11px; color:var(--text-secondary); margin-top:3px;">
                  PTR: ₹${item.ptr.toFixed(2)} • MRP: ₹${item.mrp.toFixed(2)} • Exp: ${item.expiryDate} • Batch: ${item.batchNo}
                </div>
              </div>

              <!-- CENTER COLUMN: Stockist / Last Distributor Info -->
              <div style="flex:1; padding:0 14px; border-left:1px solid rgba(255,255,255,0.08); border-right:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:10px; font-weight:800; color:var(--text-secondary); letter-spacing:0.5px; text-transform:uppercase;">
                  LAST DISTRIBUTOR / STOCKIST
                </div>
                <div style="font-size:13px; font-weight:800; color:#38BDF8; margin-top:3px; display:flex; align-items:center; gap:6px;">
                  <span>🏭 ${item.distributorName}</span>
                  <span style="font-size:10px; color:#94A3B8;">(${item.distanceKm} km)</span>
                </div>
                <div style="font-size:11px; color:#A7F3D0; font-weight:700; margin-top:3px; display:flex; align-items:center; gap:4px;">
                  <span>🎁 Active Scheme:</span>
                  <span style="color:#34D399;">${item.activeScheme}</span>
                </div>
              </div>

              <!-- RIGHT COLUMN: Stock Quantity & Action Buttons -->
              <div style="display:flex; align-items:center; gap:14px;">
                <div style="text-align:right;">
                  <div style="font-size:18px; font-weight:900; color:${isExpired ? '#F87171' : isLow ? '#FBBF24' : 'white'};">
                    ${item.currentQty} <span style="font-size:11px; font-weight:normal; color:var(--text-secondary);">packs</span>
                  </div>
                  <div style="font-size:10px; color:var(--text-secondary);">Min: ${item.minReorderLevel}</div>
                </div>

                <!-- Action Buttons: Deduct Sale, Compare, Add to Basket -->
                <div style="display:flex; flex-direction:column; gap:5px;">
                  <div style="display:flex; gap:6px;">
                    <!-- Deduct Sale Button -->
                    <button class="action-btn deduct-sale-btn" data-id="${item.id}" style="flex:1; padding:5px 8px; font-size:10px; font-weight:800; border-radius:6px; background:linear-gradient(135deg, #F59E0B, #D97706); border:none; color:white; cursor:pointer;">
                      -1 SALE
                    </button>

                    <!-- Compare Button -->
                    <button class="action-btn open-compare-btn" data-id="${item.id}" style="flex:1; padding:5px 8px; font-size:10px; font-weight:800; border-radius:6px; background:linear-gradient(135deg, #8B5CF6, #6D28D9); border:none; color:white; cursor:pointer;" title="Compare Rates, Schemes & Criteria">
                      ⚖️ COMPARE
                    </button>
                  </div>

                  <!-- Direct Add to Central Basket Button -->
                  <button class="action-btn direct-add-basket-btn" data-id="${item.id}" style="padding:6px 10px; font-size:11px; font-weight:800; border-radius:6px; background:linear-gradient(135deg, #10B981, #059669); border:none; color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px; box-shadow:0 3px 8px rgba(16,185,129,0.3);">
                    🛒 ADD TO BASKET
                  </button>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>

      <!-- ====================================================================== -->
      <!-- SUB-WINDOW: FLOATING SIDE COMPARISON DRAWER WITH SMART DISTRIBUTOR SEARCH -->
      <!-- ====================================================================== -->
      ${selectedCompareItem ? `
        <div id="compare-drawer-backdrop" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); z-index:9999; display:flex; justify-content:flex-end;">
          
          <!-- Side Drawer Sub-Window -->
          <div style="background:#0F172A; border-left:3px solid #8B5CF6; width:100%; max-width:600px; height:100%; padding:24px; box-shadow:-10px 0 30px rgba(0,0,0,0.8); overflow-y:auto; animation:slideLeft 0.25s ease;">
            
            <!-- Drawer Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:14px; margin-bottom:16px;">
              <div>
                <h2 style="font-size:18px; font-weight:900; color:white; margin:0; display:flex; align-items:center; gap:8px;">
                  ⚖️ Distributor & Scheme Comparison
                </h2>
                <div style="font-size:12px; color:#A78BFA; font-weight:700; margin-top:2px;">
                  ${selectedCompareItem.brandName} (${selectedCompareItem.genericSalt})
                </div>
              </div>
              <button id="btn-close-compare-drawer" style="background:none; border:none; color:#94A3B8; font-size:22px; cursor:pointer;">✕</button>
            </div>

            <!-- Product Quick Specs -->
            <div style="background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.3); border-radius:10px; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:11px; color:#C4B5FD;">Manufacturer: <strong style="color:white;">${selectedCompareItem.manufacturer}</strong></div>
                <div style="font-size:11px; color:#C4B5FD; margin-top:2px;">Drug Schedule: <strong style="color:white;">${selectedCompareItem.schedule}</strong></div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px; color:#C4B5FD;">MRP Rate: <strong style="color:white;">₹${selectedCompareItem.mrp.toFixed(2)}</strong></div>
                <div style="font-size:11px; color:#C4B5FD; margin-top:2px;">Min Level: <strong style="color:white;">${selectedCompareItem.minReorderLevel} packs</strong></div>
              </div>
            </div>

            <!-- Filter Criteria & Smart Distributor Search Box inside Drawer -->
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(139,92,246,0.4); border-radius:12px; padding:14px; margin-bottom:20px; display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="font-size:11px; font-weight:900; color:#C4B5FD; text-transform:uppercase; letter-spacing:0.5px;">
                  🎯 Select Filter Criteria:
                </div>

                <select id="drawer-criteria-filter" style="background:#1E1B4B; border:1px solid #8B5CF6; color:white; font-size:12px; font-weight:800; padding:6px 12px; border-radius:8px; cursor:pointer;">
                  <option value="PTR_ASC" ${compareSortCriteria === 'PTR_ASC' ? 'selected' : ''}>🏷️ Filter: Lowest PTR Rate</option>
                  <option value="SCHEME_BEST" ${compareSortCriteria === 'SCHEME_BEST' ? 'selected' : ''}>🎁 Filter: Best Scheme Bonus Yield</option>
                  <option value="NEAREST" ${compareSortCriteria === 'NEAREST' ? 'selected' : ''}>⚡ Filter: Nearest Express Delivery</option>
                  <option value="MARGIN_DESC" ${compareSortCriteria === 'MARGIN_DESC' ? 'selected' : ''}>💰 Filter: Highest Retailer Margin %</option>
                  <option value="CUSTOM_SEARCH" ${compareSortCriteria === 'CUSTOM_SEARCH' ? 'selected' : ''}>🔍 Distributor Search / Custom Text</option>
                </select>
              </div>

              <!-- Smart Distributor Search / Text Input (Preserves focus while typing) -->
              <div style="position:relative;">
                <input type="text" id="drawer-dist-search-input" value="${drawerCustomDistributorText}" placeholder="Type distributor name to search / custom stockist..." style="width:100%; background:#0F172A; border:1px solid rgba(139,92,246,0.5); border-radius:8px; padding:7px 12px 7px 32px; font-size:12px; color:white;" />
                <span style="position:absolute; left:10px; top:7px; font-size:12px; opacity:0.6;">🔍</span>
              </div>
            </div>

            <!-- Comparison Table Matrix Container (Targeted DOM Update) -->
            <div id="compare-matrix-list-container">
              ${renderDrawerMatrixHtml()}
            </div>

          </div>
        </div>
      ` : ''}
    `;

    attachEvents();

    // Restore input focus & selection cursor position if previously focused
    if (activeId) {
      const restoredEl = container.querySelector(`#${activeId}`) as HTMLInputElement | null;
      if (restoredEl) {
        restoredEl.focus();
        if (cursorPos !== null && restoredEl.setSelectionRange) {
          try { restoredEl.setSelectionRange(cursorPos, cursorPos); } catch {}
        }
      }
    }
  }

  function attachEvents(): void {
    // 1. Barcode scanner & Export Excel
    container.querySelector('#btn-scan-barcode')?.addEventListener('click', () => {
      NotificationEngine.showToast('📷 Camera scanner active! Scan medicine GS1 2D barcode...', 'info');
    });

    container.querySelector('#btn-export-excel-tile')?.addEventListener('click', () => {
      NotificationEngine.showToast('📊 Generating & Exporting Stock Inventory Excel Sheet (.xlsx)...', 'success');
    });

    // 2. Tile Buttons & Quick Filter Pills Click
    container.querySelectorAll('.tile-btn, .filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterVal = (e.currentTarget as HTMLElement).getAttribute('data-filter') || 'ALL';
        activeFilter = filterVal;
        render();
      });
    });

    // 3. Reset Filter
    container.querySelector('#btn-reset-filter')?.addEventListener('click', () => {
      activeFilter = 'ALL';
      distributorFilter = 'ALL';
      searchQuery = '';
      render();
    });

    // 5. Live Main Search Input (Smart search without losing focus)
    const searchInput = container.querySelector('#inventory-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target as HTMLInputElement).value;
        render();
      });
    }

    // 6. Deduct Sale (-1 Sale)
    container.querySelectorAll('.deduct-sale-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const item = inventoryItems.find(i => i.id === id);
        if (item && item.currentQty > 0) {
          item.currentQty--;
          if (item.currentQty <= item.minReorderLevel) {
            item.healthStatus = 'LOW_STOCK';
            NotificationEngine.showToast(`⚠️ ${item.brandName} dropped below min level! Added to Short-Book`, 'warning');
          } else {
            NotificationEngine.showToast(`Deducted 1 sale for ${item.brandName}. Current stock: ${item.currentQty}`, 'success');
          }
          render();
        }
      });
    });

    // 7. Direct Add to Central Basket Button
    container.querySelectorAll('.direct-add-basket-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const item = inventoryItems.find(i => i.id === id);
        if (item) {
          BasketStore.addItem({
            sku: item.sku,
            brandName: item.brandName,
            genericSalt: item.genericSalt,
            category: item.schedule,
            packSize: '10x10',
            qty: 1,
            ptr: item.ptr,
            gstPct: 12,
            schemeText: item.activeScheme,
            distributorName: item.distributorName,
            distributorPhone: item.distributorPhone,
          });
          NotificationEngine.showToast(`🛒 ${item.brandName} added to Central Basket!`, 'success');
        }
      });
    });

    // 8. Open Floating Compare Side Drawer
    container.querySelectorAll('.open-compare-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const item = inventoryItems.find(i => i.id === id);
        if (item) {
          selectedCompareItem = item;
          drawerCustomDistributorText = '';
          render();
        }
      });
    });

    // 9. Close Compare Drawer
    container.querySelector('#btn-close-compare-drawer')?.addEventListener('click', () => {
      selectedCompareItem = null;
      drawerCustomDistributorText = '';
      render();
    });

    // 10. Change Filter Criteria inside Drawer
    const drawerFilterSelect = container.querySelector('#drawer-criteria-filter') as HTMLSelectElement;
    if (drawerFilterSelect) {
      drawerFilterSelect.addEventListener('change', (e) => {
        compareSortCriteria = (e.target as HTMLSelectElement).value;
        updateDrawerMatrixOnly();
      });
    }

    // 11. Smart Live Search Input inside Drawer (Updates matrix only, preserves focus & typing)
    const drawerDistInput = container.querySelector('#drawer-dist-search-input') as HTMLInputElement;
    if (drawerDistInput) {
      drawerDistInput.addEventListener('input', (e) => {
        drawerCustomDistributorText = (e.target as HTMLInputElement).value;
        updateDrawerMatrixOnly();
      });
    }

    // 12. Select & Add from Compare Drawer
    container.querySelectorAll('.select-compare-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const distName = target.getAttribute('data-dist') || '';
        const ptr = parseFloat(target.getAttribute('data-ptr') || '0');
        const scheme = target.getAttribute('data-scheme') || '';

        if (selectedCompareItem) {
          BasketStore.addItem({
            sku: selectedCompareItem.sku,
            brandName: selectedCompareItem.brandName,
            genericSalt: selectedCompareItem.genericSalt,
            category: selectedCompareItem.schedule,
            packSize: '10x10',
            qty: 1,
            ptr: ptr || selectedCompareItem.ptr,
            gstPct: 12,
            schemeText: scheme || selectedCompareItem.activeScheme,
            distributorName: distName || selectedCompareItem.distributorName,
            distributorPhone: selectedCompareItem.distributorPhone,
          });

          NotificationEngine.showToast(`🛒 ${selectedCompareItem.brandName} selected & added from ${distName}!`, 'success');
          selectedCompareItem = null;
          drawerCustomDistributorText = '';
          render();
        }
      });
    });
  }

  render();
}
