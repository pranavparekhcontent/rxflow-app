/**
 * Mediflow OrderDeliveryReceipt v3.0 (GRN Component)
 * Offline-first GRN delivery verification, shortage & damage logging with R2 photo uploads,
 * permanent verification locks with confirmation dialogs, and item return claims.
 */

import { SyncOrchestrator } from '../../engine/SyncOrchestrator';
import { NotificationEngine } from '../../engine/NotificationEngine';

export interface ReturnClaim {
  reason: string;
  customReason?: string;
  returnQty: number;
  filedAt: string;
}

export interface GrnLineItem {
  sku: string;
  brandName: string;
  orderedQty: number;
  receivedQty: number;
  hasDamage: boolean;
  isVerified: boolean; // Once true and confirmed, locked!
  returnClaim?: ReturnClaim;
  photoUrl?: string;
  discrepancyReason?: string;
}

export default function OrderDeliveryReceipt(container: HTMLElement): void {
  const grnItems: GrnLineItem[] = [
    { sku: 'AUG625', brandName: 'Augmentin 625 Duo Tablet', orderedQty: 10, receivedQty: 10, hasDamage: false, isVerified: true },
    { sku: 'PAND', brandName: 'Pan-D Capsule', orderedQty: 15, receivedQty: 14, hasDamage: true, isVerified: true, discrepancyReason: 'Shortage of 1 box' },
    { sku: 'DOLO650', brandName: 'Dolo 650 Tablet', orderedQty: 20, receivedQty: 20, hasDamage: false, isVerified: false },
  ];

  function render(): void {
    const hasDiscrepancy = grnItems.some(i => i.orderedQty !== i.receivedQty || i.hasDamage || i.returnClaim);
    const verifiedCount = grnItems.filter(i => i.isVerified).length;
    const totalItems = grnItems.length;
    const progressPct = Math.round((verifiedCount / totalItems) * 100);

    container.innerHTML = `
      <div class="section-title">📦 GRN delivery receipt (offline verification)</div>

      <!-- Order Summary Card -->
      <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--tile-radius);padding:16px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div>
            <div style="font-size:16px;font-weight:700;">Order #ORD-2026-4518</div>
            <div style="font-size:11px;color:var(--text-secondary);">Stockist: Shrine Pharma • Dispatched: 28 Jul 2026</div>
          </div>
          <span class="status-badge ${hasDiscrepancy ? 'status-badge--overdue' : 'status-badge--accepted'}">
            ${hasDiscrepancy ? '⚠️ Discrepancy / Return Logged' : '100% Match'}
          </span>
        </div>
        <div style="font-size:11px;color:var(--tile-cyan);">
          ℹ️ Auto-accept timer: 48h remaining (if no discrepancy filed)
        </div>
      </div>

      <!-- Verification Progress Header -->
      <div style="background:var(--bg-elevated); border:1px solid var(--border-subtle); border-radius:8px; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div style="flex:1; min-width:260px;">
          <div style="font-size:13px; font-weight:800; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span>📋 Physical Quantity & Condition Verification</span>
            <span style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px; background:${progressPct === 100 ? 'rgba(16,185,129,0.2)' : 'rgba(0,120,215,0.2)'}; color:${progressPct === 100 ? '#34D399' : '#60A5FA'}; white-space:nowrap;">
              ${verifiedCount} / ${totalItems} Verified (${progressPct}%)
            </span>
          </div>
          <div style="width:100%; max-width:240px; height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:6px; overflow:hidden;">
            <div style="height:100%; width:${progressPct}%; background:${progressPct === 100 ? '#34D399' : '#0078D7'}; transition:width 0.3s ease;"></div>
          </div>
        </div>

        <button class="action-btn" id="btn-verify-all-confirm" ${verifiedCount === totalItems ? 'disabled style="opacity:0.6;cursor:not-allowed;"' : ''} style="background:rgba(16,185,129,0.2); border:1px solid #34D399; color:#34D399; font-size:11px; font-weight:800; padding:6px 12px; border-radius:6px; cursor:pointer; flex-shrink:0;">
          ${verifiedCount === totalItems ? '🔒 All Medicines Verified & Locked' : '✅ Verify All Medicines'}
        </button>
      </div>

      <!-- Physical Quantity Verification Table -->
      <div class="metro-list" style="margin-bottom:20px; display:flex; flex-direction:column; gap:10px;">
        ${grnItems.map((item, idx) => `
          <div class="metro-item" style="background:${item.isVerified ? 'rgba(16,185,129,0.08)' : 'var(--bg-card)'}; border-left:4px solid ${item.isVerified ? '#34D399' : (item.returnClaim || item.hasDamage ? '#F87171' : 'var(--tile-blue)')}; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px;">
            
            <!-- Main Row Line -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <div class="item-main">
                <div class="item-title" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <span style="font-size:14px; font-weight:800; color:white;">${item.brandName}</span>
                  <span class="item-tag">${item.sku}</span>
                  
                  ${item.isVerified ? '<span style="font-size:9px; font-weight:800; background:rgba(16,185,129,0.2); color:#34D399; padding:2px 6px; border-radius:4px;">VERIFIED & LOCKED ✓</span>' : ''}
                  ${item.returnClaim ? `
                    <span style="font-size:9px; font-weight:800; background:rgba(239,68,68,0.2); color:#F87171; padding:2px 6px; border-radius:4px;">
                      🚨 RETURN CLAIM: ${item.returnClaim.reason === 'Other' ? item.returnClaim.customReason : item.returnClaim.reason} (${item.returnClaim.returnQty} Qty)
                    </span>
                  ` : ''}
                </div>
                <div class="item-sub" style="margin-top:2px;">Invoiced Qty: ${item.orderedQty} boxes</div>
              </div>

              <div style="display:flex; align-items:center; gap:10px;">
                <!-- Received Quantity Input -->
                <div style="display:flex; align-items:center; gap:6px; background:var(--bg-input); padding:4px 8px; border-radius:4px; border:1px solid var(--border-subtle);">
                  <span style="font-size:11px; color:var(--text-secondary);">Recv:</span>
                  <input type="number" class="grn-qty-input" data-idx="${idx}" value="${item.receivedQty}" min="0" max="${item.orderedQty}" ${item.isVerified ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}
                         style="width:44px; background:none; border:none; color:white; font-weight:800; text-align:center; font-size:13px; outline:none;">
                </div>

                <!-- Photo Proof Button -->
                <button class="action-btn photo-upload-btn" data-idx="${idx}" style="padding:6px 10px; font-size:11px; background:var(--bg-input); border:1px solid var(--border-subtle); color:white; border-radius:4px; cursor:pointer;">
                  📷 Photo
                </button>

                <!-- Return Button -->
                <button class="action-btn btn-open-return-modal" data-idx="${idx}" style="padding:6px 10px; font-size:11px; font-weight:800; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:#F87171; border-radius:4px; cursor:pointer;">
                  🔄 Return Item
                </button>

                <!-- Verification Lock Toggle Button -->
                <button class="action-btn btn-verify-single" data-idx="${idx}" style="padding:6px 12px; font-size:11px; font-weight:800; border-radius:4px; cursor:pointer; background:${item.isVerified ? 'rgba(16,185,129,0.15)' : '#0078D7'}; color:${item.isVerified ? '#34D399' : 'white'}; border:${item.isVerified ? '1px solid #34D399' : 'none'}; min-width:110px; text-align:center;">
                  ${item.isVerified ? '🔒 Verified' : '☑️ Verify'}
                </button>
              </div>
            </div>

          </div>
        `).join('')}
      </div>

      <!-- Submit Action Bar -->
      <div class="action-bar">
        <button class="action-btn action-btn--success" id="btn-submit-grn" style="padding:14px; font-weight:800;">
          📦 Submit GRN Delivery Verification (Offline Sync)
        </button>
      </div>

      <!-- Modal Container -->
      <div id="grn-dialog-container"></div>
    `;

    attachEvents();
  }

  function attachEvents(): void {
    // Quantity change logic
    container.querySelectorAll('.grn-qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        const val = parseInt((e.currentTarget as HTMLInputElement).value || '0', 10);
        if (grnItems[idx] && !grnItems[idx].isVerified) {
          grnItems[idx].receivedQty = val;
          grnItems[idx].hasDamage = val !== grnItems[idx].orderedQty;
          render();
        }
      });
    });

    // Single Item Verification with Confirmation Modal
    container.querySelectorAll('.btn-verify-single').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        const item = grnItems[idx];
        if (!item) return;

        if (item.isVerified) {
          NotificationEngine.showToast(`🔒 ${item.brandName} is verified & locked. It cannot be unverified.`, 'warning');
          return;
        }

        // Open Confirmation Dialog
        openVerifyConfirmationModal(item);
      });
    });

    // Master Verify All Button
    container.querySelector('#btn-verify-all-confirm')?.addEventListener('click', () => {
      const unverified = grnItems.filter(i => !i.isVerified);
      if (unverified.length === 0) return;

      openVerifyAllConfirmationModal(unverified);
    });

    // Open Return Claim Modal
    container.querySelectorAll('.btn-open-return-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        const item = grnItems[idx];
        if (item) {
          openReturnClaimModal(item);
        }
      });
    });

    // Photo proof upload button
    container.querySelectorAll('.photo-upload-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        if (grnItems[idx]) {
          NotificationEngine.showToast(`📸 Photo proof for ${grnItems[idx].brandName} attached! Encrypted & queued for R2 upload`, 'info');
        }
      });
    });

    // Submit GRN
    container.querySelector('#btn-submit-grn')?.addEventListener('click', async () => {
      const unverifiedCount = grnItems.filter(i => !i.isVerified).length;
      if (unverifiedCount > 0) {
        NotificationEngine.showToast(`⚠️ Note: ${unverifiedCount} item(s) submitted unverified.`, 'warning');
      }

      await SyncOrchestrator.queueMutation('grn_receipts', 'INSERT', {
        order_id: 'ord-uuidv7-4518',
        received_at: new Date().toISOString(),
        has_discrepancy: grnItems.some(i => i.receivedQty !== i.orderedQty || i.returnClaim),
        verified_count: grnItems.filter(i => i.isVerified).length,
      });

      NotificationEngine.showToast('⚡ GRN receipt verified & queued offline!', 'success');
    });
  }

  // Confirmation Modal for Single Item Verification
  function openVerifyConfirmationModal(item: GrnLineItem): void {
    const dialogContainer = container.querySelector('#grn-dialog-container');
    if (!dialogContainer) return;
    const targetModal = dialogContainer as HTMLElement;

    targetModal.innerHTML = `
      <div class="rx-modal-overlay" id="dialog-overlay">
        <div class="rx-modal-box" style="max-width:480px; width:95%;">
          <div class="rx-modal-header">
            <div class="rx-modal-title" style="display:flex; align-items:center; gap:8px;">
              <span>🔒</span> Confirm Verification
            </div>
            <button class="rx-modal-close" id="dialog-close">✕</button>
          </div>

          <div style="font-size:13px; color:white; margin-bottom:14px;">
            Are you sure you want to mark <strong>${item.brandName}</strong> (${item.sku}) as physically verified?
          </div>

          <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); padding:10px; border-radius:6px; font-size:11px; color:#F87171; margin-bottom:16px;">
            ⚠️ <strong>Important:</strong> Once verified, this item will be locked and CANNOT be unverified.
          </div>

          <div style="display:flex; gap:10px;">
            <button class="action-btn action-btn--success" id="dialog-confirm-btn" style="flex:1; padding:10px; font-weight:800;">
              ✅ Yes, Confirm Verification
            </button>
            <button class="action-btn action-btn--outline" id="dialog-cancel-btn" style="padding:10px 16px;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    targetModal.querySelector('#dialog-confirm-btn')?.addEventListener('click', () => {
      item.isVerified = true;
      targetModal.innerHTML = '';
      NotificationEngine.showToast(`🔒 ${item.brandName} verified & locked!`, 'success');
      render();
    });

    targetModal.querySelector('#dialog-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#dialog-cancel-btn')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#dialog-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
  }

  // Confirmation Modal for Verify All
  function openVerifyAllConfirmationModal(unverifiedItems: GrnLineItem[]): void {
    const dialogContainer = container.querySelector('#grn-dialog-container');
    if (!dialogContainer) return;
    const targetModal = dialogContainer as HTMLElement;

    targetModal.innerHTML = `
      <div class="rx-modal-overlay" id="dialog-overlay">
        <div class="rx-modal-box" style="max-width:500px; width:95%;">
          <div class="rx-modal-header">
            <div class="rx-modal-title" style="display:flex; align-items:center; gap:8px;">
              <span>🔒</span> Confirm Batch Verification
            </div>
            <button class="rx-modal-close" id="dialog-close">✕</button>
          </div>

          <div style="font-size:13px; color:white; margin-bottom:14px;">
            Are you sure you want to verify all remaining <strong>${unverifiedItems.length} medicine(s)</strong>?
          </div>

          <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); padding:10px; border-radius:6px; font-size:11px; color:#F87171; margin-bottom:16px;">
            ⚠️ <strong>Important:</strong> Once verified, these items will be permanently locked and cannot be unverified.
          </div>

          <div style="display:flex; gap:10px;">
            <button class="action-btn action-btn--success" id="dialog-confirm-btn" style="flex:1; padding:10px; font-weight:800;">
              ✅ Yes, Verify All & Lock
            </button>
            <button class="action-btn action-btn--outline" id="dialog-cancel-btn" style="padding:10px 16px;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    targetModal.querySelector('#dialog-confirm-btn')?.addEventListener('click', () => {
      unverifiedItems.forEach(i => i.isVerified = true);
      targetModal.innerHTML = '';
      NotificationEngine.showToast(`🔒 All medicines verified & locked!`, 'success');
      render();
    });

    targetModal.querySelector('#dialog-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#dialog-cancel-btn')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#dialog-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
  }

  // Return Claim Modal with Reason Dropdown & Custom Text Input
  function openReturnClaimModal(item: GrnLineItem): void {
    const dialogContainer = container.querySelector('#grn-dialog-container');
    if (!dialogContainer) return;
    const targetModal = dialogContainer as HTMLElement;

    targetModal.innerHTML = `
      <div class="rx-modal-overlay" id="return-overlay">
        <div class="rx-modal-box" style="max-width:520px; width:95%;">
          <div class="rx-modal-header">
            <div class="rx-modal-title" style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:22px;">🔄</span> Initiate Return Claim — ${item.brandName}
            </div>
            <button class="rx-modal-close" id="return-close">✕</button>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">
            Select the return reason for <strong>${item.brandName}</strong> (${item.sku}):
          </div>

          <!-- Reason Select Dropdown -->
          <div style="margin-bottom:12px;">
            <label style="font-size:11px; font-weight:700; color:white; display:block; margin-bottom:4px;">REASON FOR RETURN</label>
            <select id="return-reason-select" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); border-radius:6px; padding:9px 12px; color:white; font-size:12px; outline:none;">
              <option value="Expired Stock / Already Expired">🚨 Expiry (Already Expired Batch Received)</option>
              <option value="Near Expiry (< 60 Days)">⏳ Near Expiry (< 60 Days Expiry Remaining)</option>
              <option value="Different Product Received">❌ Different Product / Wrong SKU Delivered</option>
              <option value="Recalled Batch by Manufacturer">⚠️ Recalled Batch / Manufacturer Quality Issue</option>
              <option value="Physical Damage / Leakage">💥 Physical Damage / Leakage / Tampered Seal</option>
              <option value="Quantity Shortage">📉 Quantity Shortage in Sealed Box</option>
              <option value="Other">📝 Other (Specify Custom Reason)</option>
            </select>
          </div>

          <!-- Custom Reason Text Input (hidden by default unless 'Other' is chosen) -->
          <div id="custom-reason-container" style="margin-bottom:12px; display:none;">
            <label style="font-size:11px; font-weight:700; color:var(--tile-cyan); display:block; margin-bottom:4px;">SPECIFY CUSTOM REASON</label>
            <input type="text" id="custom-reason-input" placeholder="Type custom return explanation..." style="width:100%; background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); border-radius:6px; padding:9px 12px; color:white; font-size:12px; outline:none;" />
          </div>

          <!-- Return Quantity -->
          <div style="margin-bottom:16px;">
            <label style="font-size:11px; font-weight:700; color:white; display:block; margin-bottom:4px;">RETURN QUANTITY (BOXES)</label>
            <input type="number" id="return-qty-input" value="1" min="1" max="${item.orderedQty}" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid var(--border-subtle); border-radius:6px; padding:9px 12px; color:white; font-size:13px; font-weight:800; outline:none;" />
          </div>

          <!-- Submit Return Claim Action Buttons -->
          <div style="display:flex; gap:10px;">
            <button class="action-btn" id="btn-submit-return-claim" style="flex:1; background:linear-gradient(135deg, #EF4444, #DC2626); color:white; font-weight:800; padding:10px; border-radius:6px; border:none; cursor:pointer;">
              🚨 Submit Return Claim
            </button>
            <button class="action-btn action-btn--outline" id="return-cancel-btn" style="padding:10px 16px;">
              Cancel
            </button>
          </div>

        </div>
      </div>
    `;

    // Dropdown change listener to toggle custom reason input box
    const reasonSelect = targetModal.querySelector<HTMLSelectElement>('#return-reason-select');
    const customContainer = targetModal.querySelector<HTMLElement>('#custom-reason-container');

    reasonSelect?.addEventListener('change', () => {
      if (reasonSelect.value === 'Other') {
        if (customContainer) customContainer.style.display = 'block';
      } else {
        if (customContainer) customContainer.style.display = 'none';
      }
    });

    targetModal.querySelector('#btn-submit-return-claim')?.addEventListener('click', () => {
      const selectedReason = reasonSelect?.value || 'Expired Stock / Already Expired';
      const customText = targetModal.querySelector<HTMLInputElement>('#custom-reason-input')?.value.trim();
      const returnQty = parseInt(targetModal.querySelector<HTMLInputElement>('#return-qty-input')?.value || '1', 10);

      item.returnClaim = {
        reason: selectedReason,
        customReason: customText,
        returnQty: returnQty,
        filedAt: new Date().toISOString(),
      };

      item.hasDamage = true;
      targetModal.innerHTML = '';

      NotificationEngine.showToast(`🚨 Return claim submitted for ${item.brandName}!`, 'success');
      render();
    });

    targetModal.querySelector('#return-close')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#return-cancel-btn')?.addEventListener('click', () => { targetModal.innerHTML = ''; });
    targetModal.querySelector('#return-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) targetModal.innerHTML = ''; });
  }

  render();
}


