/**
 * Mediflow CatalogueView v3.0
 * Features:
 * - Market Buzz & Pharma Deals Marketing Dashboard (Flash banners, live chemist stats)
 * - Working Button Row Filters (All SKUs, Schemes Only, Schedule X & H1, Generic Substitutes)
 * - Rich Product Cards: Brand + Distributor + Manufacturer + Salt + Schemes
 * - Product Detail Modal Window: Image Ad Banners, Scheme slabs, Therapeutic Benefits, Schedule Warnings
 */

import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { NotificationEngine } from '../../engine/NotificationEngine';
import { navigate } from '../../engine/Router';
import { BasketStore } from '../../store/BasketStore';

export interface CatalogItem {
  id: string;
  sku: string;
  brandName: string;
  genericSalt: string;
  manufacturer: string;
  distributorName: string;
  distributorPhone: string;
  packSize: string;
  ptr: number;
  mrp: number;
  gstPct: number;
  schemeTag?: string;
  schemeDetails?: string;
  scheduleCategory: 'OTC' | 'Schedule H' | 'Schedule H1' | 'Schedule X';
  isGeneric: boolean;
  benefits: string;
  dosageForm: string;
  promoColorGradient: string;
  bannerTagline: string;
}

export default function CatalogueView(container: HTMLElement): void {
  const masterCatalog: CatalogItem[] = [
    {
      id: 'cat-001',
      sku: 'AUG625',
      brandName: 'Augmentin 625 Duo Tablet',
      genericSalt: 'Amoxycillin 500mg + Clavulanic Acid 125mg',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals (GSK)',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      packSize: '10x10 Strips',
      ptr: 142.50,
      mrp: 201.00,
      gstPct: 12,
      schemeTag: 'Buy 10 Get 2 Free',
      schemeDetails: '🎁 Buy 10 Boxes Get 2 Boxes Free + Extra 2% Cash Discount on UPI Pay',
      scheduleCategory: 'Schedule H1',
      isGeneric: false,
      benefits: 'Broad-spectrum antibiotic indicated for severe respiratory tract, sinus, UTI, and skin soft tissue bacterial infections.',
      dosageForm: 'Film-coated Tablets (Strip of 10)',
      promoColorGradient: 'linear-gradient(135deg, #0078D7, #00B7C3)',
      bannerTagline: '🔥 #1 Antibiotic Choice for Respiratory Care',
    },
    {
      id: 'cat-002',
      sku: 'SKU-B1',
      brandName: 'Calpol 650 Tablet',
      genericSalt: 'Paracetamol 650mg Antipyretic',
      manufacturer: 'GlaxoSmithKline Pharmaceuticals (GSK)',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      packSize: '15x10 Strips',
      ptr: 33.60,
      mrp: 48.00,
      gstPct: 12,
      schemeTag: 'Flat 15% Margin Bonus',
      schemeDetails: '🎁 15% Special Retailer Margin Slab on Bulk Stockist Order (> 50 Boxes)',
      scheduleCategory: 'OTC',
      isGeneric: false,
      benefits: 'Fast-acting analgesic and antipyretic for high fever, viral infections, and acute body aches.',
      dosageForm: 'Oral Uncoated Tablets',
      promoColorGradient: 'linear-gradient(135deg, #EF4444, #F59E0B)',
      bannerTagline: '⚡ Fast Fever Relief — Trusted by 50,000+ Doctors',
    },
    {
      id: 'cat-003',
      sku: 'PAND',
      brandName: 'Pan-D Capsule',
      genericSalt: 'Pantoprazole 40mg + Domperidone 30mg',
      manufacturer: 'Alkem Laboratories Ltd',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      packSize: '10x10 Capsules',
      ptr: 88.00,
      mrp: 125.00,
      gstPct: 12,
      schemeTag: 'Buy 12 Get 2 Free',
      schemeDetails: '🎁 Buy 12 Boxes Get 2 Boxes Free',
      scheduleCategory: 'Schedule H',
      isGeneric: false,
      benefits: 'Sustained release proton pump inhibitor for GERD, hyperacidity, peptic ulcer disease, and heartburn relief.',
      dosageForm: 'Hard Gelatin Capsules',
      promoColorGradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
      bannerTagline: '🛡️ 24-Hour Complete Acid Reflux Guard',
    },
    {
      id: 'cat-004',
      sku: 'DOLO650',
      brandName: 'Dolo 650 Tablet',
      genericSalt: 'Paracetamol 650mg',
      manufacturer: 'Micro Labs Ltd',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      packSize: '15x10 Strips',
      ptr: 26.80,
      mrp: 35.00,
      gstPct: 12,
      schemeTag: '₹2 Off per box',
      schemeDetails: '🎁 ₹2 Flat Instant Cash Discount per box from Stockist',
      scheduleCategory: 'OTC',
      isGeneric: false,
      benefits: 'India’s most prescribed fever reliever for influenza, Dengue, and post-vaccination fever.',
      dosageForm: 'Oral Uncoated Tablets',
      promoColorGradient: 'linear-gradient(135deg, #10B981, #059669)',
      bannerTagline: '🇮🇳 India’s #1 Fever Specialist Brand',
    },
    {
      id: 'cat-005',
      sku: 'SKU-B4',
      brandName: 'Alprax 0.5mg Tablet',
      genericSalt: 'Alprazolam 0.5mg Anxiolytic',
      manufacturer: 'Torrent Pharmaceuticals Ltd',
      distributorName: 'Distributor D3 (Stockist)',
      distributorPhone: '+91 98230 20003',
      packSize: '10x10 Strips',
      ptr: 50.40,
      mrp: 72.00,
      gstPct: 18,
      schemeTag: 'Clearance 15% Off',
      schemeDetails: '🎁 Clearance Scheme: Extra 15% Discount on Stockist Orders',
      scheduleCategory: 'Schedule X',
      isGeneric: false,
      benefits: 'Short-acting benzodiazepine for acute anxiety disorders and panic attacks. Mandatory Schedule X Register Log required.',
      dosageForm: 'Sublingual Tablets',
      promoColorGradient: 'linear-gradient(135deg, #DC2626, #991B1B)',
      bannerTagline: '🔴 Schedule X Controlled Rx Prescription Drug',
    },
    {
      id: 'cat-006',
      sku: 'AZITH500',
      brandName: 'Azithral 500 Tablet',
      genericSalt: 'Azithromycin 500mg Antibiotic',
      manufacturer: 'Alembic Pharmaceuticals Ltd',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      packSize: '1x5 Strips',
      ptr: 115.00,
      mrp: 156.00,
      gstPct: 12,
      schemeTag: 'Buy 10 Get 1 Free',
      schemeDetails: '🎁 Buy 10 Packs Get 1 Pack Free',
      scheduleCategory: 'Schedule H',
      isGeneric: false,
      benefits: '3-Day single daily dose antibiotic course for Typhoid, Bronchitis, and Pharyngitis.',
      dosageForm: 'Film-coated Tablets',
      promoColorGradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
      bannerTagline: '⚡ 3-Day Express Antibiotic Therapy',
    },
    {
      id: 'cat-007',
      sku: 'MONTEK-KID',
      brandName: 'Montek LC Kid Syrup',
      genericSalt: 'Montelukast 4mg + Levocetirizine 2.5mg',
      manufacturer: 'Sun Pharmaceutical Industries',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      packSize: '60ml Bottle',
      ptr: 65.00,
      mrp: 92.00,
      gstPct: 12,
      schemeTag: 'New Launch: 10+2 Free',
      schemeDetails: '🎉 New Launch Promo: Buy 10 Bottles Get 2 Bottles Free',
      scheduleCategory: 'Schedule H',
      isGeneric: false,
      benefits: 'Pediatric oral suspension for allergic rhinitis, asthma prevention, and seasonal sneezing.',
      dosageForm: 'Delicious Mango Flavored Syrup (60ml)',
      promoColorGradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      bannerTagline: '🎉 New Pediatric Launch Special',
    },
    {
      id: 'cat-008',
      sku: 'GEN-PARA650',
      brandName: 'ParaPlus 650 Generic',
      genericSalt: 'Paracetamol 650mg Antipyretic',
      manufacturer: 'Jan Aushadhi Generic Labs',
      distributorName: 'Shrine Pharma Stockist',
      distributorPhone: '+91 98220 12345',
      packSize: '10x10 Strips',
      ptr: 14.00,
      mrp: 22.00,
      gstPct: 12,
      schemeTag: 'High Margin 45%',
      schemeDetails: '🏷️ High Margin Generic Substitute — 45% Direct Chemist Profit',
      scheduleCategory: 'OTC',
      isGeneric: true,
      benefits: 'Bioequivalent generic paracetamol substitute for Calpol & Dolo with high profit margin.',
      dosageForm: 'Oral Tablets',
      promoColorGradient: 'linear-gradient(135deg, #059669, #047857)',
      bannerTagline: '💰 High Profit Chemist Generic Choice',
    },
    {
      id: 'cat-009',
      sku: 'GEN-AMX625',
      brandName: 'AmoxyClav 625 Generic',
      genericSalt: 'Amoxycillin 500mg + Clavulanic Acid 125mg',
      manufacturer: 'Generic Pharma India',
      distributorName: 'Medico Distributors (Pune)',
      distributorPhone: '+91 98230 20002',
      packSize: '10x10 Strips',
      ptr: 65.00,
      mrp: 98.00,
      gstPct: 12,
      schemeTag: 'High Margin 50%',
      schemeDetails: '🏷️ 50% High Margin Generic Substitute for Augmentin 625',
      scheduleCategory: 'Schedule H1',
      isGeneric: true,
      benefits: 'Bioequivalent generic antibiotic formulation offering 50% retailer profit margins.',
      dosageForm: 'Strip of 10 Tablets',
      promoColorGradient: 'linear-gradient(135deg, #4F46E5, #4338CA)',
      bannerTagline: '🏷️ Bioequivalent High Margin Substitute',
    },
  ];

  let activeSearch = '';
  let activeFilter: 'all' | 'schemes' | 'schedule_x' | 'generics' = 'all';

  function render(): void {
    // FILTER LOGIC
    const filteredProducts = masterCatalog.filter(prod => {
      // Button Row Filter Check
      if (activeFilter === 'schemes' && !prod.schemeTag) return false;
      if (activeFilter === 'schedule_x' && (prod.scheduleCategory !== 'Schedule X' && prod.scheduleCategory !== 'Schedule H1')) return false;
      if (activeFilter === 'generics' && !prod.isGeneric) return false;

      // Text Search Check
      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        const match =
          prod.brandName.toLowerCase().includes(q) ||
          prod.genericSalt.toLowerCase().includes(q) ||
          prod.manufacturer.toLowerCase().includes(q) ||
          prod.distributorName.toLowerCase().includes(q) ||
          prod.sku.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    container.innerHTML = `
      <!-- ====================================================================== -->
      <!-- MARKET BUZZ & PHARMA DEALS MARKETING DASHBOARD -->
      <!-- ====================================================================== -->
      <div style="background:linear-gradient(135deg, #0F172A, #1E293B); border:1px solid var(--border-subtle); border-radius:12px; padding:16px; margin-bottom:16px;">
        
        <!-- Live Ticker Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:12px;">
          <div style="font-size:13px; font-weight:800; color:#34D399; display:flex; align-items:center; gap:8px;">
            <span class="status-ping" style="display:inline-block; width:8px; height:8px; background:#34D399; border-radius:50%;"></span>
            🔥 MARKET BUZZ LIVE: <span style="color:white; font-weight:600;">1,420 Chemists Ordering in Maharashtra Right Now!</span>
          </div>
          <span style="font-size:10px; font-weight:800; color:var(--tile-cyan); background:rgba(0,183,195,0.15); border:1px solid rgba(0,183,195,0.3); padding:2px 8px; border-radius:4px;">
            ⚡ 48 Active Schemes Available
          </span>
        </div>

        <!-- Marketing Flash Deal Cards Carousel -->
        <div class="no-scrollbar" style="display:flex; gap:12px; overflow-x:auto; padding-bottom:4px;">
          
          <!-- Promo Flash Card 1 -->
          <div class="btn-deal-card" data-sku="AUG625" style="min-width:240px; background:linear-gradient(135deg, rgba(0,120,215,0.4), rgba(0,183,195,0.2)); border:1px solid #0078D7; border-radius:8px; padding:12px; cursor:pointer;">
            <div style="font-size:10px; font-weight:900; color:#60A5FA; text-transform:uppercase;">🔥 FLASH DEAL OF THE DAY</div>
            <div style="font-size:14px; font-weight:800; color:white; margin-top:2px;">Augmentin 625 Duo</div>
            <div style="font-size:11px; color:#34D399; font-weight:700; margin-top:2px;">Buy 10 Get 2 Free + 2% Cash Disc</div>
            <div style="font-size:10px; color:var(--text-secondary); margin-top:4px;">GlaxoSmithKline • Stockist: Shrine Pharma</div>
          </div>

          <!-- Promo Flash Card 2 -->
          <div class="btn-deal-card" data-sku="GEN-AMX625" style="min-width:240px; background:linear-gradient(135deg, rgba(16,185,129,0.4), rgba(5,150,105,0.2)); border:1px solid #10B981; border-radius:8px; padding:12px; cursor:pointer;">
            <div style="font-size:10px; font-weight:900; color:#34D399; text-transform:uppercase;">💰 HIGH MARGIN GENERIC</div>
            <div style="font-size:14px; font-weight:800; color:white; margin-top:2px;">AmoxyClav 625 Generic</div>
            <div style="font-size:11px; color:#A7F3D0; font-weight:700; margin-top:2px;">🏷️ 50% Profit Margin (PTR ₹65)</div>
            <div style="font-size:10px; color:var(--text-secondary); margin-top:4px;">Generic Pharma Labs • Medico Stockist</div>
          </div>

          <!-- Promo Flash Card 3 -->
          <div class="btn-deal-card" data-sku="MONTEK-KID" style="min-width:240px; background:linear-gradient(135deg, rgba(245,158,11,0.4), rgba(217,119,6,0.2)); border:1px solid #F59E0B; border-radius:8px; padding:12px; cursor:pointer;">
            <div style="font-size:10px; font-weight:900; color:#FBBF24; text-transform:uppercase;">🎉 NEW PEDIATRIC LAUNCH</div>
            <div style="font-size:14px; font-weight:800; color:white; margin-top:2px;">Montek LC Kid Syrup</div>
            <div style="font-size:11px; color:#FDE68A; font-weight:700; margin-top:2px;">Launch Special: 10+2 Free</div>
            <div style="font-size:10px; color:var(--text-secondary); margin-top:4px;">Sun Pharma • Shrine Pharma Stockist</div>
          </div>

        </div>
      </div>

      <!-- ====================================================================== -->
      <!-- SEARCH & BUTTON ROW FILTERS -->
      <!-- ====================================================================== -->
      <div class="section-title">medicine catalogue (offline FTS5)</div>
      
      <!-- Search Input -->
      <div class="search-bar" style="margin-bottom:12px;">
        <span class="search-icon">🔍</span>
        <input class="metro-input" type="search" id="cat-search-input"
               placeholder="Search by brand name, salt, manufacturer, or distributor..."
               value="${activeSearch}">
      </div>

      <!-- Working Filter Buttons Row -->
      <div class="persona-selector" style="margin-bottom:16px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="persona-tab ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
          🌐 All SKUs (${masterCatalog.length})
        </button>
        <button class="persona-tab ${activeFilter === 'schemes' ? 'active' : ''}" data-filter="schemes">
          🎁 Schemes Only (${masterCatalog.filter(i => i.schemeTag).length})
        </button>
        <button class="persona-tab ${activeFilter === 'schedule_x' ? 'active' : ''}" data-filter="schedule_x">
          🔴 Schedule X & H1 (${masterCatalog.filter(i => i.scheduleCategory === 'Schedule X' || i.scheduleCategory === 'Schedule H1').length})
        </button>
        <button class="persona-tab ${activeFilter === 'generics' ? 'active' : ''}" data-filter="generics">
          💊 Generic Substitutes (${masterCatalog.filter(i => i.isGeneric).length})
        </button>
      </div>

      <!-- ====================================================================== -->
      <!-- PRODUCT CATALOG LIST WITH BRAND + MANUFACTURER + DISTRIBUTOR -->
      <!-- ====================================================================== -->
      <div class="metro-list" id="cat-product-list">
        ${filteredProducts.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">🔍</div>
            <div class="empty-state__text">No medicines found matching your selected filters.</div>
          </div>
        ` : filteredProducts.map(prod => `
          <div class="metro-item btn-open-product-modal" data-sku="${prod.sku}" style="cursor:pointer; border-left:4px solid ${prod.isGeneric ? '#10B981' : (prod.scheduleCategory === 'Schedule X' ? '#EF4444' : 'var(--tile-blue)')}; padding:14px;">
            
            <div class="item-main">
              <!-- Title Bar: Brand + Tags -->
              <div class="item-title" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span style="font-size:15px; font-weight:800; color:white;">${prod.brandName}</span>
                <span class="item-tag" style="background:rgba(255,255,255,0.1); color:#93C5FD;">${prod.packSize}</span>
                
                ${prod.schemeTag ? `<span class="item-tag item-tag--green">🎁 ${prod.schemeTag}</span>` : ''}
                ${prod.scheduleCategory === 'Schedule X' ? '<span class="item-tag item-tag--red">🔴 Schedule X</span>' : ''}
                ${prod.scheduleCategory === 'Schedule H1' ? '<span class="item-tag" style="background:rgba(239,68,68,0.2); color:#F87171;">⚠️ Schedule H1</span>' : ''}
                ${prod.isGeneric ? '<span class="item-tag" style="background:rgba(16,185,129,0.2); color:#34D399;">🏷️ Generic Profit</span>' : ''}
              </div>

              <!-- Sub-line 1: Salt Info -->
              <div class="item-sub" style="margin-top:3px; color:#E2E8F0; font-size:12px;">
                Salt: <strong>${prod.genericSalt}</strong>
              </div>

              <!-- Sub-line 2: Manufacturer & Distributor -->
              <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                Mfg: <strong style="color:white;">${prod.manufacturer}</strong> • Stockist: <strong style="color:var(--tile-cyan);">${prod.distributorName}</strong>
              </div>
            </div>

            <!-- Price & Actions -->
            <div class="item-price" style="display:flex; align-items:center; gap:10px;">
              <div class="text-right">
                <div class="price-main" style="font-size:16px; font-weight:900; color:#34D399;">
                  ₹${prod.ptr.toFixed(2)} <span class="price-unit" style="font-size:10px;">PTR</span>
                </div>
                <div class="price-sub" style="font-size:10px; color:var(--text-secondary);">MRP: ₹${prod.mrp.toFixed(2)}</div>
              </div>

              <button class="action-btn action-btn--primary add-basket-btn" data-sku="${prod.sku}" style="padding:8px 14px; font-size:12px; font-weight:800;">
                + Add to Basket
              </button>

              <button class="action-btn btn-open-detail-view" data-sku="${prod.sku}" style="padding:8px 10px; font-size:11px; background:var(--bg-input); border:1px solid var(--border-subtle); color:white;">
                ℹ️ Details
              </button>
            </div>

          </div>
        `).join('')}
      </div>

      <!-- Bottom Action Bar -->
      <div class="action-bar" style="margin-top:20px;">
        <button class="action-btn action-btn--success" id="btn-view-basket" style="padding:14px; font-weight:900;">
          🛍️ View Smart Basket & Split Checkout (${BasketStore.getTotalCount()} Items)
        </button>
      </div>

      <!-- Product Detail Modal Container -->
      <div id="product-detail-modal-container"></div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    // Search input FTS
    const searchInput = container.querySelector('#cat-search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      activeSearch = (e.target as HTMLInputElement).value;
      render();
      const input = container.querySelector('#cat-search-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(activeSearch.length, activeSearch.length);
      }
    });

    // Working Filter Buttons Row
    container.querySelectorAll('.persona-tab[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeFilter = (e.currentTarget as HTMLElement).getAttribute('data-filter') as any;
        render();
      });
    });

    // Flash Deal Cards click
    container.querySelectorAll('.btn-deal-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const sku = (e.currentTarget as HTMLElement).getAttribute('data-sku');
        const prod = masterCatalog.find(p => p.sku === sku);
        if (prod) openProductDetailModal(prod);
      });
    });

    // Add to basket buttons
    container.querySelectorAll('.add-basket-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent opening modal
        const sku = (e.currentTarget as HTMLElement).getAttribute('data-sku');
        const prod = masterCatalog.find(p => p.sku === sku);
        if (prod) {
          BasketStore.addItem({
            sku: prod.sku,
            brandName: prod.brandName,
            genericSalt: prod.genericSalt,
            category: prod.scheduleCategory,
            packSize: prod.packSize,
            qty: 1,
            ptr: prod.ptr,
            gstPct: prod.gstPct,
            schemeText: prod.schemeTag,
            distributorName: prod.distributorName,
            distributorPhone: prod.distributorPhone
          });
          NotificationEngine.showToast(`🛒 Added ${prod.brandName} to basket!`, 'success');
          render();
        }
      });
    });

    // Details button or clicking product row opens Product Detail Modal
    container.querySelectorAll('.btn-open-product-modal').forEach(row => {
      row.addEventListener('click', (e) => {
        // Only trigger if click wasn't on + Add button
        if ((e.target as HTMLElement).classList.contains('add-basket-btn')) return;
        const sku = (e.currentTarget as HTMLElement).getAttribute('data-sku');
        const prod = masterCatalog.find(p => p.sku === sku);
        if (prod) openProductDetailModal(prod);
      });
    });

    // View basket button
    container.querySelector('#btn-view-basket')?.addEventListener('click', () => {
      navigate('#/retailer/cart');
    });
  }

  // ======================================================================
  // PRODUCT DETAIL MODAL WINDOW (Image Ad, Schemes, Schedule Warning, Benefits)
  // ======================================================================
  function openProductDetailModal(prod: CatalogItem): void {
    const modalContainer = container.querySelector('#product-detail-modal-container');
    if (!modalContainer) return;
    const targetModal = modalContainer as HTMLElement;

    targetModal.innerHTML = `
      <div class="rx-modal-overlay" id="prod-modal-overlay">
        <div class="rx-modal-box no-scrollbar" style="max-width:650px; width:95%;">
          
          <!-- Modal Header -->
          <div class="rx-modal-header">
            <div class="rx-modal-title" style="display:flex; align-items:center; gap:8px;">
              <span>💊</span> ${prod.brandName}
            </div>
            <button class="rx-modal-close" id="prod-modal-close">✕</button>
          </div>

          <!-- Promotional Visual Banner / Image Ad -->
          <div style="background:${prod.promoColorGradient}; border-radius:10px; padding:20px; color:white; margin-bottom:16px; position:relative; overflow:hidden;">
            <div style="font-size:11px; font-weight:900; letter-spacing:1px; opacity:0.8;">OFFICIAL PHARMA BRAND DETAIL</div>
            <div style="font-size:22px; font-weight:900; margin-top:4px;">${prod.brandName}</div>
            <div style="font-size:13px; font-weight:700; margin-top:2px;">${prod.bannerTagline}</div>
            
            <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
              <span style="background:rgba(255,255,255,0.2); padding:3px 8px; border-radius:4px; font-size:11px; font-weight:800;">
                ${prod.packSize}
              </span>
              ${prod.schemeTag ? `
                <span style="background:rgba(16,185,129,0.3); border:1px solid #34D399; color:#A7F3D0; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:800;">
                  🎁 ${prod.schemeTag}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Specifications Grid -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            
            <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:12px;">
              <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:var(--tile-cyan);">MANUFACTURER</div>
              <div style="font-size:13px; font-weight:800; color:white; margin-top:2px;">${prod.manufacturer}</div>
            </div>

            <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:12px;">
              <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:var(--tile-cyan);">AUTHORISED STOCKIST / DISTRIBUTOR</div>
              <div style="font-size:13px; font-weight:800; color:white; margin-top:2px;">${prod.distributorName}</div>
            </div>

          </div>

          <!-- Salt & Therapeutic Benefits -->
          <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:14px; margin-bottom:16px;">
            <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--tile-cyan); margin-bottom:4px;">
              GENERIC SALT COMPOSITION
            </div>
            <div style="font-size:14px; font-weight:800; color:white; margin-bottom:8px;">${prod.genericSalt}</div>
            
            <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--tile-cyan); margin-bottom:4px;">
              THERAPEUTIC INDICATIONS & CLINICAL BENEFITS
            </div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${prod.benefits}</div>
          </div>

          <!-- Active Schemes & Schedule Warning -->
          <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:12px; margin-bottom:16px;">
            
            <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); border-radius:8px; padding:12px;">
              <div style="font-size:11px; font-weight:800; color:#34D399; text-transform:uppercase;">ACTIVE SCHEME & DISCOUNTS</div>
              <div style="font-size:12px; font-weight:800; color:white; margin-top:4px;">
                ${prod.schemeDetails || 'No special scheme tag on single box order.'}
              </div>
            </div>

            <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); border-radius:8px; padding:12px;">
              <div style="font-size:11px; font-weight:800; color:#F87171; text-transform:uppercase;">REGULATORY SCHEDULE</div>
              <div style="font-size:12px; font-weight:800; color:white; margin-top:4px;">${prod.scheduleCategory}</div>
              <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">To be sold by retail on Rx of RMP only</div>
            </div>

          </div>

          <!-- Pricing & Action Bar -->
          <div style="background:rgba(0,0,0,0.3); border:1px solid var(--border-subtle); border-radius:8px; padding:14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:11px; color:var(--text-secondary);">PTR Price: <strong style="color:white;">₹${prod.ptr.toFixed(2)}</strong> + GST ${prod.gstPct}%</div>
              <div style="font-size:18px; font-weight:900; color:#34D399; margin-top:2px;">MRP: ₹${prod.mrp.toFixed(2)}</div>
            </div>

            <button class="action-btn action-btn--success" id="btn-modal-add-to-basket" style="padding:12px 24px; font-size:13px; font-weight:900;">
              🛒 Add to Smart Basket
            </button>
          </div>

        </div>
      </div>
    `;

    targetModal.querySelector('#btn-modal-add-to-basket')?.addEventListener('click', () => {
      BasketStore.addItem({
        sku: prod.sku,
        brandName: prod.brandName,
        genericSalt: prod.genericSalt,
        category: prod.scheduleCategory,
        packSize: prod.packSize,
        qty: 1,
        ptr: prod.ptr,
        gstPct: prod.gstPct,
        schemeText: prod.schemeTag,
        distributorName: prod.distributorName,
        distributorPhone: prod.distributorPhone
      });
      NotificationEngine.showToast(`🛒 Added ${prod.brandName} to Smart Basket!`, 'success');
      targetModal.innerHTML = '';
      render();
      navigate('#/retailer/cart');
    });

    targetModal.querySelector('#prod-modal-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#prod-modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
  }

  render();
}
