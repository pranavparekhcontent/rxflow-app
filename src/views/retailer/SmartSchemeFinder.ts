/**
 * RxFlow SmartSchemeFinder v3.0
 * Features:
 * - Multicolor Metro Live Tile Layout (Vibrant Blue, Emerald, Purple, Amber, Pink, Cyan)
 * - '🛒 ADD TO BASKET' button replacing old 'APPLY DEAL'
 * - Realtime basket integration & scheme deal locks
 */

import { DISTRIBUTOR_SCHEMES } from '../../data/mockDataStore';
import { NotificationEngine } from '../../engine/NotificationEngine';
import { navigate } from '../../engine/Router';
import { BasketStore } from '../../store/BasketStore';

export default function SmartSchemeFinder(container: HTMLElement): void {
  const schemesList = DISTRIBUTOR_SCHEMES.map(s => ({
    ...s,
    qty: 1,
  }));

  // Multicolor Metro Theme Palettes for Tiles
  const tileThemes = [
    {
      borderTop: '4px solid #0078D7',
      badgeBg: 'rgba(0, 120, 215, 0.2)',
      badgeColor: '#60A5FA',
      offerBg: 'rgba(0, 120, 215, 0.12)',
      offerBorder: '1px dashed rgba(0, 120, 215, 0.4)',
      offerTextColor: '#93C5FD',
      btnGradient: 'linear-gradient(135deg, #0078D7, #005A9E)',
    },
    {
      borderTop: '4px solid #10B981',
      badgeBg: 'rgba(16, 185, 129, 0.2)',
      badgeColor: '#34D399',
      offerBg: 'rgba(16, 185, 129, 0.12)',
      offerBorder: '1px dashed rgba(16, 185, 129, 0.4)',
      offerTextColor: '#A7F3D0',
      btnGradient: 'linear-gradient(135deg, #10B981, #059669)',
    },
    {
      borderTop: '4px solid #8B5CF6',
      badgeBg: 'rgba(139, 92, 246, 0.2)',
      badgeColor: '#C4B5FD',
      offerBg: 'rgba(139, 92, 246, 0.12)',
      offerBorder: '1px dashed rgba(139, 92, 246, 0.4)',
      offerTextColor: '#DDD6FE',
      btnGradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    },
    {
      borderTop: '4px solid #F59E0B',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      badgeColor: '#FBBF24',
      offerBg: 'rgba(245, 158, 11, 0.12)',
      offerBorder: '1px dashed rgba(245, 158, 11, 0.4)',
      offerTextColor: '#FDE68A',
      btnGradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    },
    {
      borderTop: '4px solid #EC4899',
      badgeBg: 'rgba(236, 72, 153, 0.2)',
      badgeColor: '#F472B6',
      offerBg: 'rgba(236, 72, 153, 0.12)',
      offerBorder: '1px dashed rgba(236, 72, 153, 0.4)',
      offerTextColor: '#FBCFE8',
      btnGradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    },
    {
      borderTop: '4px solid #06B6D4',
      badgeBg: 'rgba(6, 182, 212, 0.2)',
      badgeColor: '#67E8F9',
      offerBg: 'rgba(6, 182, 212, 0.12)',
      offerBorder: '1px dashed rgba(6, 182, 212, 0.4)',
      offerTextColor: '#A5F3FC',
      btnGradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    },
  ];

  function render(): void {
    container.innerHTML = `
      <!-- Page Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:2px solid var(--tile-green); padding-bottom:6px;">
        <div>
          <h1 style="font-size:22px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:white; margin:0; display:flex; align-items:center; gap:8px;">
            🎁 Smart Scheme Finder (Stockist Deals)
          </h1>
          <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
            Live schemes and promotional deals configured by Distributors D1 through D10
          </div>
        </div>
        <span style="font-size:11px; font-weight:800; color:#34D399; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); padding:4px 10px; border-radius:4px;">
          ${schemesList.length} Active Schemes
        </span>
      </div>

      <!-- Schemes Grid of Multicolor Tiles -->
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap:16px; margin-bottom:20px;">
        ${schemesList.map((sch, idx) => {
          const offerText = sch.getQty > 0 ? `Buy ${sch.buyQty} + Get ${sch.getQty} Free` : `${sch.discountPct}% Flat Discount`;
          const theme = tileThemes[idx % tileThemes.length];

          return `
            <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-top:${theme.borderTop}; border-radius:10px; padding:16px; display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s ease, box-shadow 0.2s ease;" class="scheme-tile">
              
              <!-- Tile Header -->
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px; background:${theme.badgeBg}; color:${theme.badgeColor}; text-transform:uppercase;">
                    🎁 ${sch.schemeType}
                  </span>
                  <span style="font-size:10px; color:var(--text-secondary);">
                    Valid: ${sch.validity}
                  </span>
                </div>

                <!-- Scheme Name & SKU -->
                <div style="font-size:15px; font-weight:800; color:white; margin-bottom:4px; line-height:1.3;">
                  ${sch.schemeName}
                </div>

                <div style="font-size:12px; color:var(--tile-cyan); font-weight:700; margin-bottom:6px;">
                  Brand: ${sch.brandName} <span style="font-size:10px; color:var(--text-secondary);">(${sch.sku})</span>
                </div>

                <div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
                  Stockist: <strong style="color:white;">${sch.distributorName}</strong>
                </div>

                <!-- Offer Value Banner -->
                <div style="background:${theme.offerBg}; border:${theme.offerBorder}; border-radius:6px; padding:10px; text-align:center; margin-bottom:14px;">
                  <div style="font-size:16px; font-weight:900; color:${theme.offerTextColor};">
                    ${offerText}
                  </div>
                  <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">
                    Bonus items locked automatically on basket checkout
                  </div>
                </div>
              </div>

              <!-- Action Bar: Add to Basket -->
              <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; border-top:1px solid var(--border-subtle); padding-top:12px;">
                <!-- Quantity Picker -->
                <div style="display:flex; align-items:center; background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); border-radius:4px; padding:2px 6px; gap:6px;">
                  <button class="btn-scheme-qty" data-idx="${idx}" data-delta="-1" style="background:none; border:none; color:white; font-size:13px; font-weight:800; cursor:pointer;">-</button>
                  <span style="font-size:12px; font-weight:800; color:white; min-width:16px; text-align:center;">${sch.qty}</span>
                  <button class="btn-scheme-qty" data-idx="${idx}" data-delta="1" style="background:none; border:none; color:white; font-size:13px; font-weight:800; cursor:pointer;">+</button>
                </div>

                <!-- Replace APPLY DEAL with ADD TO BASKET -->
                <button class="action-btn btn-add-scheme-basket" data-idx="${idx}" style="flex:1; background:${theme.btnGradient}; color:white; font-size:12px; font-weight:900; padding:9px; border-radius:6px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 3px 10px rgba(0,0,0,0.3);">
                  🛒 ADD TO BASKET
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>

      <!-- Bottom Floating Navigation Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-elevated); border:1px solid var(--border-subtle); padding:14px; border-radius:8px;">
        <div style="font-size:12px; color:var(--text-secondary);">
          Ready to review your split order across stockists?
        </div>
        <button class="action-btn action-btn--primary" id="btn-go-to-basket" style="padding:10px 20px; font-weight:800;">
          🛍️ Go to Basket & Checkout (${BasketStore.getTotalCount()} Items)
        </button>
      </div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    // Quantity modify
    container.querySelectorAll('.btn-scheme-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        const delta = parseInt((e.currentTarget as HTMLElement).getAttribute('data-delta') || '0', 10);
        if (schemesList[idx]) {
          schemesList[idx].qty = Math.max(1, schemesList[idx].qty + delta);
          render();
        }
      });
    });

    // Add to Basket
    container.querySelectorAll('.btn-add-scheme-basket').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        const sch = schemesList[idx];
        if (sch) {
          BasketStore.addItem({
            sku: sch.sku,
            brandName: sch.brandName,
            genericSalt: 'Pharma Formulation Salt',
            category: 'OTC',
            packSize: '10x10',
            qty: sch.qty,
            ptr: 120.00,
            gstPct: 12,
            schemeText: sch.schemeName,
            distributorName: sch.distributorName,
            distributorPhone: '+91 98220 12345',
          });
          NotificationEngine.showToast(`🛒 ${sch.schemeName} (${sch.qty} Packs) added to basket!`, 'success');
          render();
        }
      });
    });

    // Go to basket
    container.querySelector('#btn-go-to-basket')?.addEventListener('click', () => {
      navigate('#/retailer/cart');
    });
  }

  render();
}



