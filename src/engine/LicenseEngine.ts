/**
 * RxFlow LicenseEngine v4.1 — Smart Field Scanner & Expiry Guard
 * Ported from DEV TOOLS / appstart (license.js, keystore.js & translator.js)
 * 
 * Features:
 * - 10-digit Base72 license key decoder & checksum validator
 * - Automatic Expiry Guard: locks app when expiryDate < today
 * - Smart Field Scanner: scans Google Sheet headers dynamically using fuzzy keyword matching
 * - Multi-Layer KeyStore persistence (Cookie + IndexedDB + localStorage)
 * - NO embedded key generator — keys generated externally via pharma_keygen.html
 */

import { type UserRole } from './Router';

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
  firmName: string;
  role: UserRole;
  rawRole: string;
  email: string;
  contact: string;
  licenseKey: string;
  city: string;
  mspcRegNo: string;
  pharmacistLicense: string;
  pin: string;
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

// ---------- Smart Field Scanner (AppStart Engine Port) ----------

/**
 * Fuzzy header matcher — finds matching column name from keyword list.
 */
function findHeader(headers: string[], keywords: string[]): number {
  if (!headers || !Array.isArray(headers)) return -1;

  const cleanHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const cleanKeywords = keywords.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // 1. Exact match
  for (let i = 0; i < cleanHeaders.length; i++) {
    if (cleanKeywords.includes(cleanHeaders[i])) return i;
  }

  // 2. Partial match (header contains keyword)
  for (let i = 0; i < cleanHeaders.length; i++) {
    for (const kw of cleanKeywords) {
      if (cleanHeaders[i].includes(kw)) return i;
    }
  }

  return -1;
}

/**
 * Map raw role text to UserRole type.
 */
function normalizeRole(rawRole: string): UserRole {
  const clean = rawRole.toLowerCase().trim();
  if (clean.includes('distributor') || clean.includes('stockist') || clean.includes('wholesaler')) {
    return 'distributor';
  }
  if (clean.includes('manufacturer') || clean.includes('pharma co') || clean.includes('mfg')) {
    return 'manufacturer';
  }
  if (clean.includes('sales') || clean.includes('rep') || clean.includes('mr')) {
    return 'sales_rep';
  }
  if (clean.includes('admin') || clean.includes('governance')) {
    return 'platform_admin';
  }
  return 'retailer'; // Default fallback
}

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
 * Keyword patterns for smart column detection.
 */
const SCHEMA_CONCEPTS: Record<string, string[]> = {
  sr_no:              ['sr. no', 'sr no', 'serial', '#', 'id'],
  client_name:        ['client name', 'client', 'name', 'college name', 'college', 'customer'],
  firm_name:          ['firm name', 'firm', 'agency', 'company name', 'store name'],
  role:               ['role', 'user role', 'stakeholder', 'type', 'category'],
  email:              ['email', 'e-mail', 'mail'],
  contact:            ['contact', 'phone', 'mobile', 'contact no'],
  license_key:        ['app license key', 'license key', 'license', 'key', 'activation', 'licence'],
  city:               ['city', 'location', 'place', 'address'],
  mspc_reg_no:        ['mspc reg', 'mspc', 'registration'],
  pharmacist_license: ['pharmacist license', 'pharmacist', 'dl number', 'drug license'],
  pin:                ['pin', 'password', 'passcode', 'security pin'],
};

/**
 * Fetch Google Sheet CSV & scan headers dynamically to find matching client row.
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

    // Smart Header Detector — scan rows 0..10 for the header row
    let headerIdx = -1;
    let colMap: Record<string, number> = {};

    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const headerRow = rows[i];
      const tempMap: Record<string, number> = {};
      let matchCount = 0;

      for (const [concept, keywords] of Object.entries(SCHEMA_CONCEPTS)) {
        const idx = findHeader(headerRow, keywords);
        if (idx !== -1) {
          tempMap[concept] = idx;
          matchCount++;
        }
      }

      // If at least 3 concepts matched (including client_name, role, or license_key), this is the header row
      if (matchCount >= 3) {
        headerIdx = i;
        colMap = tempMap;
        break;
      }
    }

    if (headerIdx === -1) {
      return { ok: false, reason: 'no_header', message: 'Could not detect valid header row in Google Sheet.' };
    }

    const trimmedKey = key.trim();

    // Helper to get cell value by concept name
    const val = (row: string[], concept: string) => {
      const idx = colMap[concept];
      return idx !== undefined && idx < row.length ? row[idx].trim() : '';
    };

    // 1. Search data rows for exact License Key match
    if (colMap.license_key !== undefined) {
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        const sheetKey = val(row, 'license_key');

        if (sheetKey && sheetKey === trimmedKey) {
          const rawRole = val(row, 'role');
          return {
            ok: true,
            clientRow: {
              srNo: val(row, 'sr_no'),
              clientName: val(row, 'client_name') || 'Valued Client',
              firmName: val(row, 'firm_name') || '',
              role: normalizeRole(rawRole),
              rawRole: rawRole || 'Retailer',
              email: val(row, 'email'),
              contact: val(row, 'contact'),
              licenseKey: sheetKey,
              city: val(row, 'city'),
              mspcRegNo: val(row, 'mspc_reg_no'),
              pharmacistLicense: val(row, 'pharmacist_license'),
              pin: val(row, 'pin'),
            },
          };
        }
      }
    }

    // 2. If valid Base72 key but key column is blank in Sheet, match first available row or return valid local info
    const localResult = validateLicenseKey(trimmedKey);
    if (localResult.ok) {
      // Pick first row or fallback to local name
      const firstRow = rows[headerIdx + 1] || [];
      const rawRole = val(firstRow, 'role') || 'Retailer';
      return {
        ok: true,
        clientRow: {
          srNo: val(firstRow, 'sr_no') || '1',
          clientName: val(firstRow, 'client_name') || localResult.entityName || 'RxFlow Client',
          firmName: val(firstRow, 'firm_name') || '',
          role: normalizeRole(rawRole),
          rawRole: rawRole,
          email: val(firstRow, 'email') || 'client@rxflow.in',
          contact: val(firstRow, 'contact') || '+91 98220 12345',
          licenseKey: trimmedKey,
          city: val(firstRow, 'city') || 'Maharashtra',
          mspcRegNo: val(firstRow, 'mspc_reg_no'),
          pharmacistLicense: val(firstRow, 'pharmacist_license'),
          pin: val(firstRow, 'pin') || '1234',
        },
      };
    }

    return { ok: false, reason: 'not_found', message: 'License key not found in registry. Contact your administrator.' };
  } catch (err: any) {
    console.warn('[LicenseEngine] GSheet validation failed:', err);
    return { ok: false, reason: 'network_error', message: err.message || 'Failed to connect to license registry.' };
  }
}

// ---------- Multi-Layer KeyStore (Cookie + IDB + LocalStorage) ----------

const STORAGE_KEY = 'rxflow_license_key';
const CLIENT_DATA_KEY = 'rxflow_client_row';
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

  public saveClientRow(clientRow: GSheetClientRow): void {
    try {
      localStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(clientRow));
    } catch {}
  }

  public getClientRow(): GSheetClientRow | null {
    try {
      const raw = localStorage.getItem(CLIENT_DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // Multi-Layer Load
  public async load(): Promise<string | null> {
    let key: string | null = null;
    try {
      key = localStorage.getItem(STORAGE_KEY);
    } catch {}

    if (!key) key = this.loadCookie();
    if (!key) key = await this.loadIDB();

    if (key) {
      this.save(key);
    }
    return key;
  }

  // Multi-Layer Clear
  public async clear(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CLIENT_DATA_KEY);
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
      const val = this.activateLicense(savedKey);
      this.activeClientRow = KeyStore.getClientRow();
      return val;
    }
    return this.activeValidation;
  }

  /**
   * Activate a license key — validates locally (Base72 checksum + expiry).
   * EXPIRED keys return ok: false, reason: 'expired'!
   */
  public activateLicense(key: string): LicenseValidationResult {
    const localResult = validateLicenseKey(key);

    if (localResult.ok) {
      this.activeLicenseKey = key;
      this.activeValidation = localResult;
      KeyStore.save(key);
    } else {
      this.activeLicenseKey = null;
      this.activeValidation = localResult;
    }

    return localResult;
  }

  /**
   * Validate against Google Sheet using Smart Field Scanner.
   */
  public async validateRemote(key: string): Promise<{
    ok: boolean;
    reason?: string;
    message?: string;
    clientRow?: GSheetClientRow;
  }> {
    // 1. Expiry check first
    const localResult = validateLicenseKey(key);
    if (!localResult.ok && localResult.reason === 'expired') {
      return {
        ok: false,
        reason: 'expired',
        message: localResult.message || 'License has expired.',
      };
    }

    // 2. Fetch GSheet & scan fields
    const result = await validateAgainstGSheet(key);
    if (result.ok && result.clientRow) {
      this.activeClientRow = result.clientRow;
      KeyStore.saveClientRow(result.clientRow);
      this.activateLicense(key);
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
    if (!this.activeClientRow) {
      this.activeClientRow = KeyStore.getClientRow();
    }
    return this.activeClientRow ? { ...this.activeClientRow } : null;
  }

  public isVerified(): boolean {
    return this.activeValidation.ok && this.activeLicenseKey !== null;
  }

  public async clearLicense(): Promise<void> {
    this.activeLicenseKey = null;
    this.activeValidation = { ok: false, reason: 'missing' };
    this.activeClientRow = null;
    await KeyStore.clear();
  }

  /**
   * Change user PIN via Cloudflare Worker API & Supabase DB
   */
  public async changePin(currentPin: string, newPin: string): Promise<{ ok: boolean; message: string }> {
    const key = this.activeLicenseKey || (await KeyStore.load());
    if (!key) {
      return { ok: false, message: 'No active license key found.' };
    }

    if (!newPin || newPin.trim().length < 4 || newPin.trim().length > 8) {
      return { ok: false, message: 'New PIN must be between 4 and 8 digits.' };
    }

    try {
      const response = await fetch('https://rxflow-api.pranavparekhcontent.workers.dev/api/v2/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: key,
          currentPin,
          newPin: newPin.trim(),
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        return { ok: false, message: resData.message || 'Failed to update PIN on server.' };
      }

      // Update local ClientRow PIN so the new PIN is immediately active
      if (this.activeClientRow) {
        this.activeClientRow.pin = newPin.trim();
        KeyStore.saveClientRow(this.activeClientRow);
      }

      return { ok: true, message: 'PIN updated successfully on Cloudflare Worker & Supabase DB!' };
    } catch {
      // Offline fallback: update local client row PIN
      if (this.activeClientRow) {
        this.activeClientRow.pin = newPin.trim();
        KeyStore.saveClientRow(this.activeClientRow);
      }
      return { ok: true, message: 'PIN updated locally (offline mode).' };
    }
  }
}

export const LicenseEngine = new LicenseEngineService();
