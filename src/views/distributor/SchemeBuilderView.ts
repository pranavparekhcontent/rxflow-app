/**
 * Mediflow Scheme Builder View v3.0
 * Create & manage distributor scheme slabs, quantity discounts, seasonal campaigns, and clearance deals.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { SyncOrchestrator } from '../../engine/SyncOrchestrator';

interface Scheme {
  id: string;
  name: string;
  brand: string;
  type: 'Buy X Get Y' | 'Percentage Discount' | 'Cash Rebate';
  minQty: number;
  freeQty?: number;
  discountPct?: number;
  cashRebate?: number;
  validTill: string;
  active: boolean;
}

export default function SchemeBuilderView(container: HTMLElement): void {
  const schemes: Scheme[] = [
    {
      id: 'sch-101',
      name: 'Augmentin Monsoon Special',
      brand: 'Augmentin 625 Duo Tablet',
      type: 'Buy X Get Y',
      minQty: 10,
      freeQty: 2,
      validTill: '31 Aug 2026',
      active: true,
    },
    {
      id: 'sch-102',
      name: 'Pan-D Bulk Volume Bonus',
      brand: 'Pan-D Capsule',
      type: 'Percentage Discount',
      minQty: 20,
      discountPct: 8,
      validTill: '15 Aug 2026',
      active: true,
    },
    {
      id: 'sch-103',
      name: 'Dolo Fever Clearance Scheme',
      brand: 'Dolo 650 Tablet',
      type: 'Buy X Get Y',
      minQty: 50,
      freeQty: 10,
      validTill: '10 Aug 2026',
      active: false,
    }
  ];

  function formatBenefit(sch: Scheme): string {
    if (sch.type === 'Buy X Get Y') {
      return `Buy ${sch.minQty} Get ${sch.freeQty || 1} Free`;
    } else if (sch.type === 'Percentage Discount') {
      return `${sch.discountPct || 5}% Off on Min ${sch.minQty} Packs`;
    } else {
      return `₹${sch.cashRebate || 50} Cash Rebate on Min ${sch.minQty} Packs`;
    }
  }

  function render(): void {
    container.innerHTML = `
      <div class="section-title">Scheme & Campaign Builder</div>
      
      <!-- New Scheme Creator Form -->
      <div class="metro-card mb-md">
        <div style="font-size:14px;font-weight:700;margin-bottom:10px;color:var(--accent-blue);">+ Create New Campaign Scheme</div>
        
        <div class="grid grid-cols-2 gap-sm mb-sm">
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Campaign Name</label>
            <input type="text" id="sch-name" class="metro-input" placeholder="e.g. Festival Volume Boost" value="Independence Day Special" style="width:100%;margin-top:4px;">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Target Medicine / Brand</label>
            <select id="sch-brand" class="metro-input" style="width:100%;margin-top:4px;">
              <option value="Augmentin 625 Duo Tablet">Augmentin 625 Duo Tablet</option>
              <option value="Pan-D Capsule">Pan-D Capsule</option>
              <option value="Dolo 650 Tablet">Dolo 650 Tablet</option>
              <option value="Azithral 250 Tablet">Azithral 250 Tablet</option>
              <option value="Shelcal 500 Tablet">Shelcal 500 Tablet</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-sm mb-md">
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Scheme Type</label>
            <select id="sch-type" class="metro-input" style="width:100%;margin-top:4px;">
              <option value="Buy X Get Y">Buy X Get Y Free</option>
              <option value="Percentage Discount">% Cash Discount</option>
              <option value="Cash Rebate">Fixed ₹ Rebate</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Min Order Qty</label>
            <input type="number" id="sch-min-qty" class="metro-input" min="1" value="10" style="width:100%;margin-top:4px;">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Benefit Value</label>
            <input type="text" id="sch-benefit" class="metro-input" placeholder="e.g. 3 or 10% or ₹100" value="3" style="width:100%;margin-top:4px;">
          </div>
          <div>
            <label style="font-size:11px;color:var(--text-muted);">Valid Until</label>
            <input type="text" id="sch-valid" class="metro-input" value="31 Aug 2026" style="width:100%;margin-top:4px;">
          </div>
        </div>

        <div class="flex justify-end">
          <button id="btn-save-scheme" class="nav-btn active" style="padding:8px 18px;font-weight:700;">
            🚀 Launch Scheme Campaign
          </button>
        </div>
      </div>

      <!-- Active Schemes List -->
      <div class="metro-card">
        <div class="flex justify-between items-center mb-sm">
          <div style="font-size:14px;font-weight:700;">Active Retailer Schemes</div>
          <span class="badge badge-success">${schemes.filter(s => s.active).length} Active Campaigns</span>
        </div>

        <div class="metro-list">
          ${schemes.map(sch => `
            <div class="metro-item ${sch.active ? '' : 'metro-item--amber'}" style="margin-bottom:8px;">
              <div class="item-main">
                <div class="item-title">
                  <strong>${sch.name}</strong> 
                  <span class="status-badge ${sch.active ? 'status-badge--accepted' : 'status-badge--pending'}" style="margin-left:6px;font-size:10px;">
                    ${sch.active ? 'LIVE' : 'PAUSED'}
                  </span>
                </div>
                <div class="item-sub">
                  ${sch.brand} • Min Qty: <strong>${sch.minQty}</strong> • Benefit: <strong style="color:var(--accent-green);">${formatBenefit(sch)}</strong> • Till ${sch.validTill}
                </div>
              </div>
              <div class="item-price flex items-center gap-sm">
                <button class="btn-toggle-scheme" data-id="${sch.id}" style="padding:4px 8px;font-size:11px;background:#333;color:white;border:1px solid #555;border-radius:4px;cursor:pointer;">
                  ${sch.active ? '⏸ Pause' : '▶ Activate'}
                </button>
                <button class="btn-delete-scheme" data-id="${sch.id}" style="padding:4px 8px;font-size:11px;background:none;color:#ff5555;border:none;cursor:pointer;">
                  🗑️ Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Event Handlers
    container.querySelector('#btn-save-scheme')?.addEventListener('click', () => {
      const name = (container.querySelector('#sch-name') as HTMLInputElement).value || 'New Special Scheme';
      const brand = (container.querySelector('#sch-brand') as HTMLSelectElement).value;
      const type = (container.querySelector('#sch-type') as HTMLSelectElement).value as any;
      const minQty = parseInt((container.querySelector('#sch-min-qty') as HTMLInputElement).value, 10) || 10;
      const benefitRaw = (container.querySelector('#sch-benefit') as HTMLInputElement).value || '2';
      const validTill = (container.querySelector('#sch-valid') as HTMLInputElement).value || '31 Aug 2026';

      const parsedNum = parseFloat(benefitRaw.replace(/[^0-9.]/g, '')) || 2;

      const newScheme: Scheme = {
        id: `sch-${Date.now()}`,
        name,
        brand,
        type,
        minQty,
        validTill,
        active: true,
      };

      if (type === 'Buy X Get Y') {
        newScheme.freeQty = parsedNum;
      } else if (type === 'Percentage Discount') {
        newScheme.discountPct = parsedNum;
      } else {
        newScheme.cashRebate = parsedNum;
      }

      schemes.unshift(newScheme);
      SyncOrchestrator.queueMutation('schemes', 'INSERT', newScheme);
      NotificationEngine.showToast(`Campaign scheme '${name}' launched with benefit: ${formatBenefit(newScheme)}`, 'success');
      render();
    });

    container.querySelectorAll('.btn-toggle-scheme').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const sch = schemes.find(s => s.id === id);
        if (sch) {
          sch.active = !sch.active;
          NotificationEngine.showToast(`Scheme '${sch.name}' ${sch.active ? 'activated' : 'paused'}`, 'info');
          render();
        }
      });
    });

    container.querySelectorAll('.btn-delete-scheme').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        const idx = schemes.findIndex(s => s.id === id);
        if (idx !== -1) {
          schemes.splice(idx, 1);
          NotificationEngine.showToast('Scheme deleted', 'info');
          render();
        }
      });
    });
  }

  render();
}
