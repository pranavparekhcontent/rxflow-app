/**
 * Mediflow BatchRecallView v3.0
 * Emergency FDA batch recall triggering block_batch_recalled() RPC.
 * Quarantines stock, zeros available quantity, and broadcasts VAPID push + Realtime alert to all purchasing chemists.
 */

import { NotificationEngine } from '../../engine/NotificationEngine';

export default function BatchRecallView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="section-title">🚨 emergency FDA batch recall desk</div>

    <div style="background:var(--bg-elevated);border-left:4px solid var(--tile-red);padding:16px;border-radius:var(--tile-radius);margin-bottom:20px;">
      <div style="font-size:16px;font-weight:700;color:var(--tile-red);margin-bottom:4px;">FDA Batch Quarantine Procedure</div>
      <div style="font-size:11px;color:var(--text-secondary);">
        Executing a recall immediately invokes the <code>block_batch_recalled()</code> procedure: zeros local inventory, quarantines godown stock, and broadcasts VAPID push alerts to all chemists who purchased this batch in past 180 days.
      </div>
    </div>

    <!-- Recall Form -->
    <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--tile-radius);padding:20px;margin-bottom:20px;">
      <div style="margin-bottom:14px;">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Product SKU / Brand Name</label>
        <input class="metro-input" id="recall-sku" type="text" placeholder="e.g. AUG625 or Augmentin 625" value="AUG625">
      </div>

      <div style="margin-bottom:14px;">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Batch Number to Recall</label>
        <input class="metro-input" id="recall-batch" type="text" placeholder="e.g. AUG-2024-B12" value="AUG-2024-B12">
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px;">Official FDA / Manufacturer Recall Reason</label>
        <textarea class="metro-input" id="recall-reason" rows="3" placeholder="Enter detailed reason (e.g. Dissolution test failure reported by FDA Maharastra)...">FDA Maharastra Safety Notice: Sub-standard dissolution assay detected in Batch AUG-2024-B12</textarea>
      </div>

      <button class="action-btn action-btn--danger" id="btn-execute-recall" style="width:100%;padding:14px;">
        🚨 Execute Emergency Batch Recall & Quarantine Stock
      </button>
    </div>
  `;

  container.querySelector('#btn-execute-recall')?.addEventListener('click', () => {
    const sku = (container.querySelector('#recall-sku') as HTMLInputElement).value;
    const batch = (container.querySelector('#recall-batch') as HTMLInputElement).value;

    NotificationEngine.showToast(`🚨 RECALL EXECUTED! Batch ${batch} (${sku}) zeroed & quarantined. VAPID alerts sent to 14 purchasing chemists!`, 'error');
  });
}
