/**
 * RxFlow LicenseEngine v3.0
 * Ported from DEV TOOLS / appstart (license.js & keystore.js) & pharma_keygen.html.
 * 
 * Features:
 * - 10-digit Base72 license key encoder & decoder
 * - 6-bit checksum XOR signature verification
 * - 40-bit entity name + 15-bit expiry date payload
 * - 3-Layer KeyStore persistence (Cookie + IndexedDB + localStorage)
 */

// ---------- 10-Digit Base72 License Core ----------

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()";
const BASE = BigInt(ALPHABET.length); // 72
const NAME_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ. -"; // 30 char lookup

export interface LicenseValidationResult {
  ok: boolean;
  reason?: 'invalid' | 'expired' | 'missing';
  entityName?: string;
  expiryDate?: Date;
  daysLeft?: number;
  message?: string;
}

export interface LicenseKeyDetails {
  key: string;
  entityName: string;
  expiryDate: Date;
}

function encodeName(name: string): bigint {
  let val = 0n;
  const clean = name.toUpperCase().padEnd(8, ' ').slice(0, 8);
  for (let i = 0; i < 8; i++) {
    let charIdx = NAME_CHARS.indexOf(clean[i]);
    if (charIdx === -1) charIdx = 0;
    val = (val << 5n) | BigInt(charIdx);
  }
  return val; // 40 bits
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
 * Validate a 10-digit Base72 key (checks checksum & expiry).
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

/**
 * Generate a 10-digit Base72 key for an entity name and expiry date.
 */
export function generateLicenseKey(entityName: string, expiryDate: Date): string {
  if (!entityName || entityName.trim().length === 0) {
    throw new Error('Entity name is required');
  }

  const year = BigInt(expiryDate.getFullYear() - 2024) & 63n;
  const month = BigInt(expiryDate.getMonth() + 1) & 15n;
  const day = BigInt(expiryDate.getDate()) & 31n;
  const datePart = (year << 9n) | (month << 5n) | day; // 15 bits

  const namePart = encodeName(entityName); // 40 bits
  const data = (datePart << 40n) | namePart; // 55 bits

  const checksum = (data ^ 0x5B5B5B5Bn) % 64n; // 6 bits
  let combined = (checksum << 55n) | data; // 61 bits

  let key = "";
  for (let i = 0; i < 10; i++) {
    key = ALPHABET[Number(combined % BASE)] + key;
    combined /= BASE;
  }

  return key;
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

  public async init(): Promise<LicenseValidationResult> {
    const savedKey = await KeyStore.load();
    if (savedKey) {
      return this.activateLicense(savedKey);
    }
    return this.activeValidation;
  }

  public async activateLicense(key: string): Promise<LicenseValidationResult> {
    const result = validateLicenseKey(key);
    if (result.ok) {
      this.activeLicenseKey = key;
      this.activeValidation = result;
      await KeyStore.save(key);
    } else {
      this.activeValidation = result;
    }
    return result;
  }

  public getActiveLicense(): { key: string | null; validation: LicenseValidationResult } {
    return {
      key: this.activeLicenseKey,
      validation: { ...this.activeValidation },
    };
  }

  public async clearLicense(): Promise<void> {
    this.activeLicenseKey = null;
    this.activeValidation = { ok: false, reason: 'missing' };
    await KeyStore.clear();
  }

  public generateDemoKey(entityName: string = 'RXFLOW'): string {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    return generateLicenseKey(entityName, oneYearFromNow);
  }
}

export const LicenseEngine = new LicenseEngineService();
