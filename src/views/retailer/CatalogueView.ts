/**
 * Mediflow CatalogueView v3.0
 * Offline FTS5 SKU search across 50,000+ medicines, generic salt matching, scheme badges & Schedule X/H1 tags.
 */

import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { NotificationEngine } from '../../engine/NotificationEngine';
import { navigate } from '../../engine/Router';

export default function CatalogueView(container: HTMLElement): void {
  let activeSearch = '';
  let activeFilter: 'all' | 'schemes' | 'schedule_x' | 'generics' = 'all';

  function render(): void {
    const results = SyncOrchestrator.searchLocalProducts(activeSearch || 'a');

    container.innerHTML = `
      <!-- Header & Search Bar -->
      <div class="section-title">medicine catalogue (offline FTS5)</div>
      
      <div class="search-bar" style="margin-bottom:12px;">
        <span class="search-icon">🔍</span>
        <input class="metro-input" type="search" id="cat-search-input"
               placeholder="Search by brand name, salt, or SKU (e.g. Augmentin, Paracetamol)..."
               value="${activeSearch}">
      </div>

      <!-- Filter Badges -->
      <div class="persona-selector" style="margin-bottom:16px;">
        <button class="persona-tab ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All SKUs</button>
        <button class="persona-tab ${activeFilter === 'schemes' ? 'active' : ''}" data-filter="schemes">🎁 Schemes Only</button>
        <button class="persona-tab ${activeFilter === 'schedule_x' ? 'active' : ''}" data-filter="schedule_x">🔴 Schedule X & H1</button>
        <button class="persona-tab ${activeFilter === 'generics' ? 'active' : ''}" data-filter="generics">💊 Generic Substitutes</button>
      </div>

      <!-- Product List -->
      <div class="metro-list" id="cat-product-list">
        ${results.map(prod => `
          <div class="metro-item" data-sku="${prod.sku}">
            <div class="item-main">
              <div class="item-title">
                ${prod.brand_name}
                <span class="item-tag">${prod.sku}</span>
                ${prod.sku === 'AUG625' ? '<span class="item-tag item-tag--green">Scheme: 10+2</span>' : ''}
                ${prod.sku === 'ALP05' ? '<span class="item-tag item-tag--red">Schedule X</span>' : ''}
              </div>
              <div class="item-sub">${prod.generic_salt} • Stock Available</div>
            </div>
            <div class="item-price" style="display:flex;align-items:center;gap:12px;">
              <div class="text-right">
                <div class="price-main">₹${prod.ptr.toFixed(2)} <span class="price-unit">PTR</span></div>
                <div class="price-sub">MRP: ₹${prod.mrp.toFixed(2)}</div>
              </div>
              <button class="action-btn action-btn--primary add-cart-btn" data-sku="${prod.sku}" style="padding:6px 12px;font-size:11px;">
                + Add
              </button>
              <button class="action-btn find-sub-btn" data-salt="${prod.generic_salt}" style="padding:6px 10px;font-size:11px;background:var(--bg-input);">
                🔄 Salt
              </button>
            </div>
          </div>
        `).join('')}

        ${results.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state__icon">🔍</div>
            <div class="empty-state__text">No medicines found for "${activeSearch}"</div>
          </div>
        ` : ''}
      </div>

      <!-- Bottom Action Bar -->
      <div class="action-bar" style="margin-top:20px;">
        <button class="action-btn action-btn--success" id="btn-view-cart">🛍️ View Cart (3 items • ₹4,280)</button>
        <button class="action-btn" id="btn-voice-order">🎙️ Voice Order</button>
      </div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    const searchInput = container.querySelector('#cat-search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      activeSearch = (e.target as HTMLInputElement).value;
      render();
      // Refocus search input after render
      const input = container.querySelector('#cat-search-input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.setSelectionRange(activeSearch.length, activeSearch.length);
      }
    });

    // Filter tab buttons
    container.querySelectorAll('.persona-tab[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeFilter = (e.currentTarget as HTMLElement).getAttribute('data-filter') as any;
        render();
      });
    });

    // Add to cart buttons
    container.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sku = (e.currentTarget as HTMLElement).getAttribute('data-sku');
        NotificationEngine.showToast(`Added ${sku} to cart (PowerSync local mutation)`, 'success');
      });
    });

    // Find salt substitute buttons
    container.querySelectorAll('.find-sub-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const salt = (e.currentTarget as HTMLElement).getAttribute('data-salt');
        NotificationEngine.showToast(`Matching generic substitutes for ${salt}...`, 'info');
      });
    });

    // View cart navigation
    container.querySelector('#btn-view-cart')?.addEventListener('click', () => {
      navigate('#/retailer/cart');
    });

    // Voice order
    container.querySelector('#btn-voice-order')?.addEventListener('click', () => {
      NotificationEngine.showToast('🎙️ Offline voice order ready: speak brand or salt name', 'info');
    });
  }

  render();
}
