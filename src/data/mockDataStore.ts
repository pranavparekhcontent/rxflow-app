/**
 * RxFlow Centralized Master Data Store v3.0
 * 
 * 100% Complete & Cleaned Master Data:
 * - 10 Retailers (Retailer R1 to Retailer R10)
 * - 10 Distributors (Distributor D1 to Distributor D10)
 * - 10 Manufacturers (Manufacturer M1 to Manufacturer M10)
 * - 10 Sales Reps (SalesRep S1 to SalesRep S10)
 * - 30 Brands (Brand B1 to Brand B30)
 * - 20 Generic Brands & Salts across categories (OTC, Schedule H, Schedule H1, Schedule X, Schedule M)
 * - Sample Catalogs per Manufacturer (M1..M10)
 * - Distributor Offers & Schemes (D1..D10)
 * - Custom Credit Limits & Credit Days per Distributor → Retailer
 */

export interface Retailer {
  id: string;
  code: string;
  name: string;
  owner: string;
  phone: string;
  city: string;
  dlNumber: string;
  dlStatus: 'verified' | 'pending';
}

export interface Distributor {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  gstin: string;
  mov: number;
}

export interface Manufacturer {
  id: string;
  code: string;
  name: string;
  brandCode: string;
  phone: string;
  city: string;
}

export interface SalesRep {
  id: string;
  code: string;
  name: string;
  phone: string;
  distributorId: string;
  distributorName: string;
  beat: string;
}

export interface Product {
  id: string;
  sku: string;
  brandName: string;
  genericSalt: string;
  category: 'OTC' | 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'Schedule M (Herbal)';
  dosageForm: string;
  packSize: string;
  mrp: number;
  ptr: number;
  pts: number;
  manufacturerId: string;
  manufacturerName: string;
  isScheduleX: boolean;
  isScheduleH1: boolean;
  schemeTag?: string;
  stockQty: number;
}

export interface Scheme {
  id: string;
  distributorId: string;
  distributorName: string;
  schemeName: string;
  schemeType: 'Buy X Get Y' | 'Flat Discount %' | 'Clearance';
  brandName: string;
  sku: string;
  buyQty: number;
  getQty: number;
  discountPct: number;
  validity: string;
}

export interface CreditRelation {
  id: string;
  distributorId: string;
  distributorName: string;
  retailerId: string;
  retailerName: string;
  salesRepName: string;
  creditLimit: number;
  creditDays: number;
  currentBalance: number;
  isBlocked: boolean;
}

// ----------------------------------------------------------------------------
// 1. 10 RETAILERS (R1 to R10)
// ----------------------------------------------------------------------------
export const RETAILERS: Retailer[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  return {
    id: `ret-r${num}`,
    code: `R${num}`,
    name: `Retailer R${num} (Pharma Medicals)`,
    owner: `Owner R${num}`,
    phone: `+91 98220 ${10000 + num}`,
    city: 'Pune',
    dlNumber: `MH-MZ2-4820${10 + num}`,
    dlStatus: 'verified',
  };
});

// ----------------------------------------------------------------------------
// 2. 10 DISTRIBUTORS (D1 to D10)
// ----------------------------------------------------------------------------
export const DISTRIBUTORS: Distributor[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  return {
    id: `dist-d${num}`,
    code: `D${num}`,
    name: `Distributor D${num} (Stockist Agencies)`,
    contactPerson: `Manager D${num}`,
    phone: `+91 98230 ${20000 + num}`,
    city: 'Pune',
    gstin: `27AAAAA${1000 + num}A1Z${num}`,
    mov: 500 + num * 200,
  };
});

// ----------------------------------------------------------------------------
// 3. 10 MANUFACTURERS (M1 to M10)
// ----------------------------------------------------------------------------
export const MANUFACTURERS: Manufacturer[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  return {
    id: `mfg-m${num}`,
    code: `M${num}`,
    name: `Manufacturer M${num} (Pharma Labs Ltd)`,
    brandCode: `MFG-M${num}`,
    phone: `+91 98240 ${30000 + num}`,
    city: 'Mumbai',
  };
});

// ----------------------------------------------------------------------------
// 4. 10 SALES REPS (S1 to S10)
// ----------------------------------------------------------------------------
export const SALES_REPS: SalesRep[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  const dist = DISTRIBUTORS[i % DISTRIBUTORS.length];
  return {
    id: `rep-s${num}`,
    code: `S${num}`,
    name: `SalesRep S${num} (Field Exec)`,
    phone: `+91 98250 ${40000 + num}`,
    distributorId: dist.id,
    distributorName: dist.name,
    beat: `Beat Zone Z${num} (Pune)`,
  };
});

// ----------------------------------------------------------------------------
// 5. 30 BRANDS & 20 GENERICS ACROSS CATEGORIES (OTC, Schedule H, H1, X, M)
// ----------------------------------------------------------------------------
const SALTS_20 = [
  { salt: 'Paracetamol 650mg', category: 'OTC' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Pantoprazole + Domperidone', category: 'Schedule H' as const, form: 'Capsule', isX: false, isH1: false },
  { salt: 'Amoxycillin + Clavulanic Acid 625mg', category: 'Schedule H1' as const, form: 'Tablet', isX: false, isH1: true },
  { salt: 'Alprazolam 0.5mg Anxiolytic', category: 'Schedule X' as const, form: 'Tablet', isX: true, isH1: false },
  { salt: 'Azithromycin 500mg Antibiotic', category: 'Schedule H' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Calcium 500mg + Vitamin D3', category: 'OTC' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Vitamin B Complex + Zinc Multi', category: 'OTC' as const, form: 'Capsule', isX: false, isH1: false },
  { salt: 'Ibuprofen 400mg + Paracetamol 325mg', category: 'Schedule H' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Herbal Liver Protection Drops', category: 'Schedule M (Herbal)' as const, form: 'Syrup', isX: false, isH1: false },
  { salt: 'Magaldrate 540mg + Simethicone 50mg', category: 'OTC' as const, form: 'Suspension', isX: false, isH1: false },
  { salt: 'Fexofenadine 120mg Antihistamine', category: 'Schedule H' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Pantoprazole 40mg Gastro', category: 'Schedule H' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Metronidazole 400mg Antibacterial', category: 'Schedule H' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Cefixime 200mg Broad Spectrum', category: 'Schedule H1' as const, form: 'Tablet', isX: false, isH1: true },
  { salt: 'Ciprofloxacin 500mg Antibiotic', category: 'Schedule H1' as const, form: 'Tablet', isX: false, isH1: true },
  { salt: 'Montelukast 10mg + Levocetirizine 5mg', category: 'Schedule H' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Deriphyllin Bronchodilator 150mg', category: 'Schedule H' as const, form: 'Tablet', isX: false, isH1: false },
  { salt: 'Ambroxol + Levosalbutamol Cough Solution', category: 'Schedule H' as const, form: 'Syrup', isX: false, isH1: false },
  { salt: 'Povidone Iodine 10% Topical Ointment', category: 'Schedule M (Herbal)' as const, form: 'Ointment', isX: false, isH1: false },
  { salt: 'Diclofenac 50mg + Paracetamol 325mg Gel', category: 'Schedule H' as const, form: 'Gel', isX: false, isH1: false },
];

export const PRODUCTS: Product[] = Array.from({ length: 30 }, (_, i) => {
  const num = i + 1;
  const saltObj = SALTS_20[i % SALTS_20.length];
  const mfg = MANUFACTURERS[i % MANUFACTURERS.length];
  const baseMrp = 40 + num * 8;
  const ptr = Math.round(baseMrp * 0.7 * 100) / 100;
  const pts = Math.round(baseMrp * 0.6 * 100) / 100;

  return {
    id: `prod-b${num}`,
    sku: `SKU-B${num}`,
    brandName: `Brand B${num} (Pharma Formulation)`,
    genericSalt: saltObj.salt,
    category: saltObj.category,
    dosageForm: saltObj.form,
    packSize: num % 2 === 0 ? '10x10 Strips' : '100ml Bottle',
    mrp: baseMrp,
    ptr,
    pts,
    manufacturerId: mfg.id,
    manufacturerName: mfg.name,
    isScheduleX: saltObj.isX,
    isScheduleH1: saltObj.isH1,
    schemeTag: num % 3 === 0 ? '10+1 Free' : num % 5 === 0 ? 'Flat 15% OFF' : undefined,
    stockQty: 250 + num * 45,
  };
});

// ----------------------------------------------------------------------------
// 6. MANUFACTURER CATALOGS (M1 to M10)
// ----------------------------------------------------------------------------
export const MANUFACTURER_CATALOGS = MANUFACTURERS.map(mfg => {
  const mfgProducts = PRODUCTS.filter(p => p.manufacturerId === mfg.id);
  return {
    manufacturer: mfg,
    catalogName: `${mfg.name} Master Catalog 2026`,
    productsCount: mfgProducts.length,
    products: mfgProducts,
  };
});

// ----------------------------------------------------------------------------
// 7. DISTRIBUTOR OFFERS & SCHEMES (D1 to D10)
// ----------------------------------------------------------------------------
export const DISTRIBUTOR_SCHEMES: Scheme[] = DISTRIBUTORS.map((dist, idx) => {
  const num = idx + 1;
  const prod = PRODUCTS[idx % PRODUCTS.length];
  return {
    id: `sch-d${num}`,
    distributorId: dist.id,
    distributorName: dist.name,
    schemeName: `Scheme S${num}: Special Offer by ${dist.name}`,
    schemeType: num % 2 === 0 ? 'Buy X Get Y' : 'Flat Discount %',
    brandName: prod.brandName,
    sku: prod.sku,
    buyQty: 10 + num,
    getQty: 1 + Math.floor(num / 3),
    discountPct: 5 + num,
    validity: `Valid till Aug ${15 + num}, 2026`,
  };
});

// ----------------------------------------------------------------------------
// 8. CREDIT CONTROL RELATIONS (Distributor D1..D10 → Retailers R1..R10)
// ----------------------------------------------------------------------------
export const CREDIT_RELATIONS: CreditRelation[] = [];
DISTRIBUTORS.forEach((dist, dIdx) => {
  RETAILERS.forEach((ret, rIdx) => {
    const rep = SALES_REPS[(dIdx + rIdx) % SALES_REPS.length];
    const baseLimit = 30000 + (dIdx + 1) * 15000 + (rIdx + 1) * 5000;
    const baseDays = 15 + ((dIdx + rIdx) % 4) * 10; // 15, 25, 35, 45 days
    const balance = Math.round((baseLimit * 0.45 + (rIdx * 1250)) * 100) / 100;

    CREDIT_RELATIONS.push({
      id: `cred-${dist.code}-${ret.code}`,
      distributorId: dist.id,
      distributorName: dist.name,
      retailerId: ret.id,
      retailerName: ret.name,
      salesRepName: rep.name,
      creditLimit: baseLimit,
      creditDays: baseDays,
      currentBalance: balance,
      isBlocked: rIdx === 9 && dIdx % 2 === 0,
    });
  });
});
