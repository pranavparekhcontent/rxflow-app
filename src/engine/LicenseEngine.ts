/**
 * RxFlow LicenseEngine v4.0
 * Ported from DEV TOOLS / appstart (license.js & keystore.js) & pharma_keygen.html.
 * 
 * Features:
 * - 10-digit Base72 license key decoder & checksum validator
 * - Google Sheet CSV remote key validation (primary gate)
 * - 3-Layer KeyStore persistence (Cookie + IndexedDB + localStorage)
 * - NO key generator (removed — keys are generated externally via pharma_keygen.html)
 */

// ---------- 10-Digit Base72 License Core ----------

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()";
const BASE = BigInt(ALPHABET.length); // 72
const NAME_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ. -"; // 30 char lookup

// Hardcoded Google Sheet URL for license validation
const GSHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1EZDfaM1PCVyqOoxAuy0iidKSJv31ifc5GIbz204sjJM/gviz/tq?tqx=out:csv";

export interface LicenseValidationResult {
  ok: boolean;
  reason?: 'invalid' | 'expired' | 'missing' | 'not_found' | 'network_error';
  entityName?: string;
  expiryDate?: Date;
  daysLeft?: number;
  message?: string;
}

export interface GSheetClientRow {
  srNo: string;
  clientName: string;
  role: string;
  email: string;
  contact: string;
  licenseKey: string;
  city: string;
  mspcRegNo: string;
  pharmacistLicense: string;
  pin: string;
}

export interface LicenseKeyDetails {
  key: string;
  entityName: string;
  expiryDate: Date;
}

function decodeName(val: bigint): string {
  let name = "";
  for (let i = 0; i < 8; i++) {
    const charIdx = Number((val >> BigInt((7 - i) * 5)) & 31n);
    name += NAME_CHARS[charIdx] || ' ';
  }
  return name.trim();
}

/**
 * Decode a 10-digit Base72 key into entity name & expiry date.
 */
export function decodeLicenseKey(key: string): { entityName: string; expiryDate: Date } {
  if (typeof key !== 'string' || key.trim().length !== 10) {
    throw new Error('License key must be exactly 10 characters.');
  }

  const cleanKey = key.trim();
  let combined = 0n;
  for (const ch of cleanKey) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid character '${ch}' in key.`);
    combined = combined * BASE + BigInt(idx);
  }

  const checksum = (combined >> 55n) & 63n;
  const data = combined & ((1n << 55n) - 1n);
  const expectedChecksum = (data ^ 0x5B5B5B5Bn) % 64n;

  if (checksum !== expectedChecksum) {
    throw new Error('Invalid key signature / corrupted key.');
  }

  const datePart = (data >> 40n) & 0x7FFFn;
  const namePart = data & 0xFFFFFFFFFFn;

  const year = 2024 + Number((datePart >> 9n) & 63n);
  const month = Number((datePart >> 5n) & 15n);
  const day = Number(datePart & 31n);

  const expiryDate = new Date(year, month - 1, day);
  const entityName = decodeName(namePart);

  return { entityName, expiryDate };
}

/**
 * Validate a 10-digit Base72 key locally (checks checksum & expiry).
 */
export function validateLicenseKey(key: string): LicenseValidationResult {
  try {
    const { entityName, expiryDate } = decodeLicenseKey(key);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysLeft = Math.round((expiryDate.getTime() - today.getTime()) / 86_400_000);

    if (expiryDate < today) {
      return {
        ok: false,
        reason: 'expired',
        entityName,
        expiryDate,
        daysLeft,
        message: `License for "${entityName}" expired on ${expiryDate.toLocaleDateString('en-IN')}`,
      };
    }

    return {
      ok: true,
      entityName,
      expiryDate,
      daysLeft,
      message: `Valid license for "${entityName}" (${daysLeft} days remaining)`,
    };
  } catch (err: any) {
    return {
      ok: false,
      reason: 'invalid',
      message: err.message || 'Key validation failed',
    };
  }
}

// ---------- Google Sheet CSV Validation ----------

/**
 * Parse CSV text into rows of string arrays (handles quoted values).
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { cells.push(current.trim()); current = ''; }
      else { current += char; }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

/**
 * Smart column detection — matches header text against keyword patterns.
 * Column order doesn't matter.
 */
const COLUMN_KEYWORDS: Record<string, string[]> = {
  sr_no:              ['sr. no', 'sr no', 'serial', '#'],
  client_name:        ['client name', 'client', 'name', 'college name', 'college'],
  role:               ['role', 'user role', 'type'],
  email:              ['email', 'e-mail', 'mail'],
  contact:            ['contact', 'phone', 'mobile', 'contact no'],
  license_key:        ['license key', 'license', 'key', 'activation', 'licence'],
  city:               ['city', 'location', 'place'],
  mspc_reg_no:        ['mspc reg', 'mspc', 'registration'],
  pharmacist_license: ['pharmacist license', 'pharmacist', 'dl number', 'drug license'],
  pin:                ['pin', 'password', 'passcode'],
};

function buildColumnMap(headerRow: string[]): Record<string, number> {
  const headers = headerRow.map(h => h.toLowerCase().trim());
  const colMap: Record<string, number> = {};

  for (const [field, keywords] of Object.entries(COLUMN_KEYWORDS)) {
    // Sort keywords longest-first so specific matches win
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    for (const kw of sorted) {
      const idx = headers.findIndex(h => h.includes(kw));
      if (idx !== -1) {
        colMap[field] = idx;
        break;
      }
    }
  }

  return colMap;
}

/**
 * Fetch Google Sheet CSV and validate the key against the License Key column.
 * Returns the matched row data or a failure result.
 */
export async function validateAgainstGSheet(key: string): Promise<{
  ok: boolean;
  reason?: string;
  message?: string;
  clientRow?: GSheetClientRow;
}> {
  try {
    const cacheBust = `&t=${Date.now()}`;
    const response = await fetch(GSHEET_CSV_URL + cacheBust, { 
      mode: 'cors',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Sheet fetch failed: HTTP ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      return { ok: false, reason: 'empty_sheet', message: 'License registry is empty.' };
    }

    // Detect header row (first row with 3+ text columns)
    let headerIdx = 0;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const textCount = rows[i].filter(c => c && isNaN(Number(c))).length;
      if (textCount >= 3) {
        headerIdx = i;
        break;
      }
    }

    const colMap = buildColumnMap(rows[headerIdx]);

    if (colMap.license_key === undefined) {
      return { ok: false, reason: 'no_key_column', message: 'License Key column not found in registry.' };
    }

    // Search data rows for matching key
    const trimmedKey = key.trim();
    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      const sheetKey = (row[colMap.license_key] || '').trim();

      if (sheetKey && sheetKey === trimmedKey) {
        const v = (field: string) => (row[colMap[field]] || '').trim();
        return {
          ok: true,
          clientRow: {
            srNo: v('sr_no'),
            clientName: v('client_name'),
            role: v('role'),
            email: v('email'),
            contact: v('contact'),
            licenseKey: v('license_key'),
            city: v('city'),
            mspcRegNo: v('mspc_reg_no'),
            pharmacistLicense: v('pharmacist_license'),
            pin: v('pin'),
          },
        };
      }
    }

    return { ok: false, reason: 'not_found', message: 'License key not found in registry. Contact your administrator.' };
  } catch (err: any) {
    console.warn('[LicenseEngine] GSheet validation failed:', err);
    return { ok: false, reason: 'network_error', message: err.message || 'Failed to connect to license registry.' };
  }
}

// ---------- Multi-Layer KeyStore (Cookie + IDB + LocalStorage) ----------

const STORAGE_KEY = 'rxflow_license_key';
const DB_NAME = 'rxflow_keystore_db';
const DB_STORE = 'keystore';

class KeyStoreEngine {
  private idb: IDBDatabase | null = null;

  // Cookie Layer
  private saveCookie(val: string): void {
    try {
      const exp = new Date();
      exp.setDate(exp.getDate() + 365);
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(val)};expires=${exp.toUTCString()};path=/;SameSite=Strict${isSecure ? ';Secure' : ''}`;
    } catch {}
  }

  private loadCookie(): string | null {
    try {
      const prefix = `${STORAGE_KEY}=`;
      for (const part of document.cookie.split(';')) {
        const c = part.trim();
        if (c.startsWith(prefix)) {
          return decodeURIComponent(c.slice(prefix.length)) || null;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private clearCookie(): void {
    try {
      document.cookie = `${STORAGE_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
    } catch {}
  }

  // IndexedDB Layer
  private async openIDB(): Promise<IDBDatabase> {
    if (this.idb) return this.idb;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e: any) => e.target.result.createObjectStore(DB_STORE);
      req.onsuccess = (e: any) => {
        this.idb = e.target.result;
        resolve(this.idb!);
      };
      req.onerror = () => reject(req.error);
    });
  }

  private async saveIDB(val: string): Promise<void> {
    try {
      const db = await this.openIDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(val, STORAGE_KEY);
    } catch {}
  }

  private async loadIDB(): Promise<string | null> {
    try {
      const db = await this.openIDB();
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(STORAGE_KEY);
      return new Promise((res) => {
        req.onsuccess = () => res(req.result || null);
        req.onerror = () => res(null);
      });
    } catch {
      return null;
    }
  }

  private async clearIDB(): Promise<void> {
    try {
      const db = await this.openIDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(STORAGE_KEY);
    } catch {}
  }

  // Multi-Layer Save (Cookie + IDB + LocalStorage)
  public async save(key: string): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {}
    this.saveCookie(key);
    await this.saveIDB(key);
  }

  // Multi-Layer Load (checks LS -> Cookie -> IDB)
  public async load(): Promise<string | null> {
    let key: string | null = null;
    try {
      key = localStorage.getItem(STORAGE_KEY);
    } catch {}

    if (!key) key = this.loadCookie();
    if (!key) key = await this.loadIDB();

    // Re-sync across all 3 layers if found in any 1 layer
    if (key) {
      this.save(key);
    }
    return key;
  }

  // Multi-Layer Clear
  public async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.clearCookie();
    await this.clearIDB();
  }
}

export const KeyStore = new KeyStoreEngine();

// ---------- High-Level LicenseEngine API ----------

class LicenseEngineService {
  private activeLicenseKey: string | null = null;
  private activeValidation: LicenseValidationResult = { ok: false, reason: 'missing' };
  private activeClientRow: GSheetClientRow | null = null;

  public async init(): Promise<LicenseValidationResult> {
    const savedKey = await KeyStore.load();
    if (savedKey) {
      return this.activateLicense(savedKey);
    }
    return this.activeValidation;
  }

  /**
   * Activate a license key — validates locally (Base72 checksum + expiry)
   * and optionally against Google Sheet if online.
   */
  public async activateLicense(key: string): Promise<LicenseValidationResult> {
    // Step 1: Local Base72 decode + expiry validation
    const localResult = validateLicenseKey(key);

    if (localResult.ok) {
      this.activeLicenseKey = key;
      this.activeValidation = localResult;
      await KeyStore.save(key);
    } else {
      this.activeValidation = localResult;
    }

    return localResult;
  }

  /**
   * Validate against Google Sheet — checks if the key exists in the remote registry.
   * This is the primary gate for new activations.
   */
  public async validateRemote(key: string): Promise<{
    ok: boolean;
    reason?: string;
    message?: string;
    clientRow?: GSheetClientRow;
  }> {
    const result = await validateAgainstGSheet(key);
    if (result.ok && result.clientRow) {
      this.activeClientRow = result.clientRow;
    }
    return result;
  }

  public getActiveLicense(): { key: string | null; validation: LicenseValidationResult } {
    return {
      key: this.activeLicenseKey,
      validation: { ...this.activeValidation },
    };
  }

  public getActiveClientRow(): GSheetClientRow | null {
    return this.activeClientRow ? { ...this.activeClientRow } : null;
  }

  public async clearLicense(): Promise<void> {
    this.activeLicenseKey = null;
    this.activeValidation = { ok: false, reason: 'missing' };
    this.activeClientRow = null;
    await KeyStore.clear();
  }
}

export const LicenseEngine = new LicenseEngineService();
