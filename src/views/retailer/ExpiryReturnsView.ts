/**
 * RxFlow Expired & Near Expiry Stock Desk v3.0
 * Dedicated Retailer Dashboard for Expired & Near-Expiry Medicine Management
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { PRODUCTS, DISTRIBUTORS } from '../../data/mockDataStore';

interface ExpiryItem {
  id: string;
  sku: string;
  brandName: string;
  genericSalt: string;
  batchNo: string;
  expiryDate: string; // YYYY-MM-DD
  expiryFormatted: string;
  daysDiff: number; // negative = expired, positive = days left
  qty: number;
  ptr: number;
  mrp: number;
  distributorName: string;
  distributorId: string;
  status: 'expired' | 'near_expiry';
  actionRecommendation: string;
}

export default function ExpiryReturnsView(container: HTMLElement): void {
  // Comprehensive mock inventory of Expired and Near Expiry items
  const inventoryList: ExpiryItem[] = [
    {
      id: 'exp-101',
      sku: PRODUCTS[0]?.sku || 'SKU-B1',
      brandName: PRODUCTS[0]?.brandName || 'Brand B1 (Calpol 650)',
      genericSalt: PRODUCTS[0]?.genericSalt || 'Paracetamol 650mg',
      batchNo: 'BCH-2026-101',
      expiryDate: '2026-07-15',
      expiryFormatted: '15 Jul 2026',
      daysDiff: -18,
      qty: 12,
      ptr: PRODUCTS[0]?.ptr || 50.40,
      mrp: PRODUCTS[0]?.mrp || 62.00,
      distributorName: DISTRIBUTORS[0]?.name || 'Distributor D1 (Medico Pharma)',
      distributorId: DISTRIBUTORS[0]?.id || 'dist-d1',
      status: 'expired',
      actionRecommendation: '🔴 Return to Distributor D1 for Credit Note',
    },
    {
      id: 'exp-102',
      sku: PRODUCTS[1]?.sku || 'SKU-B2',
      brandName: PRODUCTS[1]?.brandName || 'Brand B2 (Augmentin 625)',
      genericSalt: PRODUCTS[1]?.genericSalt || 'Amoxycillin + Clavulanate 625mg',
      batchNo: 'BCH-2026-102',
      expiryDate: '2026-07-01',
      expiryFormatted: '01 Jul 2026',
      daysDiff: -32,
      qty: 8,
      ptr: PRODUCTS[1]?.ptr || 196.00,
      mrp: PRODUCTS[1]?.mrp || 235.00,
      distributorName: DISTRIBUTORS[1]?.name || 'Distributor D2 (Stockist Agencies)',
      distributorId: DISTRIBUTORS[1]?.id || 'dist-d2',
      status: 'expired',
      actionRecommendation: '🔴 Return to Distributor D2 for Credit Note',
    },
    {
      id: 'exp-103',
      sku: PRODUCTS[2]?.sku || 'SKU-B3',
      brandName: PRODUCTS[2]?.brandName || 'Brand B3 (Pantocid D SR)',
      genericSalt: PRODUCTS[2]?.genericSalt || 'Pantoprazole 40mg + Domperidone',
      batchNo: 'BCH-2026-103',
      expiryDate: '2026-06-28',
      expiryFormatted: '28 Jun 2026',
      daysDiff: -35,
      qty: 15,
      ptr: PRODUCTS[2]?.ptr || 125.00,
      mrp: PRODUCTS[2]?.mrp || 155.00,
      distributorName: DISTRIBUTORS[0]?.name || 'Distributor D1 (Medico Pharma)',
      distributorId: DISTRIBUTORS[0]?.id || 'dist-d1',
      status: 'expired',
      actionRecommendation: '🔴 Return to Distributor D1 for Credit Note',
    },
    {
      id: 'exp-204',
      sku: PRODUCTS[3]?.sku || 'SKU-B4',
      brandName: PRODUCTS[3]?.brandName || 'Brand B4 (Azithral 500)',
      genericSalt: PRODUCTS[3]?.genericSalt || 'Azithromycin 500mg',
      batchNo: 'BCH-2026-204',
      expiryDate: '2026-08-15',
      expiryFormatted: '15 Aug 2026',
      daysDiff: 13,
      qty: 20,
      ptr: PRODUCTS[3]?.ptr || 115.00,
      mrp: PRODUCTS[3]?.mrp || 140.00,
      distributorName: DISTRIBUTORS[2]?.name || 'Distributor D3 (Stockist Agencies)',
      distributorId: DISTRIBUTORS[2]?.id || 'dist-d3',
      status: 'near_expiry',
      actionRecommendation: '⚡ Apply 20% FEFO Clearance Discount',
    },
    {
      id: 'exp-205',
      sku: PRODUCTS[4]?.sku || 'SKU-B5',
      brandName: PRODUCTS[4]?.brandName || 'Brand B5 (Clavam 625)',
      genericSalt: PRODUCTS[4]?.genericSalt || 'Amoxycillin 500mg + Clav 125mg',
      batchNo: 'BCH-2026-205',
      expiryDate: '2026-08-25',
      expiryFormatted: '25 Aug 2026',
      daysDiff: 23,
      qty: 18,
      ptr: PRODUCTS[4]?.ptr || 180.00,
      mrp: PRODUCTS[4]?.mrp || 215.00,
      distributorName: DISTRIBUTORS[0]?.name || 'Distributor D1 (Medico Pharma)',
      distributorId: DISTRIBUTORS[0]?.id || 'dist-d1',
      status: 'near_expiry',
      actionRecommendation: '⚡ Buy 10 Get 2 Scheme Clearance',
    },
    {
      id: 'exp-206',
      sku: PRODUCTS[5]?.sku || 'SKU-B6',
      brandName: PRODUCTS[5]?.brandName || 'Brand B6 (Shelcal 500)',
      genericSalt: PRODUCTS[5]?.genericSalt || 'Calcium 500mg + Vit D3',
      batchNo: 'BCH-2026-206',
      expiryDate: '2026-09-05',
      expiryFormatted: '05 Sep 2026',
      daysDiff: 34,
      qty: 25,
      ptr: PRODUCTS[5]?.ptr || 85.00,
      mrp: PRODUCTS[5]?.mrp || 105.00,
      distributorName: DISTRIBUTORS[1]?.name || 'Distributor D2 (Stockist Agencies)',
      distributorId: DISTRIBUTORS[1]?.id || 'dist-d2',
      status: 'near_expiry',
      actionRecommendation: '⚡ Priority FEFO Dispense at Counter',
    },
    {
      id: 'exp-207',
      sku: PRODUCTS[6]?.sku || 'SKU-B7',
      brandName: PRODUCTS[6]?.brandName || 'Brand B7 (Becosules Z)',
      genericSalt: PRODUCTS[6]?.genericSalt || 'Vit B Complex + Zinc',
      batchNo: 'BCH-2026-207',
      expiryDate: '2026-09-18',
      expiryFormatted: '18 Sep 2026',
      daysDiff: 47,
      qty: 30,
      ptr: PRODUCTS[6]?.ptr || 45.00,
      mrp: PRODUCTS[6]?.mrp || 58.00,
      distributorName: DISTRIBUTORS[3]?.name || 'Distributor D4 (Stockist Agencies)',
      distributorId: DISTRIBUTORS[3]?.id || 'dist-d4',
      status: 'near_expiry',
      actionRecommendation: '⚡ Priority FEFO Dispense at Counter',
    },
    {
      id: 'exp-208',
      sku: PRODUCTS[7]?.sku || 'SKU-B8',
      brandName: PRODUCTS[7]?.brandName || 'Brand B8 (Combiflam)',
      genericSalt: PRODUCTS[7]?.genericSalt || 'Ibuprofen 400mg + Paracetamol',
      batchNo: 'BCH-2026-208',
      expiryDate: '2026-09-30',
      expiryFormatted: '30 Sep 2026',
      daysDiff: 59,
      qty: 40,
      ptr: PRODUCTS[7]?.ptr || 32.00,
      mrp: PRODUCTS[7]?.mrp || 42.00,
      distributorName: DISTRIBUTORS[0]?.name || 'Distributor D1 (Medico Pharma)',
      distributorId: DISTRIBUTORS[0]?.id || 'dist-d1',
      status: 'near_expiry',
      actionRecommendation: '⚡ Priority FEFO Dispense at Counter',
    },
  ];

  let activeTab: 'all' | 'expired' | 'near_expiry' = 'all';
  let selectedDistributor = 'all';
  let searchQuery = '';

  function render(): void {
    const expiredItems = inventoryList.filter(i => i.status === 'expired');
    const nearExpiryItems = inventoryList.filter(i => i.status === 'near_expiry');

    const totalExpiredVal = expiredItems.reduce((sum, item) => sum + (item.qty * item.ptr), 0);
    const totalNearExpiryVal = nearExpiryItems.reduce((sum, item) => sum + (item.qty * item.ptr), 0);
    const totalRiskVal = totalExpiredVal + totalNearExpiryVal;

    // Filter items based on active tab, distributor, and search
    const filteredList = inventoryList.filter(item => {
      if (activeTab === 'expired' && item.status !== 'expired') return false;
      if (activeTab === 'near_expiry' && item.status !== 'near_expiry') return false;

      if (selectedDistributor !== 'all' && item.distributorId !== selectedDistributor) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.brandName.toLowerCase().includes(q) ||
          item.genericSalt.toLowerCase().includes(q) ||
          item.batchNo.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.distributorName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    container.innerHTML = `
      <!-- Top Title Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:2px solid var(--tile-red); padding-bottom:8px;">
        <div>
          <h1 style="font-size:22px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:white; margin:0; display:flex; align-items:center; gap:8px;">
            <span style="font-size:24px;">⌛</span> Expired & Near Expiry Stock Desk
          </h1>
          <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">
            FEFO Inventory Control & Return Claim Management across Brands B1-B30
          </div>
        </div>
        <span style="font-size:11px; font-weight:800; color:#F87171; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); padding:4px 10px; border-radius:6px;">
          FEFO Sentinel Active
        </span>
      </div>

      <!-- Top Summary Stat Cards -->
      <div class="grid grid-cols-3 gap-md mb-md">
        
        <!-- Card 1: Expired Items -->
        <div style="background:linear-gradient(135deg, rgba(239,68,68,0.18), rgba(185,28,28,0.08)); border:1px solid rgba(239,68,68,0.4); border-radius:10px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#F87171;">
              🔴 Expired Stock Alert
            </div>
            <div style="font-size:26px; font-weight:900; color:white; margin:4px 0;">
              ₹${totalExpiredVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size:12px; font-weight:700; color:#FCA5A5;">
              ${expiredItems.length} Batches Expired • Action Required
            </div>
          </div>
          <div style="width:42px; height:42px; border-radius:50%; background:rgba(239,68,68,0.2); display:flex; align-items:center; justify-content:center; font-size:20px; color:#F87171;">
            ⚠️
          </div>
        </div>

        <!-- Card 2: Near Expiry Items -->
        <div style="background:linear-gradient(135deg, rgba(245,158,11,0.18), rgba(180,83,9,0.08)); border:1px solid rgba(245,158,11,0.4); border-radius:10px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#FBBF24;">
              🟠 Near Expiry (< 60 Days)
            </div>
            <div style="font-size:26px; font-weight:900; color:white; margin:4px 0;">
              ₹${totalNearExpiryVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size:12px; font-weight:700; color:#FDE68A;">
              ${nearExpiryItems.length} Batches Approaching Expiry
            </div>
          </div>
          <div style="width:42px; height:42px; border-radius:50%; background:rgba(245,158,11,0.2); display:flex; align-items:center; justify-content:center; font-size:20px; color:#FBBF24;">
            ⏳
          </div>
        </div>

        <!-- Card 3: Total Value at Risk -->
        <div style="background:linear-gradient(135deg, rgba(0,120,215,0.18), rgba(92,45,145,0.18)); border:1px solid rgba(0,120,215,0.4); border-radius:10px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--tile-cyan);">
              💰 Total Stock Value at Risk
            </div>
            <div style="font-size:26px; font-weight:900; color:white; margin:4px 0;">
              ₹${totalRiskVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size:12px; font-weight:700; color:#93C5FD;">
              ${inventoryList.length} Total Monitored Batches
            </div>
          </div>
          <div style="width:42px; height:42px; border-radius:50%; background:rgba(0,120,215,0.2); display:flex; align-items:center; justify-content:center; font-size:20px; color:var(--tile-cyan);">
            📊
          </div>
        </div>

      </div>

      <!-- Controls & Filter Section -->
      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:10px; padding:14px; margin-bottom:16px;">
        
        <!-- Preset Filter Tabs -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="tx-filter-chip ${activeTab === 'all' ? 'active' : ''}" data-tab="all">
              🌐 All Tracked Batches (${inventoryList.length})
            </button>
            <button class="tx-filter-chip ${activeTab === 'expired' ? 'active' : ''}" data-tab="expired">
              🔴 Expired Stock (${expiredItems.length})
            </button>
            <button class="tx-filter-chip ${activeTab === 'near_expiry' ? 'active' : ''}" data-tab="near_expiry">
              🟠 Near Expiry < 60 Days (${nearExpiryItems.length})
            </button>
          </div>

          <div style="font-size:12px; font-weight:700; color:var(--text-secondary);">
            Showing <strong style="color:white;">${filteredList.length}</strong> of ${inventoryList.length} Batches
          </div>
        </div>

        <!-- Search Bar & Distributor Filter -->
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:10px; align-items:center;">
          <input 
            type="text" 
            id="exp-search-input" 
            value="${searchQuery}"
            placeholder="🔍 Search by medicine name, salt, batch no, or distributor..." 
            style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:8px 12px; color:white; font-size:12px; outline:none;"
          />

          <select id="exp-distributor-select" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:8px 12px; color:white; font-size:12px; outline:none;">
            <option value="all" ${selectedDistributor === 'all' ? 'selected' : ''}>🏢 All Distributors</option>
            ${DISTRIBUTORS.map(d => `
              <option value="${d.id}" ${selectedDistributor === d.id ? 'selected' : ''}>${d.name}</option>
            `).join('')}
          </select>
        </div>

      </div>

      <!-- Main Expired & Near Expiry Inventory List -->
      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:10px; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:8px; flex-wrap:wrap; gap:12px;">
          <div style="font-size:15px; font-weight:800; color:var(--text-primary); flex:1; min-width:240px;">
            📦 Stock Status & FEFO Clearance Recommendations
          </div>
          <button class="action-btn" id="btn-export-expiry-report" style="background:rgba(255,255,255,0.08); border:1px solid var(--border-subtle); color:var(--text-primary); font-size:11px; font-weight:700; padding:6px 14px; border-radius:6px; cursor:pointer; flex-shrink:0; white-space:nowrap;">
            📥 Export Stock Audit PDF
          </button>
        </div>

        ${filteredList.length === 0 ? `
          <div style="text-align:center; padding:40px 10px; color:var(--text-secondary); font-size:13px;">
            🔍 No expired or near-expiry batches match your current filter query.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${filteredList.map(item => {
              const isExpired = item.status === 'expired';
              const totalVal = item.qty * item.ptr;
              const badgeBg = isExpired ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)';
              const badgeBorder = isExpired ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)';
              const badgeColor = isExpired ? '#F87171' : '#FBBF24';
              const daysText = isExpired ? `Expired ${Math.abs(item.daysDiff)} Days Ago` : `Expiring in ${item.daysDiff} Days`;

              return `
                <div style="background:rgba(0,0,0,0.3); border:1px solid ${isExpired ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}; border-radius:8px; padding:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                  
                  <!-- Left Info: Medicine & Salt -->
                  <div style="min-width:240px; flex:1;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                      <span style="font-size:15px; font-weight:800; color:white;">${item.brandName}</span>
                      <span style="font-size:10px; font-weight:800; background:${badgeBg}; color:${badgeColor}; border:1px solid ${badgeBorder}; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
                        ${isExpired ? '🔴 EXPIRED' : '🟠 NEAR EXPIRY'}
                      </span>
                    </div>
                    <div style="font-size:12px; color:var(--text-secondary); font-weight:600;">
                      Salt: ${item.genericSalt} • Batch: <strong style="color:white;">${item.batchNo}</strong>
                    </div>
                    <div style="font-size:11px; color:var(--tile-cyan); margin-top:2px;">
                      Supplier: ${item.distributorName}
                    </div>
                  </div>

                  <!-- Middle Info: Expiry Date & Qty -->
                  <div style="min-width:180px;">
                    <div style="font-size:12px; font-weight:800; color:${badgeColor};">
                      📅 ${item.expiryFormatted}
                    </div>
                    <div style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-top:2px;">
                      ${daysText}
                    </div>
                    <div style="font-size:12px; font-weight:800; color:white; margin-top:2px;">
                      Quantity: ${item.qty} Packs
                    </div>
                  </div>

                  <!-- Price & Action -->
                  <div style="text-align:right; min-width:200px;">
                    <div style="font-size:16px; font-weight:900; color:${isExpired ? '#F87171' : '#34D399'};">
                      ₹${totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div style="font-size:10px; color:var(--text-secondary); margin-top:1px;">
                      PTR ₹${item.ptr.toFixed(2)} / pack
                    </div>

                    <div style="margin-top:8px;">
                      ${isExpired ? `
                        <button class="action-btn btn-claim-credit-note" data-id="${item.id}" data-brand="${item.brandName}" data-dist="${item.distributorName}" data-val="${totalVal.toFixed(2)}" style="background:linear-gradient(135deg, #EF4444, #B91C1C); color:white; font-size:11px; font-weight:800; padding:6px 14px; border-radius:6px; border:none; cursor:pointer;">
                          📦 Claim Credit Note
                        </button>
                      ` : `
                        <button class="action-btn btn-apply-clearance" data-id="${item.id}" data-brand="${item.brandName}" style="background:linear-gradient(135deg, #F59E0B, #D97706); color:white; font-size:11px; font-weight:800; padding:6px 14px; border-radius:6px; border:none; cursor:pointer;">
                          🏷️ FEFO Clearance Discount
                        </button>
                      `}
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Attach Event Listeners
    container.querySelectorAll('.tx-filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        activeTab = (target.getAttribute('data-tab') as any) || 'all';
        render();
      });
    });

    const searchInput = container.querySelector<HTMLInputElement>('#exp-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      render();
    });

    const distSelect = container.querySelector<HTMLSelectElement>('#exp-distributor-select');
    distSelect?.addEventListener('change', (e) => {
      selectedDistributor = (e.target as HTMLSelectElement).value;
      render();
    });

    container.querySelector('#btn-export-expiry-report')?.addEventListener('click', () => {
      NotificationEngine.showToast('📥 FEFO Stock Expiry Audit PDF report generated!', 'success');
    });

    container.querySelectorAll('.btn-claim-credit-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const brand = target.getAttribute('data-brand');
        const dist = target.getAttribute('data-dist');
        const val = target.getAttribute('data-val');
        NotificationEngine.showToast(`📦 Credit Note claim of ₹${val} submitted for ${brand} to ${dist}`, 'success');
        SyncOrchestrator.queueMutation('return_claims', 'INSERT', { brand, dist, val, date: new Date().toISOString() });
      });
    });

    container.querySelectorAll('.btn-apply-clearance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const brand = target.getAttribute('data-brand');
        NotificationEngine.showToast(`🏷️ FEFO 20% clearance discount tag applied to ${brand} on POS billing desk`, 'info');
      });
    });
  }

  render();
}

