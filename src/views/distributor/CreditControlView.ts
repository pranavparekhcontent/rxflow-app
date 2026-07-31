/**
 * RxFlow Credit Control View v3.0
 * Custom Credit Limits & Credit Days by Distributors (D1..D10) to Retailers (R1..R10).
 */

import { CREDIT_RELATIONS } from '../../data/mockDataStore';

export default function CreditControlView(container: HTMLElement): void {
  // Display relations for Distributor D1 by default
  const relations = CREDIT_RELATIONS.slice(0, 10);

  container.innerHTML = `
    <div class="section-title">Credit Control & Limits (Distributors D1-D10 → Retailers R1-R10)</div>
    
    <div style="display:flex;gap:8px;margin-bottom:14px;overflow-x:auto;padding-bottom:4px;">
      <span style="font-size:12px;color:#aaa;align-self:center;">Distributor Filter:</span>
      <select id="dist-filter-select" style="background:#222;color:white;border:1px solid #444;padding:4px 8px;border-radius:4px;font-size:12px;">
        ${Array.from({ length: 10 }, (_, i) => `<option value="D${i + 1}">Distributor D${i + 1}</option>`).join('')}
      </select>
    </div>

    <div class="metro-list" id="credit-list-container">
      ${relations.map(rel => {
        const pctUsed = Math.round((rel.currentBalance / rel.creditLimit) * 100);
        const isDanger = pctUsed > 75 || rel.isBlocked;
        return `
          <div class="metro-item ${isDanger ? 'metro-item--red' : 'metro-item--green'}">
            <div class="item-main">
              <div class="item-title">
                ${isDanger ? '<span class="pulse-dot pulse-dot--danger"></span>' : ''}
                ${rel.retailerName}
                <span class="status-badge ${rel.isBlocked ? 'status-badge--overdue' : 'status-badge--accepted'}">
                  ${rel.isBlocked ? 'BLOCKED' : `${rel.creditDays} Days Credit`}
                </span>
              </div>
              <div class="item-sub">
                Rep: ${rel.salesRepName} • Limit: ₹${rel.creditLimit.toLocaleString('en-IN')} (${rel.creditDays}d) • ${pctUsed}% Used
              </div>
            </div>
            <div class="item-price">
              <div class="price-main" style="color:${isDanger ? 'var(--tile-red)' : 'var(--tile-green)'}">
                ₹${rel.currentBalance.toLocaleString('en-IN')}
              </div>
              <div class="price-sub">${rel.isBlocked ? 'Locked 🔒' : 'Active Line'}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach filter handler
  const select = container.querySelector('#dist-filter-select') as HTMLSelectElement;
  select?.addEventListener('change', (e) => {
    const distCode = (e.target as HTMLSelectElement).value;
    const filtered = CREDIT_RELATIONS.filter(r => r.distributorName.includes(distCode));
    const listEl = container.querySelector('#credit-list-container');
    if (listEl) {
      listEl.innerHTML = filtered.map(rel => {
        const pctUsed = Math.round((rel.currentBalance / rel.creditLimit) * 100);
        const isDanger = pctUsed > 75 || rel.isBlocked;
        return `
          <div class="metro-item ${isDanger ? 'metro-item--red' : 'metro-item--green'}">
            <div class="item-main">
              <div class="item-title">
                ${isDanger ? '<span class="pulse-dot pulse-dot--danger"></span>' : ''}
                ${rel.retailerName}
                <span class="status-badge ${rel.isBlocked ? 'status-badge--overdue' : 'status-badge--accepted'}">
                  ${rel.isBlocked ? 'BLOCKED' : `${rel.creditDays} Days Credit`}
                </span>
              </div>
              <div class="item-sub">
                Rep: ${rel.salesRepName} • Limit: ₹${rel.creditLimit.toLocaleString('en-IN')} (${rel.creditDays}d) • ${pctUsed}% Used
              </div>
            </div>
            <div class="item-price">
              <div class="price-main" style="color:${isDanger ? 'var(--tile-red)' : 'var(--tile-green)'}">
                ₹${rel.currentBalance.toLocaleString('en-IN')}
              </div>
              <div class="price-sub">${rel.isBlocked ? 'Locked 🔒' : 'Active Line'}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  });
}
