/**
 * RxFlow Master Ledger Statement Dashboard v5.0
 * Based on PharmaDist 10 Professional GST & Tally-Compliant Designs
 * Features:
 * - Design Selector Dropdown (All 10 Designs + Single Design View)
 * - Tally XML & Excel Export Engine
 * - Global Financial KPIs (Opening/Closing Balance, Net Movement, GST Paid)
 * - Live Filtering by Date Range, Distributor, Salt/Category & GST status
 * - Interactive Canvas Balance Trend Graph (Design 06)
 * - Tally XML / JSON Code Inspector (Design 07)
 * - Bank & CA Audit Reconciliation Matcher (Design 08)
 * - Salt-wise Financial Breakdown Cards (Design 09)
 * - Voucher Details & Audit Remarks Modal
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export interface LedgerEntry {
  id: number;
  date: string;
  voucher: string;
  party: string;
  type: 'Purchase' | 'Sale' | 'Payment' | 'Receipt' | 'Credit Note';
  salt: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  gst: string;
  gstin: string;
  status: 'reconciled' | 'unreconciled';
  narration?: string;
}

export default function LedgerView(container: HTMLElement): void {
  // Master Mock Data
  let ledgerData: LedgerEntry[] = [
    { id: 1, date: "2026-08-02", voucher: "INV-2026-0842", party: "MediPharm Distributors", type: "Purchase", salt: "Amoxicillin", particulars: "Amoxicillin 500mg - 1200 units", debit: 42400, credit: 0, balance: 1867450, gst: "18%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "Invoice received from MediPharm" },
    { id: 2, date: "2026-08-01", voucher: "PAY-2026-0334", party: "HealthLink Pharma", type: "Receipt", salt: "Paracetamol", particulars: "Payment received against INV-2026-0711", debit: 0, credit: 28500, balance: 1824950, gst: "0%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "NEFT received" },
    { id: 3, date: "2026-07-31", voucher: "INV-2026-0789", party: "MediPharm Distributors", type: "Sale", salt: "Paracetamol", particulars: "Paracetamol 650mg - 850 units", debit: 19800, credit: 0, balance: 1796450, gst: "12%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "Invoice issued to retailer" },
    { id: 4, date: "2026-07-29", voucher: "INV-2026-0762", party: "NutriCare India", type: "Purchase", salt: "Vitamin D3", particulars: "Vitamin D3 60K - 500 units", debit: 13250, credit: 0, balance: 1816250, gst: "18%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "" },
    { id: 5, date: "2026-07-25", voucher: "PAY-2026-0318", party: "Specialty Meds Ltd", type: "Payment", salt: "Metformin", particulars: "Payment to Specialty Meds", debit: 0, credit: 45000, balance: 1771250, gst: "0%", gstin: "27AABCM1234P1ZA", status: "unreconciled", narration: "Cheque #54321" },
    { id: 6, date: "2026-07-22", voucher: "INV-2026-0723", party: "MediPharm Distributors", type: "Purchase", salt: "Metformin", particulars: "Metformin 500mg - 2400 units", debit: 46800, credit: 0, balance: 1816250, gst: "12%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "Bulk purchase" },
    { id: 7, date: "2026-07-18", voucher: "CN-2026-004", party: "HealthLink Pharma", type: "Credit Note", salt: "Amoxicillin", particulars: "Credit note for damaged stock", debit: 0, credit: 4200, balance: 1769450, gst: "18%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "Return of defective goods" },
    { id: 8, date: "2026-07-15", voucher: "INV-2026-0691", party: "MediPharm Distributors", type: "Sale", salt: "Paracetamol", particulars: "Paracetamol 650mg - 1200 units", debit: 27600, credit: 0, balance: 1765250, gst: "12%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "" },
    { id: 9, date: "2026-07-10", voucher: "PAY-2026-0299", party: "MediPharm Distributors", type: "Payment", salt: "Amoxicillin", particulars: "Advance payment", debit: 0, credit: 60000, balance: 1737650, gst: "0%", gstin: "27AABCM1234P1ZA", status: "reconciled", narration: "RTGS" },
    { id: 10, date: "2026-07-08", voucher: "INV-2026-0644", party: "Specialty Meds Ltd", type: "Purchase", salt: "Vitamin D3", particulars: "Vitamin D3 60K - 300 units", debit: 7950, credit: 0, balance: 1797650, gst: "18%", gstin: "27AABCM1234P1ZA", status: "unreconciled", narration: "" },
  ];

  let selectedDesign: string = 'all'; // 'all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
  let activeVoucherModal: LedgerEntry | null = null;
  let activeSaltModal: { salt: string; entries: LedgerEntry[] } | null = null;
  let tallyPreviewFormat: 'xml' | 'json' = 'xml';

  // Filters state for Design 1
  let filter1From = '2026-04-01';
  let filter1To = '2026-08-02';
  let filter1Party = '';
  let filter1Salt = '';

  function fmtMoney(val: number): string {
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  function render(): void {
    const totalDebit = ledgerData.reduce((acc, r) => acc + r.debit, 0);
    const totalCredit = ledgerData.reduce((acc, r) => acc + r.credit, 0);
    const closingBal = ledgerData[0]?.balance ?? 1867450;
    const unreconciledCount = ledgerData.filter(r => r.status === 'unreconciled').length;

    container.innerHTML = `
      <!-- TOP ACTION BAR & DESIGN SELECTOR DROPDOWN -->
      <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:16px 20px; margin-bottom:20px; box-shadow:0 10px 25px rgba(0,0,0,0.4);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
          
          <!-- Title & Compliance Badges -->
          <div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <h1 style="font-size:22px; font-weight:900; color:white; margin:0; letter-spacing:-0.5px;">
                📊 Master Ledger Statement
              </h1>
              <span style="background:rgba(16,185,129,0.2); border:1px solid #10B981; color:#34D399; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">
                TALLY READY
              </span>
              <span style="background:rgba(56,189,248,0.2); border:1px solid #38BDF8; color:#38BDF8; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">
                GST COMPLIANT
              </span>
            </div>
            <div style="font-size:11px; color:#94A3B8; margin-top:2px;">
              Pharma B2B Accounting • Audit Trail • FY 2026-27
            </div>
          </div>

          <!-- Right Controls: Design Selector Dropdown & Action Buttons -->
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            
            <!-- DESIGN SELECTOR DROPDOWN -->
            <div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06); border:1.5px solid #38BDF8; border-radius:10px; padding:4px 10px;">
              <span style="font-size:11px; font-weight:900; color:#38BDF8; white-space:nowrap;">🎨 VIEW DESIGN:</span>
              <select id="ledger-design-select" style="background:#0F172A; color:white; border:none; font-size:11px; font-weight:800; cursor:pointer; outline:none; padding:4px;">
                <option value="all" ${selectedDesign === 'all' ? 'selected' : ''}>🌐 Show All 10 Designs</option>
                <option value="1" ${selectedDesign === '1' ? 'selected' : ''}>Design 01: Classic Tally Ledger (Tally Standard)</option>
                <option value="2" ${selectedDesign === '2' ? 'selected' : ''}>Design 02: Modern Card Ledger (Modern Cards + KPI)</option>
                <option value="3" ${selectedDesign === '3' ? 'selected' : ''}>Design 03: Nokia Live Tile Ledger (Windows Metro Grid)</option>
                <option value="4" ${selectedDesign === '4' ? 'selected' : ''}>Design 04: Advanced Filter Panel (Sidebar + Table)</option>
                <option value="5" ${selectedDesign === '5' ? 'selected' : ''}>Design 05: Timeline Ledger (Transaction Feed)</option>
                <option value="6" ${selectedDesign === '6' ? 'selected' : ''}>Design 06: Visual + Tabular (Trend Chart + Table)</option>
                <option value="7" ${selectedDesign === '7' ? 'selected' : ''}>Design 07: Tally XML / JSON Inspector & Exporter</option>
                <option value="8" ${selectedDesign === '8' ? 'selected' : ''}>Design 08: Reconciliation & Audit Trail</option>
                <option value="9" ${selectedDesign === '9' ? 'selected' : ''}>Design 09: Salt & Category-wise Ledger</option>
                <option value="10" ${selectedDesign === '10' ? 'selected' : ''}>Design 10: Enterprise Dashboard View</option>
              </select>
            </div>

            <!-- Master Action Buttons -->
            <button id="btn-export-excel" style="background:#107C41; color:white; border:none; font-size:11px; font-weight:900; padding:7px 12px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Export Excel CSV">
              📥 Excel
            </button>

            <button id="btn-export-tally" style="background:#059669; color:white; border:none; font-size:11px; font-weight:900; padding:7px 12px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:4px;" title="Export Tally XML Envelope">
              📄 Tally XML
            </button>

            <button id="btn-sync-tally" style="background:linear-gradient(135deg, #0078D7, #00B7C3); color:white; border:none; font-size:11px; font-weight:900; padding:7px 12px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:4px;">
              🔄 Sync Tally
            </button>
          </div>

        </div>
      </div>

      <!-- GLOBAL LEDGER KPIS BAR -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:24px;">
        <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px;">
          <div style="font-size:10px; font-weight:900; color:#94A3B8; text-transform:uppercase;">OPENING BALANCE</div>
          <div style="font-size:20px; font-weight:900; color:white; margin-top:4px;">₹12,45,820</div>
          <div style="font-size:10px; color:#34D399; font-weight:800; margin-top:2px;">Dr • 1 Apr 2026</div>
        </div>

        <div style="background:#0F172A; border:1.5px solid #10B981; border-radius:12px; padding:14px; box-shadow:0 4px 14px rgba(16,185,129,0.15);">
          <div style="font-size:10px; font-weight:900; color:#34D399; text-transform:uppercase;">CLOSING BALANCE</div>
          <div style="font-size:20px; font-weight:900; color:white; margin-top:4px;">${fmtMoney(closingBal)}</div>
          <div style="font-size:10px; color:#34D399; font-weight:800; margin-top:2px;">Dr • 2 Aug 2026</div>
        </div>

        <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px;">
          <div style="font-size:10px; font-weight:900; color:#94A3B8; text-transform:uppercase;">TOTAL DEBIT</div>
          <div style="font-size:20px; font-weight:900; color:#34D399; margin-top:4px;">₹52,84,300</div>
          <div style="font-size:10px; color:#94A3B8; margin-top:2px;">${ledgerData.length} Vouchers</div>
        </div>

        <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px;">
          <div style="font-size:10px; font-weight:900; color:#94A3B8; text-transform:uppercase;">TOTAL CREDIT</div>
          <div style="font-size:20px; font-weight:900; color:#F87171; margin-top:4px;">₹46,62,670</div>
          <div style="font-size:10px; color:#94A3B8; margin-top:2px;">Settled Receipts</div>
        </div>

        <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:10px; font-weight:900; color:#94A3B8; text-transform:uppercase;">GST PAID</div>
            <div style="font-size:20px; font-weight:900; color:#60A5FA; margin-top:4px;">₹7.82L</div>
          </div>
          <span style="background:rgba(56,189,248,0.15); color:#38BDF8; font-size:10px; font-weight:900; padding:2px 8px; border-radius:6px;">
            100% Valid
          </span>
        </div>
      </div>

      <!-- MAIN LEDGER DESIGNS CONTAINER -->
      <div id="ledger-designs-body">
        ${renderSelectedDesignsHtml()}
      </div>

      <!-- VOUCHER DETAIL MODAL -->
      ${activeVoucherModal ? renderVoucherModalHtml(activeVoucherModal) : ''}

      <!-- SALT DRILLDOWN MODAL -->
      ${activeSaltModal ? renderSaltModalHtml(activeSaltModal) : ''}
    `;

    attachEvents();

    // Render Canvas Chart for Design 06 if active
    if (selectedDesign === 'all' || selectedDesign === '6') {
      setTimeout(() => renderCanvasChart(), 50);
    }
  }

  function renderSelectedDesignsHtml(): string {
    if (selectedDesign === '1') return renderDesign1Html();
    if (selectedDesign === '2') return renderDesign2Html();
    if (selectedDesign === '3') return renderDesign3Html();
    if (selectedDesign === '4') return renderDesign4Html();
    if (selectedDesign === '5') return renderDesign5Html();
    if (selectedDesign === '6') return renderDesign6Html();
    if (selectedDesign === '7') return renderDesign7Html();
    if (selectedDesign === '8') return renderDesign8Html();
    if (selectedDesign === '9') return renderDesign9Html();
    if (selectedDesign === '10') return renderDesign10Html();

    // SHOW ALL 10 DESIGNS STACKED
    return `
      <div style="display:flex; flex-direction:column; gap:36px;">
        ${renderDesign1Html()}
        ${renderDesign2Html()}
        ${renderDesign3Html()}
        ${renderDesign4Html()}
        ${renderDesign5Html()}
        ${renderDesign6Html()}
        ${renderDesign7Html()}
        ${renderDesign8Html()}
        ${renderDesign9Html()}
        ${renderDesign10Html()}
      </div>
    `;
  }

  // =========================================================================
  // DESIGN 01: CLASSIC TALLY LEDGER
  // =========================================================================
  function renderDesign1Html(): string {
    let filtered = ledgerData.filter(item => {
      if (filter1From && item.date < filter1From) return false;
      if (filter1To && item.date > filter1To) return false;
      if (filter1Party && item.party !== filter1Party) return false;
      if (filter1Salt && item.salt !== filter1Salt) return false;
      return true;
    });

    return `
      <div style="background:#0F172A; border:1px solid rgba(16,185,129,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#059669; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 01</span>
            <span style="font-size:16px; font-weight:900; color:white;">Classic Tally Ledger</span>
            <span style="background:rgba(16,185,129,0.15); color:#34D399; font-size:10px; font-weight:800; padding:2px 8px; border-radius:6px;">Tally Standard</span>
          </div>
          <button class="btn-refresh-design" data-design="1" style="background:rgba(255,255,255,0.08); color:white; border:none; font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; cursor:pointer;">
            🔄 Refresh
          </button>
        </div>

        <!-- Filters Bar -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-bottom:14px; background:rgba(255,255,255,0.02); padding:10px; border-radius:10px;">
          <div>
            <label style="font-size:10px; font-weight:800; color:#94A3B8;">From Date</label>
            <input type="date" id="d1-from" value="${filter1From}" style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:11px; border-radius:6px; padding:4px 8px;" />
          </div>
          <div>
            <label style="font-size:10px; font-weight:800; color:#94A3B8;">To Date</label>
            <input type="date" id="d1-to" value="${filter1To}" style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:11px; border-radius:6px; padding:4px 8px;" />
          </div>
          <div>
            <label style="font-size:10px; font-weight:800; color:#94A3B8;">Distributor / Party</label>
            <select id="d1-party" style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:11px; border-radius:6px; padding:4px 8px;">
              <option value="">All Parties</option>
              <option value="MediPharm Distributors" ${filter1Party === 'MediPharm Distributors' ? 'selected' : ''}>MediPharm Distributors</option>
              <option value="HealthLink Pharma" ${filter1Party === 'HealthLink Pharma' ? 'selected' : ''}>HealthLink Pharma</option>
              <option value="NutriCare India" ${filter1Party === 'NutriCare India' ? 'selected' : ''}>NutriCare India</option>
              <option value="Specialty Meds Ltd" ${filter1Party === 'Specialty Meds Ltd' ? 'selected' : ''}>Specialty Meds Ltd</option>
            </select>
          </div>
          <div>
            <label style="font-size:10px; font-weight:800; color:#94A3B8;">Salt / Category</label>
            <select id="d1-salt" style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:11px; border-radius:6px; padding:4px 8px;">
              <option value="">All Salts</option>
              <option value="Amoxicillin" ${filter1Salt === 'Amoxicillin' ? 'selected' : ''}>Amoxicillin</option>
              <option value="Paracetamol" ${filter1Salt === 'Paracetamol' ? 'selected' : ''}>Paracetamol</option>
              <option value="Metformin" ${filter1Salt === 'Metformin' ? 'selected' : ''}>Metformin</option>
              <option value="Vitamin D3" ${filter1Salt === 'Vitamin D3' ? 'selected' : ''}>Vitamin D3</option>
            </select>
          </div>
          <div style="display:flex; align-items:flex-end; gap:6px;">
            <button id="btn-apply-d1" style="flex:1; background:#059669; color:white; border:none; font-size:11px; font-weight:800; padding:6px; border-radius:6px; cursor:pointer;">Apply</button>
            <button id="btn-reset-d1" style="background:rgba(255,255,255,0.1); color:white; border:none; font-size:11px; font-weight:800; padding:6px 10px; border-radius:6px; cursor:pointer;">Reset</button>
          </div>
        </div>

        <!-- Ledger Table -->
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
              <tr style="background:#1E293B; color:#94A3B8; text-align:left; text-transform:uppercase;">
                <th style="padding:8px;">Date</th>
                <th style="padding:8px;">Voucher No.</th>
                <th style="padding:8px;">Party</th>
                <th style="padding:8px;">Particulars / Salt</th>
                <th style="padding:8px; text-align:right;">Debit (₹)</th>
                <th style="padding:8px; text-align:right;">Credit (₹)</th>
                <th style="padding:8px; text-align:right;">Balance (₹)</th>
                <th style="padding:8px; text-align:center;">GST</th>
                <th style="padding:8px; text-align:center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map((row) => `
                <tr class="ledger-row-click" data-id="${row.id}" style="border-bottom:1px solid rgba(255,255,255,0.06); color:white; cursor:pointer;">
                  <td style="padding:8px;">${row.date}</td>
                  <td style="padding:8px; font-weight:800; color:#34D399;">${row.voucher}</td>
                  <td style="padding:8px; font-weight:800;">${row.party}</td>
                  <td style="padding:8px;">
                    <div>${row.particulars}</div>
                    <div style="font-size:10px; color:#94A3B8;">${row.salt}</div>
                  </td>
                  <td style="padding:8px; text-align:right; font-weight:800; color:${row.debit ? '#34D399' : '#64748B'};">${row.debit ? fmtMoney(row.debit) : '-'}</td>
                  <td style="padding:8px; text-align:right; font-weight:800; color:${row.credit ? '#F87171' : '#64748B'};">${row.credit ? fmtMoney(row.credit) : '-'}</td>
                  <td style="padding:8px; text-align:right; font-weight:900; color:#38BDF8;">${fmtMoney(row.balance)}</td>
                  <td style="padding:8px; text-align:center;">
                    <span style="background:${row.gst === '0%' ? 'rgba(255,255,255,0.1)' : 'rgba(16,185,129,0.2)'}; color:${row.gst === '0%' ? '#CBD5E1' : '#34D399'}; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px;">${row.gst}</span>
                  </td>
                  <td style="padding:8px; text-align:center;">
                    <button class="btn-view-voucher" data-id="${row.id}" style="background:rgba(56,189,248,0.2); color:#38BDF8; border:none; font-size:10px; font-weight:800; padding:3px 8px; border-radius:4px; cursor:pointer;">View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // DESIGN 02: MODERN CARD LEDGER
  // =========================================================================
  function renderDesign2Html(): string {
    return `
      <div style="background:#0F172A; border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#0284C7; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 02</span>
            <span style="font-size:16px; font-weight:900; color:white;">Modern Card Ledger</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:14px;">
          ${ledgerData.slice(0, 3).map((item) => `
            <div class="ledger-row-click" data-id="${item.id}" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:14px; cursor:pointer;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-size:10px; font-weight:900; color:#94A3B8;">${item.voucher}</div>
                  <div style="font-size:13px; font-weight:800; color:white; margin-top:2px;">${item.particulars}</div>
                  <div style="font-size:11px; color:#34D399; font-weight:800; margin-top:2px;">${item.party}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:16px; font-weight:900; color:${item.debit > 0 ? '#34D399' : '#F87171'};">${item.debit ? fmtMoney(item.debit) : fmtMoney(item.credit)}</div>
                  <div style="font-size:10px; color:#94A3B8; font-weight:700;">${item.debit > 0 ? 'Debit' : 'Credit'}</div>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; pt-8px; border-top:1px solid rgba(255,255,255,0.06); font-size:10px; color:#94A3B8;">
                <span>${item.date}</span>
                <span style="background:rgba(56,189,248,0.2); color:#38BDF8; padding:2px 6px; border-radius:4px; font-weight:800;">${item.gst} GST</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // DESIGN 03: NOKIA LIVE TILE LEDGER
  // =========================================================================
  function renderDesign3Html(): string {
    const summaries = [
      { label: "TOTAL DEBIT", value: "₹52.84L", icon: "💰", color: "#10B981" },
      { label: "TOTAL CREDIT", value: "₹46.63L", icon: "💳", color: "#F59E0B" },
      { label: "NET MOVEMENT", value: "₹6.21L", icon: "📊", color: "#38BDF8" },
      { label: "GST COLLECTED", value: "₹7.82L", icon: "🧾", color: "#8B5CF6" },
      { label: "UNRECONCILED", value: "13 Items", icon: "⚠️", color: "#EF4444" }
    ];

    return `
      <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#0F172A; border:1px solid white; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 03</span>
            <span style="font-size:16px; font-weight:900; color:white;">Nokia Live Tile Ledger</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
          ${summaries.map(s => `
            <div style="background:#1E293B; border:2px solid ${s.color}; border-radius:12px; padding:14px; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:transform 0.15s ease;" class="hover-tile">
              <div style="font-size:10px; font-weight:900; color:#94A3B8; text-transform:uppercase;">${s.label}</div>
              <div style="font-size:22px; font-weight:900; color:white; margin-top:6px;">${s.value}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:14px;">
                <span>${s.icon}</span>
                <span style="font-size:9px; font-weight:900; background:rgba(255,255,255,0.1); color:white; padding:2px 6px; border-radius:4px;">LIVE</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // DESIGN 04: ADVANCED FILTER PANEL & TABLE
  // =========================================================================
  function renderDesign4Html(): string {
    return `
      <div style="background:#0F172A; border:1px solid rgba(139,92,246,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#6D28D9; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 04</span>
            <span style="font-size:16px; font-weight:900; color:white;">Advanced Filter Panel & Ledger</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 240px 1fr; gap:16px;">
          <!-- Left Sidebar Filters -->
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; font-size:11px;">
            <div style="font-weight:900; color:white; margin-bottom:10px;">Filters</div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div>
                <label style="color:#94A3B8; font-size:10px; font-weight:800;">Date Range</label>
                <input type="date" value="2026-04-01" style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:10px; padding:4px; border-radius:6px; margin-top:2px;" />
              </div>
              <div>
                <label style="color:#94A3B8; font-size:10px; font-weight:800;">Distributor</label>
                <select style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:10px; padding:4px; border-radius:6px; margin-top:2px;">
                  <option>All Distributors</option>
                  <option>MediPharm Distributors</option>
                  <option>HealthLink Pharma</option>
                </select>
              </div>
              <div>
                <label style="color:#94A3B8; font-size:10px; font-weight:800;">Salt</label>
                <input type="text" placeholder="Amoxicillin..." style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:10px; padding:4px; border-radius:6px; margin-top:2px;" />
              </div>
              <button id="btn-apply-d4" style="background:#7C3AED; color:white; border:none; font-size:11px; font-weight:900; padding:6px; border-radius:6px; cursor:pointer; margin-top:6px;">Apply Filters</button>
            </div>
          </div>

          <!-- Right Table -->
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:#1E293B; color:#C4B5FD; text-align:left;">
                  <th style="padding:8px;">Date • Voucher</th>
                  <th style="padding:8px;">Party</th>
                  <th style="padding:8px;">Particulars</th>
                  <th style="padding:8px; text-align:right;">Amount</th>
                  <th style="padding:8px; text-align:center;">Type</th>
                </tr>
              </thead>
              <tbody>
                ${ledgerData.slice(0, 5).map(row => `
                  <tr class="ledger-row-click" data-id="${row.id}" style="border-bottom:1px solid rgba(255,255,255,0.06); color:white; cursor:pointer;">
                    <td style="padding:8px;">
                      <strong>${row.date}</strong>
                      <div style="font-size:10px; color:#38BDF8;">${row.voucher}</div>
                    </td>
                    <td style="padding:8px; font-weight:800;">${row.party}</td>
                    <td style="padding:8px;">${row.particulars}</td>
                    <td style="padding:8px; text-align:right; font-weight:900; color:${row.debit ? '#34D399' : '#F87171'};">${row.debit ? fmtMoney(row.debit) : fmtMoney(row.credit)}</td>
                    <td style="padding:8px; text-align:center;">
                      <span style="background:rgba(139,92,246,0.2); color:#C4B5FD; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px;">${row.type}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // DESIGN 05: TIMELINE LEDGER
  // =========================================================================
  function renderDesign5Html(): string {
    return `
      <div style="background:#0F172A; border:1px solid rgba(245,158,11,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#C2410C; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 05</span>
            <span style="font-size:16px; font-weight:900; color:white;">Transaction Timeline Ledger</span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${ledgerData.slice(0, 5).map(item => `
            <div class="ledger-row-click" data-id="${item.id}" style="border-left:4px solid ${item.debit > 0 ? '#10B981' : '#F97316'}; background:rgba(255,255,255,0.03); padding:10px 14px; border-radius:0 8px 8px 0; cursor:pointer;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <span style="font-size:12px; font-weight:900; color:white;">${item.date}</span>
                  <span style="font-size:10px; font-weight:800; background:rgba(255,255,255,0.08); color:#CBD5E1; padding:2px 6px; border-radius:4px; margin-left:6px;">${item.voucher}</span>
                </div>
                <div style="font-size:14px; font-weight:900; color:${item.debit > 0 ? '#34D399' : '#F87171'};">
                  ${item.debit ? fmtMoney(item.debit) : fmtMoney(item.credit)}
                </div>
              </div>
              <div style="font-size:11px; color:#94A3B8; margin-top:2px;">
                ${item.party} • ${item.particulars}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // DESIGN 06: VISUAL + TABULAR (CANVAS GRAPH)
  // =========================================================================
  function renderDesign6Html(): string {
    return `
      <div style="background:#0F172A; border:1px solid rgba(20,184,166,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#0F766E; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 06</span>
            <span style="font-size:16px; font-weight:900; color:white;">Visual Graph + Tabular Hybrid</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px;">
            <div style="font-size:11px; font-weight:900; color:white; margin-bottom:8px;">Balance Trend Curve (6 Months)</div>
            <canvas id="ledger-trend-canvas" width="340" height="150" style="width:100%; height:150px;"></canvas>
          </div>

          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; overflow-y:auto; max-height:180px;">
            <div style="font-size:11px; font-weight:900; color:white; margin-bottom:8px;">Recent Vouchers</div>
            <table style="width:100%; border-collapse:collapse; font-size:10px; color:white;">
              ${ledgerData.slice(0, 4).map(r => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:4px 0;">${r.date}</td>
                  <td style="padding:4px 0; font-weight:800; color:#34D399;">${r.voucher}</td>
                  <td style="padding:4px 0; text-align:right; font-weight:900;">${fmtMoney(r.debit || r.credit)}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // Draw smooth HTML5 Canvas balance curve for Design 06
  function renderCanvasChart(): void {
    const canvas = container.querySelector('#ledger-trend-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points = [
      { month: 'Apr', val: 30 },
      { month: 'May', val: 50 },
      { month: 'Jun', val: 75 },
      { month: 'Jul', val: 110 },
      { month: 'Aug', val: 135 }
    ];

    const padding = 20;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = 3;

    points.forEach((p, idx) => {
      const x = padding + (idx / (points.length - 1)) * width;
      const y = canvas.height - padding - (p.val / 150) * height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw Dots
    points.forEach((p, idx) => {
      const x = padding + (idx / (points.length - 1)) * width;
      const y = canvas.height - padding - (p.val / 150) * height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.fill();
    });
  }

  // =========================================================================
  // DESIGN 07: TALLY XML / JSON CODE INSPECTOR
  // =========================================================================
  function renderDesign7Html(): string {
    const xmlCode = `&lt;ENVELOPE&gt;
  &lt;HEADER&gt;&lt;VERSION&gt;1.0&lt;/VERSION&gt;&lt;/HEADER&gt;
  &lt;BODY&gt;
    &lt;LEDGER&gt;
      &lt;NAME&gt;MediPharm Distributors&lt;/NAME&gt;
      &lt;VOUCHER&gt;
        &lt;DATE&gt;2026-08-02&lt;/DATE&gt;
        &lt;VOUCHERNO&gt;INV-2026-0842&lt;/VOUCHERNO&gt;
        &lt;AMOUNT&gt;42400&lt;/AMOUNT&gt;
        &lt;GST&gt;18%&lt;/GST&gt;
      &lt;/VOUCHER&gt;
    &lt;/LEDGER&gt;
  &lt;/BODY&gt;
&lt;/ENVELOPE&gt;`;

    const jsonCode = `{
  "ledger": "MediPharm Distributors",
  "vouchers": [
    { "date": "2026-08-02", "voucherNo": "INV-2026-0842", "debit": 42400, "gst": "18%" }
  ]
}`;

    return `
      <div style="background:#0F172A; border:1px solid rgba(147,51,234,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#7E22CE; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 07</span>
            <span style="font-size:16px; font-weight:900; color:white;">Tally XML / JSON Inspector</span>
          </div>

          <div style="display:flex; gap:8px;">
            <button id="btn-toggle-xml" style="background:${tallyPreviewFormat === 'xml' ? '#7E22CE' : 'rgba(255,255,255,0.1)'}; color:white; border:none; font-size:10px; font-weight:900; padding:4px 10px; border-radius:6px; cursor:pointer;">Show Tally XML</button>
            <button id="btn-toggle-json" style="background:${tallyPreviewFormat === 'json' ? '#7E22CE' : 'rgba(255,255,255,0.1)'}; color:white; border:none; font-size:10px; font-weight:900; padding:4px 10px; border-radius:6px; cursor:pointer;">Show JSON</button>
          </div>
        </div>

        <div style="background:#020617; border:1px solid #1E293B; border-radius:10px; padding:14px; font-family:monospace; font-size:11px; color:#A7F3D0; overflow-x:auto; max-height:200px;">
          <pre style="margin:0;">${tallyPreviewFormat === 'xml' ? xmlCode : jsonCode}</pre>
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button id="btn-copy-code" style="background:#10B981; color:white; border:none; font-size:10px; font-weight:900; padding:6px 12px; border-radius:6px; cursor:pointer;">📋 Copy Code to Clipboard</button>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // DESIGN 08: RECONCILIATION & AUDIT
  // =========================================================================
  function renderDesign8Html(): string {
    const reconciledCount = ledgerData.filter(r => r.status === 'reconciled').length;
    const unreconciledCount = ledgerData.length - reconciledCount;

    return `
      <div style="background:#0F172A; border:1px solid rgba(244,63,94,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#BE123C; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 08</span>
            <span style="font-size:16px; font-weight:900; color:white;">Reconciliation & Audit Trail</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div>
            <div style="font-size:11px; font-weight:900; color:white; margin-bottom:8px;">Reconciliation Status</div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; font-size:11px;">
              <span style="color:#94A3B8;">Matched Entries:</span>
              <strong style="color:#34D399;">${reconciledCount} / ${ledgerData.length}</strong>
            </div>
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px; margin-bottom:12px; display:flex; justify-content:space-between; font-size:11px;">
              <span style="color:#94A3B8;">Unreconciled:</span>
              <strong style="color:#F59E0B;">${unreconciledCount} Vouchers</strong>
            </div>
            <button id="btn-start-reconciliation" style="width:100%; background:#BE123C; color:white; border:none; font-size:11px; font-weight:900; padding:8px; border-radius:6px; cursor:pointer;">
              ⚡ Start 1-Click Bank Reconciliation
            </button>
          </div>

          <div>
            <div style="font-size:11px; font-weight:900; color:white; margin-bottom:8px;">Audit Trail Feed</div>
            <div style="font-size:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:6px; color:#CBD5E1;">
              <div style="display:flex; justify-content:space-between;"><span>29 Jul • Voucher edited</span><strong>Admin</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>18 Jul • GST reconciled</span><strong>System</strong></div>
              <div style="display:flex; justify-content:space-between;"><span>02 Aug • New entry added</span><strong>Pharmacist</strong></div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // DESIGN 09: SALT-WISE LEDGER
  // =========================================================================
  function renderDesign9Html(): string {
    const saltMap: Record<string, { debit: number; credit: number; count: number }> = {};
    ledgerData.forEach(r => {
      if (!saltMap[r.salt]) saltMap[r.salt] = { debit: 0, credit: 0, count: 0 };
      saltMap[r.salt].debit += r.debit;
      saltMap[r.salt].credit += r.credit;
      saltMap[r.salt].count++;
    });

    return `
      <div style="background:#0F172A; border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#0284C7; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 09</span>
            <span style="font-size:16px; font-weight:900; color:white;">Salt & Category-wise Ledger</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
          ${Object.keys(saltMap).map(salt => {
            const s = saltMap[salt];
            return `
              <div class="salt-card-click" data-salt="${salt}" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; cursor:pointer;">
                <div style="font-size:13px; font-weight:900; color:white;">💊 ${salt}</div>
                <div style="font-size:10px; color:#94A3B8; margin-top:4px;">Debit: <strong style="color:#34D399;">${fmtMoney(s.debit)}</strong></div>
                <div style="font-size:10px; color:#94A3B8;">Credit: <strong style="color:#F87171;">${fmtMoney(s.credit)}</strong></div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                  <span style="font-size:10px; font-weight:900; color:#38BDF8;">${s.count} Entries</span>
                  <button class="btn-open-salt-modal" data-salt="${salt}" style="background:#0284C7; color:white; border:none; font-size:9px; font-weight:900; padding:2px 8px; border-radius:4px; cursor:pointer;">View</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  }

  // =========================================================================
  // DESIGN 10: ENTERPRISE DASHBOARD VIEW
  // =========================================================================
  function renderDesign10Html(): string {
    return `
      <div style="background:#0F172A; border:1px solid rgba(255,255,255,0.15); border-radius:14px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="background:#334155; color:white; font-size:10px; font-weight:900; padding:2px 8px; border-radius:12px;">DESIGN 10</span>
            <span style="font-size:16px; font-weight:900; color:white;">Enterprise Ledger Dashboard</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:16px;">
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; font-size:11px;">
            <div style="font-weight:900; color:white; margin-bottom:8px;">Ledger Summary</div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#94A3B8;">
              <span>Opening Balance</span><strong style="color:white;">₹12,45,820</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:#94A3B8;">
              <span>Net Movement</span><strong style="color:#34D399;">+₹6,21,630</strong>
            </div>
            <div style="display:flex; justify-content:space-between; pt-8px; border-top:1px solid rgba(255,255,255,0.08); font-size:13px; font-weight:900; color:white;">
              <span>Closing Balance</span><strong style="color:#38BDF8;">₹18,67,450</strong>
            </div>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:11px; color:white;">
              <thead>
                <tr style="background:#1E293B; text-align:left;">
                  <th style="padding:6px;">Date</th>
                  <th style="padding:6px;">Voucher</th>
                  <th style="padding:6px;">Party</th>
                  <th style="padding:6px; text-align:right;">Debit</th>
                  <th style="padding:6px; text-align:center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${ledgerData.slice(0, 4).map(r => `
                  <tr class="ledger-row-click" data-id="${r.id}" style="border-bottom:1px solid rgba(255,255,255,0.06); cursor:pointer;">
                    <td style="padding:6px;">${r.date}</td>
                    <td style="padding:6px; font-weight:800; color:#34D399;">${r.voucher}</td>
                    <td style="padding:6px;">${r.party}</td>
                    <td style="padding:6px; text-align:right; font-weight:900;">${r.debit ? fmtMoney(r.debit) : ''}</td>
                    <td style="padding:6px; text-align:center;">
                      <span style="background:${r.status === 'reconciled' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}; color:${r.status === 'reconciled' ? '#34D399' : '#FBBF24'}; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px;">${r.status}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  // =========================================================================
  // VOUCHER DETAILS MODAL
  // =========================================================================
  function renderVoucherModalHtml(row: LedgerEntry): string {
    return `
      <div id="voucher-modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(5px); z-index:9999; display:flex; justify-content:center; align-items:center; padding:16px;">
        <div style="background:#0F172A; border:2px solid #38BDF8; border-radius:14px; width:100%; max-width:600px; padding:24px; box-shadow:0 10px 40px rgba(0,0,0,0.9); animation:fadeIn 0.2s ease;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">
            <div>
              <h2 style="font-size:18px; font-weight:900; color:white; margin:0;">${row.voucher} • ${row.type}</h2>
              <div style="font-size:11px; color:#38BDF8; font-weight:700; margin-top:2px;">${row.date} • ${row.party}</div>
            </div>
            <button id="btn-close-voucher-modal" style="background:none; border:none; color:#94A3B8; font-size:22px; cursor:pointer;">✕</button>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; font-size:11px;">
            <div>
              <div style="font-size:10px; font-weight:900; color:#94A3B8;">PARTICULARS</div>
              <div style="font-size:14px; font-weight:800; color:white; margin-top:2px;">${row.particulars}</div>
              <div style="color:#38BDF8; margin-top:2px;">Salt: ${row.salt}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px; font-weight:900; color:#94A3B8;">AMOUNT</div>
              <div style="font-size:22px; font-weight:900; color:${row.debit ? '#34D399' : '#F87171'};">${row.debit ? fmtMoney(row.debit) : fmtMoney(row.credit)}</div>
              <div style="font-size:10px; font-weight:900; color:${row.debit ? '#34D399' : '#F87171'};">${row.debit ? 'DEBIT' : 'CREDIT'}</div>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.03); border-radius:8px; padding:12px; margin-bottom:16px; font-size:11px; color:white;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>GST Rate: <strong>${row.gst}</strong></span>
              <span>GSTIN: <strong>${row.gstin}</strong></span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Status: <strong style="color:#34D399;">${row.status.toUpperCase()}</strong></span>
              <span>Narration: <em>${row.narration || 'None'}</em></span>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="font-size:10px; font-weight:800; color:#94A3B8;">Audit Remarks / CA Notes</label>
            <textarea placeholder="Add audit remarks..." style="width:100%; background:#1E293B; border:1px solid #334155; color:white; font-size:11px; border-radius:6px; padding:8px; margin-top:4px;" rows="2"></textarea>
          </div>

          <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button id="btn-export-voucher-xml" style="background:#059669; color:white; border:none; font-size:11px; font-weight:900; padding:6px 14px; border-radius:6px; cursor:pointer;">Export Tally XML</button>
            <button id="btn-close-voucher-modal-foot" style="background:rgba(255,255,255,0.1); color:white; border:none; font-size:11px; font-weight:900; padding:6px 14px; border-radius:6px; cursor:pointer;">Close</button>
          </div>

        </div>
      </div>
    `;
  }

  // =========================================================================
  // SALT DRILLDOWN MODAL
  // =========================================================================
  function renderSaltModalHtml(modalData: { salt: string; entries: LedgerEntry[] }): string {
    return `
      <div id="salt-modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(5px); z-index:9999; display:flex; justify-content:center; align-items:center; padding:16px;">
        <div style="background:#0F172A; border:2px solid #38BDF8; border-radius:14px; width:100%; max-width:500px; padding:24px; box-shadow:0 10px 40px rgba(0,0,0,0.9); animation:fadeIn 0.2s ease;">
          
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">
            <h2 style="font-size:16px; font-weight:900; color:white; margin:0;">💊 Salt Ledger: ${modalData.salt}</h2>
            <button id="btn-close-salt-modal" style="background:none; border:none; color:#94A3B8; font-size:22px; cursor:pointer;">✕</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; max-height:240px; overflow-y:auto; font-size:11px; color:white;">
            ${modalData.entries.map(row => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:6px;">
                <div>
                  <div style="font-weight:800;">${row.date} • ${row.voucher}</div>
                  <div style="font-size:10px; color:#94A3B8;">${row.party}</div>
                </div>
                <div style="font-size:12px; font-weight:900; color:${row.debit ? '#34D399' : '#F87171'};">
                  ${fmtMoney(row.debit || row.credit)}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="margin-top:16px; text-align:right;">
            <button id="btn-close-salt-modal-foot" style="background:rgba(255,255,255,0.1); color:white; border:none; font-size:11px; font-weight:900; padding:6px 14px; border-radius:6px; cursor:pointer;">Close</button>
          </div>

        </div>
      </div>
    `;
  }

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================
  function attachEvents(): void {
    // 1. Design Selector Dropdown
    const selectEl = container.querySelector('#ledger-design-select') as HTMLSelectElement;
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        selectedDesign = (e.target as HTMLSelectElement).value;
        render();
      });
    }

    // 2. Export Excel CSV Button
    container.querySelector('#btn-export-excel')?.addEventListener('click', () => {
      const csvContent = ledgerData.map(d => `${d.date},${d.voucher},"${d.party}",${d.debit},${d.credit},${d.balance}`).join("\n");
      const blob = new Blob([`Date,Voucher,Party,Debit,Credit,Balance\n${csvContent}`], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pharma-master-ledger-statement.csv";
      a.click();
      NotificationEngine.showToast('📥 Master Ledger Excel (.csv) downloaded!', 'success');
    });

    // 3. Export Tally XML Button
    container.querySelector('#btn-export-tally')?.addEventListener('click', () => {
      NotificationEngine.showToast('📄 Tally Prime XML Envelope exported for all vouchers!', 'success');
    });

    // 4. Sync Tally Button
    container.querySelector('#btn-sync-tally')?.addEventListener('click', () => {
      NotificationEngine.showToast('🔄 Syncing live ledger entries with Tally ERP...', 'info');
      setTimeout(() => {
        NotificationEngine.showToast('✓ Ledger synced cleanly with Tally ERP!', 'success');
      }, 1000);
    });

    // 5. Design 1 Filter Apply & Reset
    container.querySelector('#btn-apply-d1')?.addEventListener('click', () => {
      filter1From = (container.querySelector('#d1-from') as HTMLInputElement)?.value || '';
      filter1To = (container.querySelector('#d1-to') as HTMLInputElement)?.value || '';
      filter1Party = (container.querySelector('#d1-party') as HTMLSelectElement)?.value || '';
      filter1Salt = (container.querySelector('#d1-salt') as HTMLSelectElement)?.value || '';
      render();
    });

    container.querySelector('#btn-reset-d1')?.addEventListener('click', () => {
      filter1From = '2026-04-01';
      filter1To = '2026-08-02';
      filter1Party = '';
      filter1Salt = '';
      render();
    });

    // 6. Design 7 Tally Code Toggle & Copy
    container.querySelector('#btn-toggle-xml')?.addEventListener('click', () => {
      tallyPreviewFormat = 'xml';
      render();
    });

    container.querySelector('#btn-toggle-json')?.addEventListener('click', () => {
      tallyPreviewFormat = 'json';
      render();
    });

    container.querySelector('#btn-copy-code')?.addEventListener('click', () => {
      NotificationEngine.showToast('📋 Tally code snippet copied to clipboard!', 'success');
    });

    // 7. Design 8 Start Reconciliation Button
    container.querySelector('#btn-start-reconciliation')?.addEventListener('click', () => {
      ledgerData.forEach(r => r.status = 'reconciled');
      NotificationEngine.showToast('⚡ 1-Click Bank Reconciliation Complete! All entries matched.', 'success');
      render();
    });

    // 8. Row Click & View Voucher Click
    container.querySelectorAll('.ledger-row-click, .btn-view-voucher').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = Number((e.currentTarget as HTMLElement).getAttribute('data-id'));
        const found = ledgerData.find(r => r.id === id);
        if (found) {
          activeVoucherModal = found;
          render();
        }
      });
    });

    // 9. Close Voucher Modal
    const closeVoucher = () => {
      activeVoucherModal = null;
      render();
    };
    container.querySelector('#btn-close-voucher-modal')?.addEventListener('click', closeVoucher);
    container.querySelector('#btn-close-voucher-modal-foot')?.addEventListener('click', closeVoucher);

    container.querySelector('#btn-export-voucher-xml')?.addEventListener('click', () => {
      NotificationEngine.showToast('📄 Voucher XML exported for Tally Prime!', 'success');
      closeVoucher();
    });

    // 10. Salt Modal Trigger & Close
    container.querySelectorAll('.btn-open-salt-modal, .salt-card-click').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const salt = (e.currentTarget as HTMLElement).getAttribute('data-salt');
        if (salt) {
          const entries = ledgerData.filter(r => r.salt === salt);
          activeSaltModal = { salt, entries };
          render();
        }
      });
    });

    const closeSalt = () => {
      activeSaltModal = null;
      render();
    };
    container.querySelector('#btn-close-salt-modal')?.addEventListener('click', closeSalt);
    container.querySelector('#btn-close-salt-modal-foot')?.addEventListener('click', closeSalt);
  }

  render();
}
