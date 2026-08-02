/**
 * Mediflow MultiCartSplitter v3.0
 * 2-Screen Split View Order Engine:
 * - Screen 1: Product Search & Catalog with Scheme, Distributor, Category filters
 * - Screen 2: Realtime Multi-Distributor Basket with GST, Transport Expenses, Bin Delete, Quantity Controls
 * - Order Confirmation Dialog before placement
 * - Share Order via WhatsApp Deep Linking
 */

import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { NotificationEngine } from '../../engine/NotificationEngine';
import { navigate } from '../../engine/Router';
import { PRODUCTS } from '../../data/mockDataStore';
import { BasketStore, type BasketItem } from '../../store/BasketStore';

export interface CatalogProduct {
  id: string;
  sku: string;
  brandName: string;
  genericSalt: string;
  category: string;
  packSize: string;
  ptr: number;
  gstPct: number;
  schemeText?: string;
  distributorId: string;
  distributorName: string;
  distributorPhone: string;
  movAmount: number;
  creditAvailable: number;
}

export default function MultiCartSplitter(container: HTMLElement): void {
  // Master Catalog List mapped from mock store & distributors
  const catalogProducts: CatalogProduct[] = [
    {
      id: 'cat-1',
      sku: PRODUCTS[0]?.sku || 'AUG625',
      brandName: 'Augmentin 625 Duo Tablet',
      genericSalt: 'Amoxycillin 500mg + Clav 125mg',
      category: 'Schedule H1',
      packSize: '10x10',
      ptr: 142.50,
      gstPct: 12,
      schemeText: 'Buy 10 Get 2 Free',
      distributorId: 'dist-shrine-001',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      movAmount: 500,
      creditAvailable: 85400,
    },
    {
      id: 'cat-2',
      sku: 'PAND',
      brandName: 'Pan-D Capsule',
      genericSalt: 'Pantoprazole 40mg + Domperidone',
      category: 'Schedule H',
      packSize: '10x10',
      ptr: 88.00,
      gstPct: 12,
      schemeText: 'Margin: 24%',
      distributorId: 'dist-shrine-001',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      movAmount: 500,
      creditAvailable: 85400,
    },
    {
      id: 'cat-3',
      sku: 'DOLO650',
      brandName: 'Dolo 650 Tablet',
      genericSalt: 'Paracetamol 650mg Antipyretic',
      category: 'OTC',
      packSize: '15x10',
      ptr: 26.80,
      gstPct: 12,
      schemeText: '₹2 Off per box',
      distributorId: 'dist-medico-002',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      movAmount: 1000,
      creditAvailable: 32000,
    },
    {
      id: 'cat-4',
      sku: 'AZITH500',
      brandName: 'Azithral 500 Tablet',
      genericSalt: 'Azithromycin 500mg Antibiotic',
      category: 'Schedule H',
      packSize: '1x5',
      ptr: 115.00,
      gstPct: 12,
      schemeText: 'Flat 10% Off',
      distributorId: 'dist-medico-002',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      movAmount: 1000,
      creditAvailable: 32000,
    },
    {
      id: 'cat-5',
      sku: 'ALP05',
      brandName: 'Alprax 0.5mg Tablet',
      genericSalt: 'Alprazolam 0.5mg Anxiolytic',
      category: 'Schedule X',
      packSize: '10x10',
      ptr: 45.00,
      gstPct: 18,
      schemeText: 'Clearance 15% Off',
      distributorId: 'dist-d3',
      distributorName: 'Distributor D3 (Stockist Agencies)',
      distributorPhone: '+91 98230 20003',
      movAmount: 800,
      creditAvailable: 25000,
    },
    {
      id: 'cat-6',
      sku: 'SHELCAL',
      brandName: 'Shelcal 500 Tablet',
      genericSalt: 'Calcium 500mg + Vit D3',
      category: 'OTC',
      packSize: '15x10',
      ptr: 85.00,
      gstPct: 12,
      schemeText: 'Buy 15 Get 2 Free',
      distributorId: 'dist-shrine-001',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      movAmount: 500,
      creditAvailable: 85400,
    },
  ];

  // Search & Filter State
  let searchQuery = '';
  let selectedDistributorFilter = 'all';
  let selectedSchemeFilter = 'all';
  let selectedCategoryFilter = 'all';

  const TRANSPORT_FEE_PER_DISTRIBUTOR = 50.00; // Flat ₹50 freight expense per stockist sub-order

  function render(): void {
    // Read live items from Central BasketStore
    const basketItems = BasketStore.getItems();

    // Filter catalog products for Screen 1
    const filteredCatalog = catalogProducts.filter(p => {
      if (selectedDistributorFilter !== 'all' && p.distributorId !== selectedDistributorFilter) return false;

      if (selectedSchemeFilter !== 'all') {
        if (selectedSchemeFilter === 'scheme_only' && !p.schemeText) return false;
      }

      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.brandName.toLowerCase().includes(q) ||
          p.genericSalt.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.distributorName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Group basket items by Distributor for Screen 2
    const distributorGroupsMap = new Map<string, {
      distributorId: string;
      distributorName: string;
      distributorPhone: string;
      movAmount: number;
      creditAvailable: number;
      items: BasketItem[];
    }>();

    basketItems.forEach(item => {
      if (!distributorGroupsMap.has(item.distributorId)) {
        distributorGroupsMap.set(item.distributorId, {
          distributorId: item.distributorId,
          distributorName: item.distributorName,
          distributorPhone: item.distributorPhone,
          movAmount: item.movAmount,
          creditAvailable: item.creditAvailable,
          items: [],
        });
      }
      distributorGroupsMap.get(item.distributorId)!.items.push(item);
    });

    const distributorGroups = Array.from(distributorGroupsMap.values());

    // Calculate Grand Total across all stockists
    let grandSubtotal = 0;
    let grandGst = 0;
    let grandTransport = 0;
    let grandTotal = 0;

    distributorGroups.forEach(group => {
      const subtotal = group.items.reduce((s, i) => s + (i.qty * i.ptr), 0);
      const gst = group.items.reduce((s, i) => s + (i.qty * i.ptr * (i.gstPct / 100)), 0);
      const transport = TRANSPORT_FEE_PER_DISTRIBUTOR;
      const total = subtotal + gst + transport;

      grandSubtotal += subtotal;
      grandGst += gst;
      grandTransport += transport;
      grandTotal += total;
    });

    container.innerHTML = `
      <!-- Page Title -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:2px solid var(--tile-blue); padding-bottom:6px;">
        <h1 style="font-size:22px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:white; margin:0; display:flex; align-items:center; gap:8px;">
          🛒 Place Orders — 2-Screen Multi-Distributor Basket
        </h1>
        <span style="font-size:11px; font-weight:800; color:var(--tile-cyan); background:rgba(0,183,195,0.15); border:1px solid rgba(0,183,195,0.3); padding:3px 10px; border-radius:4px;">
          Multi-Distributor Split Active
        </span>
      </div>

      <!-- 2-Screen Side-by-Side Grid -->
      <div style="display:grid; grid-template-columns: 1.1fr 0.9fr; gap:16px; align-items:flex-start;">
        
        <!-- ====================================================================== -->
        <!-- SCREEN 1 (LEFT PANEL): PRODUCT SEARCH & CATALOG WITH FILTERS -->
        <!-- ====================================================================== -->
        <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:10px; padding:16px;">
          <div style="font-size:15px; font-weight:800; color:white; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
            <span>🔍 Screen 1: Medicine Search & Catalog</span>
          </div>

          <!-- Search Input -->
          <div style="margin-bottom:10px;">
            <input 
              type="text" 
              id="cat-search-input" 
              value="${searchQuery}"
              placeholder="🔍 Search product name, salt, SKU, manufacturer..." 
              style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:8px; padding:9px 12px; color:white; font-size:12px; outline:none;"
            />
          </div>

          <!-- Filter Dropdowns Grid -->
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; margin-bottom:14px;">
            <div>
              <label style="font-size:10px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">DISTRIBUTOR</label>
              <select id="cat-distributor-filter" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:6px 8px; color:white; font-size:11px; outline:none;">
                <option value="all" ${selectedDistributorFilter === 'all' ? 'selected' : ''}>🏢 All Stockists</option>
                <option value="dist-shrine-001" ${selectedDistributorFilter === 'dist-shrine-001' ? 'selected' : ''}>Shrine Pharma Stockist</option>
                <option value="dist-medico-002" ${selectedDistributorFilter === 'dist-medico-002' ? 'selected' : ''}>Medico Distributors</option>
                <option value="dist-d3" ${selectedDistributorFilter === 'dist-d3' ? 'selected' : ''}>Distributor D3</option>
              </select>
            </div>

            <div>
              <label style="font-size:10px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">SCHEME OFFER</label>
              <select id="cat-scheme-filter" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:6px 8px; color:white; font-size:11px; outline:none;">
                <option value="all" ${selectedSchemeFilter === 'all' ? 'selected' : ''}>🎁 All Offers</option>
                <option value="scheme_only" ${selectedSchemeFilter === 'scheme_only' ? 'selected' : ''}>With Active Scheme Only</option>
              </select>
            </div>

            <div>
              <label style="font-size:10px; font-weight:700; color:var(--text-secondary); display:block; margin-bottom:2px;">CATEGORY</label>
              <select id="cat-category-filter" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:6px; padding:6px 8px; color:white; font-size:11px; outline:none;">
                <option value="all" ${selectedCategoryFilter === 'all' ? 'selected' : ''}>🏷️ All Categories</option>
                <option value="OTC" ${selectedCategoryFilter === 'OTC' ? 'selected' : ''}>OTC</option>
                <option value="Schedule H" ${selectedCategoryFilter === 'Schedule H' ? 'selected' : ''}>Schedule H</option>
                <option value="Schedule H1" ${selectedCategoryFilter === 'Schedule H1' ? 'selected' : ''}>Schedule H1</option>
                <option value="Schedule X" ${selectedCategoryFilter === 'Schedule X' ? 'selected' : ''}>Schedule X</option>
              </select>
            </div>
          </div>

          <!-- Product Catalog List -->
          <div class="no-scrollbar" style="max-height:480px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:2px;">
            ${filteredCatalog.length === 0 ? `
              <div style="text-align:center; padding:30px 10px; color:var(--text-secondary); font-size:12px;">
                🔍 No medicines match your selected filters.
              </div>
            ` : filteredCatalog.map(prod => `
              <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                <div>
                  <div style="font-size:14px; font-weight:800; color:white; display:flex; align-items:center; gap:6px;">
                    <span>${prod.brandName}</span>
                    <span style="font-size:9px; font-weight:800; padding:1px 6px; border-radius:4px; background:rgba(0,120,215,0.2); color:#60A5FA;">
                      ${prod.packSize}
                    </span>
                    ${prod.schemeText ? `
                      <span style="font-size:9px; font-weight:800; padding:1px 6px; border-radius:4px; background:rgba(16,185,129,0.2); color:#34D399;">
                        🎁 ${prod.schemeText}
                      </span>
                    ` : ''}
                  </div>
                  <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                    Salt: ${prod.genericSalt} • <strong style="color:var(--tile-cyan);">${prod.distributorName}</strong>
                  </div>
                  <div style="font-size:11px; color:#A7F3D0; font-weight:700; margin-top:2px;">
                    PTR: ₹${prod.ptr.toFixed(2)} • GST: ${prod.gstPct}%
                  </div>
                </div>

                <button class="action-btn btn-add-to-basket" data-id="${prod.id}" style="background:linear-gradient(135deg, #0078D7, #00B7C3); color:white; font-size:11px; font-weight:800; padding:6px 12px; border-radius:6px; border:none; cursor:pointer; white-space:nowrap;">
                  🛒 Add to Basket
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ====================================================================== -->
        <!-- SCREEN 2 (RIGHT PANEL): REALTIME MULTI-DISTRIBUTOR BASKET -->
        <!-- ====================================================================== -->
        <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:12px; padding:16px;">
          
          <!-- Basket Header Bar -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:10px;">
            <div style="font-size:16px; font-weight:800; color:white; display:flex; align-items:center; gap:8px;">
              <span>🧺 Basket (${basketItems.reduce((s, i) => s + i.qty, 0)} Items)</span>
            </div>
          </div>

          ${basketItems.length === 0 ? `
            <div style="text-align:center; padding:50px 10px; color:var(--text-secondary); font-size:13px;">
              🛒 Your basket is empty. Add products from Screen 1 on the left!
            </div>
          ` : `
            <!-- Basket Items Flat List inside 3D Container (No Big Distributor Header) -->
            <div class="no-scrollbar" style="max-height:410px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:2px;">
              ${basketItems.map(item => {
                const itemGstAmount = item.qty * item.ptr * (item.gstPct / 100);
                const itemTotal = (item.qty * item.ptr) + itemGstAmount;

                return `
                  <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08); border-left:4px solid var(--tile-green); border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:10px; box-shadow:0 3px 10px rgba(0,0,0,0.3);">
                    <div style="flex:1;">
                      <div style="font-size:13px; font-weight:800; color:white; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span>${item.brandName}</span>
                        ${item.schemeText ? `<span style="font-size:9px; color:#34D399; font-weight:800; background:rgba(16,185,129,0.15); padding:1px 6px; border-radius:4px;">🎁 ${item.schemeText}</span>` : ''}
                      </div>

                      <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">
                        Salt: ${item.genericSalt} • Pack: (${item.packSize})
                      </div>

                      <!-- PTR & GST Line -->
                      <div style="font-size:10px; color:#93C5FD; font-weight:700; margin-top:2px;">
                        PTR ₹${item.ptr.toFixed(2)} + GST ${item.gstPct}% (₹${itemGstAmount.toFixed(2)})
                      </div>

                      <!-- Stockist Name Below PTR Line in Professional Way -->
                      <div style="font-size:10px; color:var(--tile-cyan); font-weight:700; margin-top:3px; display:flex; align-items:center; gap:4px;">
                        <span>🏢 Stockist:</span>
                        <strong style="color:white; font-weight:800;">${item.distributorName}</strong>
                      </div>
                    </div>

                    <div style="display:flex; align-items:center; gap:10px;">
                      <!-- Quantity Controls -->
                      <div style="display:flex; align-items:center; background:rgba(0,0,0,0.6); border:1px solid var(--border-subtle); border-radius:4px; padding:2px 6px; gap:6px;">
                        <button class="btn-qty-mod" data-cart-id="${item.id}" data-delta="-1" style="background:none; border:none; color:white; font-size:14px; font-weight:800; cursor:pointer;">-</button>
                        <span style="font-size:12px; font-weight:800; color:white; min-width:18px; text-align:center;">${item.qty}</span>
                        <button class="btn-qty-mod" data-cart-id="${item.id}" data-delta="1" style="background:none; border:none; color:white; font-size:14px; font-weight:800; cursor:pointer;">+</button>
                      </div>

                      <!-- Item Price Total -->
                      <div style="font-size:14px; font-weight:900; color:#34D399; min-width:70px; text-align:right;">
                        ₹${itemTotal.toFixed(2)}
                      </div>

                      <!-- Trash Bin Delete Button -->
                      <button class="btn-delete-cart-item" data-cart-id="${item.id}" title="Remove item" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#F87171; border-radius:4px; padding:4px 7px; cursor:pointer; font-size:12px;">
                        🗑️
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}

          <!-- Realtime Grand Total & Expenses Summary -->
          <div style="background:linear-gradient(135deg, rgba(0,120,215,0.25), rgba(16,185,129,0.2)); border:1px solid var(--tile-green); border-radius:10px; padding:14px; margin-top:14px; box-shadow:0 4px 14px rgba(0,0,0,0.4);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:11px; color:var(--text-secondary);">
              <span>Subtotal: ₹${grandSubtotal.toFixed(2)}</span>
              <span>GST Tax: ₹${grandGst.toFixed(2)}</span>
              <span>Freight/Transport: ₹${grandTransport.toFixed(2)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:var(--tile-green); letter-spacing:0.5px;">
                  GRAND TOTAL (${distributorGroups.length} Stockist Orders)
                </div>
                <div style="font-size:24px; font-weight:900; color:#34D399; margin-top:2px;">
                  ₹${grandTotal.toFixed(2)}
                </div>
              </div>

              <button class="action-btn action-btn--success" id="btn-confirm-all-orders" ${basketItems.length === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} style="padding:10px 18px; font-size:13px; font-weight:900; box-shadow:0 4px 12px rgba(16,185,129,0.4);">
                ⚡ Confirm & Place All Orders
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- Modal Container for Order Confirmation -->
      <div id="cart-modal-container"></div>
    `;

    attachEvents(distributorGroups, grandTotal);
  }

  function attachEvents(
    distributorGroups: Array<{
      distributorId: string;
      distributorName: string;
      distributorPhone: string;
      movAmount: number;
      creditAvailable: number;
      items: BasketItem[];
    }>,
    grandTotal: number
  ): void {
    // Search input
    const searchInput = container.querySelector<HTMLInputElement>('#cat-search-input');
    searchInput?.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value;
      render();
    });

    // Filters
    const distFilter = container.querySelector<HTMLSelectElement>('#cat-distributor-filter');
    distFilter?.addEventListener('change', (e) => {
      selectedDistributorFilter = (e.target as HTMLSelectElement).value;
      render();
    });

    const schemeFilter = container.querySelector<HTMLSelectElement>('#cat-scheme-filter');
    schemeFilter?.addEventListener('change', (e) => {
      selectedSchemeFilter = (e.target as HTMLSelectElement).value;
      render();
    });

    const catFilter = container.querySelector<HTMLSelectElement>('#cat-category-filter');
    catFilter?.addEventListener('change', (e) => {
      selectedCategoryFilter = (e.target as HTMLSelectElement).value;
      render();
    });

    // Add to Basket button in Screen 1
    container.querySelectorAll('.btn-add-to-basket').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prodId = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const prod = catalogProducts.find(p => p.id === prodId);
        if (prod) {
          BasketStore.addItem({
            sku: prod.sku,
            brandName: prod.brandName,
            genericSalt: prod.genericSalt,
            category: prod.category,
            packSize: prod.packSize,
            qty: 1,
            ptr: prod.ptr,
            gstPct: prod.gstPct,
            schemeText: prod.schemeText,
            distributorId: prod.distributorId,
            distributorName: prod.distributorName,
            distributorPhone: prod.distributorPhone,
            movAmount: prod.movAmount,
            creditAvailable: prod.creditAvailable,
          });
          NotificationEngine.showToast(`🛒 ${prod.brandName} added to basket!`, 'success');
          render();
        }
      });
    });

    // Quantity modify button in basket
    container.querySelectorAll('.btn-qty-mod').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cartId = (e.currentTarget as HTMLElement).getAttribute('data-cart-id');
        const delta = parseInt((e.currentTarget as HTMLElement).getAttribute('data-delta') || '0', 10);
        if (cartId) {
          BasketStore.modifyQty(cartId, delta);
          render();
        }
      });
    });

    // Delete item from basket (trash bin icon)
    container.querySelectorAll('.btn-delete-cart-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cartId = (e.currentTarget as HTMLElement).getAttribute('data-cart-id');
        if (cartId) {
          BasketStore.removeItem(cartId);
          NotificationEngine.showToast(`🗑️ Item removed from basket`, 'info');
          render();
        }
      });
    });

    // WhatsApp Share Button
    container.querySelector('#btn-share-whatsapp')?.addEventListener('click', () => {
      shareOrderViaWhatsApp(distributorGroups, grandTotal);
    });

    // Confirm & Place All Orders button
    container.querySelector('#btn-confirm-all-orders')?.addEventListener('click', () => {
      openOrderConfirmationModal(distributorGroups, grandTotal);
    });
  }

  function openOrderConfirmationModal(
    distributorGroups: Array<{
      distributorId: string;
      distributorName: string;
      distributorPhone: string;
      movAmount: number;
      creditAvailable: number;
      items: BasketItem[];
    }>,
    grandTotal: number
  ): void {
    const modalContainer = container.querySelector('#cart-modal-container');
    if (!modalContainer) return;
    const targetModal = modalContainer as HTMLElement;

    targetModal.innerHTML = `
      <div class="rx-modal-overlay" id="modal-overlay">
        <div class="rx-modal-box no-scrollbar" style="max-width:640px; width:95%;">
          <div class="rx-modal-header">
            <div class="rx-modal-title" style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:24px;">📋</span> Confirm & Place Multi-Distributor Orders
            </div>
            <button class="rx-modal-close" id="modal-close">✕</button>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">
            Please review your order split across <strong>${distributorGroups.length} Distributors</strong> before submitting.
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto; margin-bottom:16px; padding-right:2px;">
            ${distributorGroups.map((g, idx) => {
              const subtotal = g.items.reduce((s, i) => s + (i.qty * i.ptr), 0);
              const gst = g.items.reduce((s, i) => s + (i.qty * i.ptr * (i.gstPct / 100)), 0);
              const total = subtotal + gst + TRANSPORT_FEE_PER_DISTRIBUTOR;

              return `
                <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <strong style="color:var(--tile-blue); font-size:13px;">${idx + 1}. ${g.distributorName}</strong>
                    <span style="font-size:13px; font-weight:900; color:#34D399;">₹${total.toFixed(2)}</span>
                  </div>
                  <div style="font-size:11px; color:var(--text-secondary);">
                    ${g.items.length} SKUs (${g.items.reduce((s, i) => s + i.qty, 0)} Units) • Transport Fee: ₹${TRANSPORT_FEE_PER_DISTRIBUTOR.toFixed(2)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="font-size:12px; font-weight:800; color:white;">Grand Total Payable:</div>
            <div style="font-size:22px; font-weight:900; color:#34D399;">₹${grandTotal.toFixed(2)}</div>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="action-btn action-btn--success" id="btn-submit-order-confirmed" style="flex:1; padding:12px; font-size:14px; font-weight:800;">
              ✅ Confirm & Submit Orders
            </button>
            <button class="action-btn action-btn--outline" id="modal-close-confirm" style="padding:12px 18px;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    targetModal.querySelector('#btn-submit-order-confirmed')?.addEventListener('click', async () => {
      for (const group of distributorGroups) {
        const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const subtotal = group.items.reduce((s, i) => s + (i.qty * i.ptr), 0);
        const gst = group.items.reduce((s, i) => s + (i.qty * i.ptr * (i.gstPct / 100)), 0);
        const total = subtotal + gst + TRANSPORT_FEE_PER_DISTRIBUTOR;

        await SyncOrchestrator.queueMutation('orders', 'INSERT', {
          order_number: orderNumber,
          distributor_id: group.distributorId,
          status: 'submitted',
          total_amount: total,
          created_at: new Date().toISOString(),
        });

        NotificationEngine.showToast(`⚡ Order #${orderNumber} submitted to ${group.distributorName}!`, 'success');
      }

      targetModal.innerHTML = '';
      BasketStore.clearBasket(); // Clear basket after placement
      navigate('#/retailer/orders');
    });

    targetModal.querySelector('#modal-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#modal-close-confirm')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
  }

  function shareOrderViaWhatsApp(
    distributorGroups: Array<{
      distributorId: string;
      distributorName: string;
      distributorPhone: string;
      movAmount: number;
      creditAvailable: number;
      items: BasketItem[];
    }>,
    grandTotal: number
  ): void {
    if (distributorGroups.length === 0) {
      NotificationEngine.showToast('Your basket is empty. Add products before sharing!', 'warning');
      return;
    }

    let messageText = `📦 *RXFLOW MULTI-DISTRIBUTOR ORDER BREAKDOWN*\n\n`;

    distributorGroups.forEach((g, idx) => {
      const subtotal = g.items.reduce((s, i) => s + (i.qty * i.ptr), 0);
      const gst = g.items.reduce((s, i) => s + (i.qty * i.ptr * (i.gstPct / 100)), 0);
      const total = subtotal + gst + TRANSPORT_FEE_PER_DISTRIBUTOR;

      messageText += `🏢 *${idx + 1}. ${g.distributorName}*\n`;
      g.items.forEach(i => {
        messageText += `  • ${i.brandName} (${i.packSize}) x ${i.qty} Packs @ PTR ₹${i.ptr.toFixed(2)} (GST ${i.gstPct}%)\n`;
      });
      messageText += `  💰 Subtotal: ₹${subtotal.toFixed(2)} + GST: ₹${gst.toFixed(2)} + Transport: ₹${TRANSPORT_FEE_PER_DISTRIBUTOR.toFixed(2)}\n`;
      messageText += `  💵 Sub-order Total: *₹${total.toFixed(2)}*\n\n`;
    });

    messageText += `---------------------------------\n`;
    messageText += `💰 *GRAND TOTAL: ₹${grandTotal.toFixed(2)}*\n\n`;
    messageText += `Sent via RxFlow PWA Basket`;

    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    NotificationEngine.showToast('📱 WhatsApp order summary opened!', 'success');
  }

  render();
}


