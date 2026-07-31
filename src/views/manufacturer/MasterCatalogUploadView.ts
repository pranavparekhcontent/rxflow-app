/**
 * RxFlow MasterCatalogUploadView v3.0
 * Manufacturers M1 to M10 Master Catalog CSV upload & management interface.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';
import { MANUFACTURERS, MANUFACTURER_CATALOGS } from '../../data/mockDataStore';

export default function MasterCatalogUploadView(container: HTMLElement): void {
  let selectedMfg = MANUFACTURERS[0];
  let isUploading = false;
  let uploadedCount = 0;

  function render(): void {
    const currentCatalog = MANUFACTURER_CATALOGS.find(c => c.manufacturer.id === selectedMfg.id) || MANUFACTURER_CATALOGS[0];

    container.innerHTML = `
      <div class="section-title">📋 Master Catalogs & CSV Upload (Manufacturers M1-M10)</div>

      <!-- Manufacturer Selector -->
      <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;">
        <span style="font-size:12px;color:#aaa;">Select Manufacturer:</span>
        <select id="mfg-select" style="background:#222;color:white;border:1px solid #444;padding:6px 12px;border-radius:6px;font-size:12px;">
          ${MANUFACTURERS.map(m => `<option value="${m.id}" ${m.id === selectedMfg.id ? 'selected' : ''}>${m.name} (${m.code})</option>`).join('')}
        </select>
      </div>

      <!-- Upload Zone Card -->
      <div style="background:var(--bg-card);border:2px dashed var(--border-active);border-radius:var(--tile-radius);padding:24px;text-align:center;margin-bottom:20px;">
        <div style="font-size:40px;margin-bottom:8px;">📁</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:4px;">Upload Catalog for ${selectedMfg.name}</div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:14px;">
          Supports CSV upload • Validated with Zod schema for Brands B1-B30 & Generic Salts
        </div>

        <input type="file" id="csv-file-input" accept=".csv" style="display:none;">
        <button class="action-btn action-btn--primary" id="btn-select-file" style="max-width:220px;margin:0 auto;padding:8px 16px;">
          📂 Select CSV File
        </button>
      </div>

      ${isUploading ? `
        <div style="background:var(--bg-elevated);padding:16px;border-radius:var(--tile-radius);margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
            <span>Processing Catalog Chunks for ${selectedMfg.code}...</span>
            <span>${uploadedCount} / 30 SKUs</span>
          </div>
          <div class="tile-bar-bg" style="height:8px;">
            <div class="tile-bar-fill" style="width:${((uploadedCount / 30) * 100).toFixed(0)}%;"></div>
          </div>
        </div>
      ` : ''}

      <!-- Current Active Catalogs List -->
      <div class="section-title" style="margin-top:20px;margin-bottom:10px;">Existing Master Catalogs (M1-M10)</div>
      <div class="metro-list">
        ${MANUFACTURER_CATALOGS.map(cat => `
          <div class="metro-item metro-item--teal">
            <div class="item-main">
              <div class="item-title">${cat.catalogName}</div>
              <div class="item-sub">${cat.manufacturer.name} • ${cat.productsCount} SKUs Configured</div>
            </div>
            <button class="action-btn test-cat-btn" data-mfg="${cat.manufacturer.id}" style="padding:6px 12px;font-size:11px;">
              ⚡ Run Upload
            </button>
          </div>
        `).join('')}
      </div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    const select = container.querySelector('#mfg-select') as HTMLSelectElement;
    select?.addEventListener('change', (e) => {
      const id = (e.target as HTMLSelectElement).value;
      selectedMfg = MANUFACTURERS.find(m => m.id === id) || MANUFACTURERS[0];
      render();
    });

    container.querySelector('#btn-select-file')?.addEventListener('click', () => startChunkedUpload());

    container.querySelectorAll('.test-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mfgId = (e.currentTarget as HTMLElement).getAttribute('data-mfg');
        selectedMfg = MANUFACTURERS.find(m => m.id === mfgId) || selectedMfg;
        startChunkedUpload();
      });
    });
  }

  function startChunkedUpload(): void {
    isUploading = true;
    uploadedCount = 0;
    render();

    const interval = setInterval(() => {
      uploadedCount += 10;
      render();

      if (uploadedCount >= 30) {
        clearInterval(interval);
        isUploading = false;
        render();
        NotificationEngine.showToast(`📋 Successfully uploaded 30 SKUs to ${selectedMfg.name} Master Catalog!`, 'success');
      }
    }, 400);
  }

  render();
}
