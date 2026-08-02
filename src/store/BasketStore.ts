/**
 * RxFlow Centralized Basket Store v3.0
 * Unified persistent store for managing items in the retailer's multi-distributor basket.
 */

export interface BasketItem {
  id: string;
  sku: string;
  brandName: string;
  genericSalt: string;
  category: string;
  packSize: string;
  qty: number;
  ptr: number;
  gstPct: number;
  schemeText?: string;
  distributorId: string;
  distributorName: string;
  distributorPhone: string;
  movAmount: number;
  creditAvailable: number;
}

const BASKET_STORAGE_KEY = 'rxflow_retailer_basket';

// Initial default items if basket is empty
const INITIAL_BASKET_ITEMS: BasketItem[] = [
  {
    id: 'bsk-1',
    sku: 'AUG625',
    brandName: 'Augmentin 625 Duo Tablet',
    genericSalt: 'Amoxycillin 500mg + Clav 125mg',
    category: 'Schedule H1',
    packSize: '10x10',
    qty: 10,
    ptr: 142.50,
    gstPct: 12,
    schemeText: 'Buy 10 Get 2 Free',
    distributorId: 'dist-shrine-001',
    distributorName: 'Shrine Pharma Stockist',
    distributorPhone: '+91 98220 12345',
    movAmount: 500,
    creditAvailable: 85400,
  },
  {
    id: 'bsk-2',
    sku: 'PAND',
    brandName: 'Pan-D Capsule',
    genericSalt: 'Pantoprazole 40mg + Domperidone',
    category: 'Schedule H',
    packSize: '10x10',
    qty: 15,
    ptr: 88.00,
    gstPct: 12,
    schemeText: 'Margin: 24%',
    distributorId: 'dist-shrine-001',
    distributorName: 'Shrine Pharma Stockist',
    distributorPhone: '+91 98220 12345',
    movAmount: 500,
    creditAvailable: 85400,
  },
  {
    id: 'bsk-3',
    sku: 'DOLO650',
    brandName: 'Dolo 650 Tablet',
    genericSalt: 'Paracetamol 650mg Antipyretic',
    category: 'OTC',
    packSize: '15x10',
    qty: 20,
    ptr: 26.80,
    gstPct: 12,
    schemeText: '₹2 Off per box',
    distributorId: 'dist-medico-002',
    distributorName: 'Medico Distributors (Pune)',
    distributorPhone: '+91 98230 20002',
    movAmount: 1000,
    creditAvailable: 32000,
  },
];

class CentralBasketStore {
  private items: BasketItem[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(BASKET_STORAGE_KEY);
      if (saved) {
        this.items = JSON.parse(saved);
      } else {
        this.items = [...INITIAL_BASKET_ITEMS];
        this.saveToStorage();
      }
    } catch {
      this.items = [...INITIAL_BASKET_ITEMS];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(this.items));
    } catch (err) {
      console.warn('[BasketStore] Failed to save to localStorage:', err);
    }
  }

  public getItems(): BasketItem[] {
    return this.items;
  }

  public addItem(item: Partial<BasketItem> & { sku: string; brandName: string }): void {
    const existing = this.items.find(
      i => i.sku === item.sku && (item.distributorId ? i.distributorId === item.distributorId : true)
    );

    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      const newItem: BasketItem = {
        id: `bsk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sku: item.sku,
        brandName: item.brandName,
        genericSalt: item.genericSalt || 'Paracetamol / Formulation',
        category: item.category || 'OTC',
        packSize: item.packSize || '10x10',
        qty: item.qty || 1,
        ptr: item.ptr || 50.00,
        gstPct: item.gstPct || 12,
        schemeText: item.schemeText,
        distributorId: item.distributorId || 'dist-shrine-001',
        distributorName: item.distributorName || 'Shrine Pharma Stockist',
        distributorPhone: item.distributorPhone || '+91 98220 12345',
        movAmount: item.movAmount || 500,
        creditAvailable: item.creditAvailable || 85400,
      };
      this.items.push(newItem);
    }

    this.saveToStorage();
  }

  public modifyQty(itemId: string, delta: number): void {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      this.saveToStorage();
    }
  }

  public removeItem(itemId: string): void {
    const idx = this.items.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this.saveToStorage();
    }
  }

  public clearBasket(): void {
    this.items = [];
    this.saveToStorage();
  }

  public getTotalCount(): number {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  }
}

export const BasketStore = new CentralBasketStore();
