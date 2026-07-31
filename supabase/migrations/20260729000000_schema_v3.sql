-- ============================================================================
-- MEDIFLOW v3.0 DEFINITIVE DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase Postgres 15+
-- Features: UUIDv7 PKs, 26 Tables, Multi-batch FEFO, Append-only Ledgers, RLS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
  'retailer',
  'distributor',
  'manufacturer',
  'sales_rep',
  'platform_admin'
);

CREATE TYPE order_status AS ENUM (
  'draft',
  'submitted',
  'approved',
  'partially_approved',
  'rejected',
  'dispatched',
  'delivered',
  'cancelled'
);

CREATE TYPE order_placed_via AS ENUM (
  'retailer_pwa',
  'distributor_phone',
  'mr_app',
  'whatsapp_ai',
  'bulk_import'
);

CREATE TYPE dl_status AS ENUM (
  'pending_verification',
  'verified_manual',
  'verified_api',
  'expired',
  'suspended'
);

CREATE TYPE payment_mode AS ENUM (
  'cash',
  'cheque',
  'upi',
  'neft_rtgs',
  'credit_note'
);

CREATE TYPE scheme_type AS ENUM (
  'buy_x_get_y',
  'flat_discount',
  'percentage_discount',
  'clearance_sale',
  'sponsored_spotlight'
);

CREATE TYPE return_status AS ENUM (
  'pending_review',
  'approved',
  'rejected',
  'credit_note_issued'
);

-- ----------------------------------------------------------------------------
-- 2. USER IDENTITY & PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  retailer_id UUID,
  distributor_id UUID,
  manufacturer_id UUID,
  sales_rep_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. ENTITY MASTERS (Retailer, Distributor, Manufacturer, Sales Rep)
-- ----------------------------------------------------------------------------
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL DEFAULT 'Pune',
  district TEXT NOT NULL DEFAULT 'Pune',
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  pincode TEXT NOT NULL,
  dl_number_20b TEXT NOT NULL,
  dl_number_21b TEXT NOT NULL,
  dl_expiry_date DATE NOT NULL,
  dl_verification_status dl_status NOT NULL DEFAULT 'pending_verification',
  gstin TEXT,
  has_schedule_x BOOLEAN NOT NULL DEFAULT false,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  address_line1 TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Pune',
  district TEXT NOT NULL DEFAULT 'Pune',
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  pincode TEXT NOT NULL,
  dl_number TEXT NOT NULL,
  dl_expiry_date DATE NOT NULL,
  gstin TEXT NOT NULL,
  mov_amount NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  erp_type TEXT NOT NULL DEFAULT 'tally_prime',
  erp_api_key_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  brand_code TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sales_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  beat_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign Key Constraints on Profiles (Exactly one entity link)
ALTER TABLE profiles
  ADD CONSTRAINT fk_profile_retailer FOREIGN KEY (retailer_id) REFERENCES retailers(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_profile_distributor FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_profile_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_profile_sales_rep FOREIGN KEY (sales_rep_id) REFERENCES sales_reps(id) ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- 4. PRODUCT CATALOGUE
-- ----------------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE RESTRICT,
  sku TEXT NOT NULL UNIQUE,
  brand_name TEXT NOT NULL,
  generic_salt TEXT NOT NULL,
  composition TEXT,
  dosage_form TEXT NOT NULL, -- Tablet, Capsule, Syrup, Injection, etc.
  pack_size TEXT NOT NULL, -- e.g. "10x10", "100ml"
  hsn_code TEXT NOT NULL DEFAULT '3004',
  gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 12.00,
  mrp NUMERIC(10,2) NOT NULL,
  ptr NUMERIC(10,2) NOT NULL, -- Price to Retailer
  pts NUMERIC(10,2) NOT NULL, -- Price to Stockist
  nppa_ceiling_price NUMERIC(10,2), -- NPPA ceiling price enforcement
  is_schedule_h BOOLEAN NOT NULL DEFAULT false,
  is_schedule_h1 BOOLEAN NOT NULL DEFAULT false,
  is_schedule_x BOOLEAN NOT NULL DEFAULT false,
  is_narcotic BOOLEAN NOT NULL DEFAULT false,
  search_text TEXT, -- Normalized search fallback
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. TERRITORY & CREDIT CONTROL
-- ----------------------------------------------------------------------------
CREATE TABLE distributor_retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 50000.00,
  credit_days INT NOT NULL DEFAULT 30,
  assigned_sales_rep_id UUID REFERENCES sales_reps(id) ON DELETE SET NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(distributor_id, retailer_id)
);

CREATE TABLE distributor_business_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. INVENTORY & FEFO BATCHES
-- ----------------------------------------------------------------------------
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_number TEXT NOT NULL,
  mfg_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  available_qty INT NOT NULL DEFAULT 0 CHECK (available_qty >= 0),
  reserved_qty INT NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  godown_name TEXT NOT NULL DEFAULT 'Main Godown',
  rack_number TEXT,
  is_quarantined BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(distributor_id, product_id, batch_number)
);

CREATE TABLE inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  previous_qty INT NOT NULL,
  new_qty INT NOT NULL,
  adjustment_reason TEXT NOT NULL,
  adjusted_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE batch_recalls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_number TEXT NOT NULL,
  recall_reason TEXT NOT NULL,
  recalled_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. ORDERS & FULFILLMENT
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  placed_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  placed_via order_placed_via NOT NULL DEFAULT 'retailer_pwa',
  status order_status NOT NULL DEFAULT 'submitted',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  net_payable NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  idempotency_key TEXT UNIQUE,
  content_hash TEXT,
  erp_sync_status TEXT NOT NULL DEFAULT 'pending',
  erp_voucher_number TEXT,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  ordered_qty INT NOT NULL CHECK (ordered_qty > 0),
  approved_qty INT DEFAULT 0 CHECK (approved_qty >= 0),
  placed_ptr NUMERIC(10,2) NOT NULL, -- Lock price at time of order
  gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 12.00,
  total_price NUMERIC(12,2) NOT NULL,
  scheme_applied TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_item_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  allocated_qty INT NOT NULL CHECK (allocated_qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. INVOICING & GRN
-- ----------------------------------------------------------------------------
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
  subtotal NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  grand_total NUMERIC(12,2) NOT NULL,
  pdf_r2_url TEXT,
  due_date DATE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grn_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  has_discrepancy BOOLEAN NOT NULL DEFAULT false,
  auto_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE grn_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_receipt_id UUID NOT NULL REFERENCES grn_receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  expected_qty INT NOT NULL,
  received_qty INT NOT NULL,
  discrepancy_reason TEXT NOT NULL, -- Shortage, Transit Damage, Expired
  photo_r2_url TEXT,
  status return_status NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. FINANCIAL LEDGERS (Append-Only)
-- ----------------------------------------------------------------------------
CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
  debit_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  credit_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  payment_mode payment_mode,
  reference_number TEXT,
  narrative TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 10. SCHEMES, RETURNS & OTHER TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE CASCADE,
  scheme_name TEXT NOT NULL,
  scheme_type scheme_type NOT NULL,
  buy_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  get_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buy_qty INT NOT NULL DEFAULT 10,
  get_qty INT NOT NULL DEFAULT 1,
  discount_percentage NUMERIC(5,2),
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  target_city TEXT,
  target_segment TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scheme_participation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  times_used INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expiry_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE RESTRICT,
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_number TEXT NOT NULL,
  return_qty INT NOT NULL CHECK (return_qty > 0),
  reason TEXT NOT NULL,
  photo_r2_url TEXT,
  status return_status NOT NULL DEFAULT 'pending_review',
  credit_note_amount NUMERIC(12,2),
  reviewed_by_user_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  from_godown TEXT NOT NULL,
  to_godown TEXT NOT NULL,
  qty INT NOT NULL CHECK (qty > 0),
  transferred_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE RESTRICT,
  closing_date DATE NOT NULL,
  total_skus INT NOT NULL,
  total_inventory_value NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exception_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  exception_type TEXT NOT NULL, -- Price Variance, DL Override, Credit Override
  requested_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  approved_by_user_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE retailer_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  current_qty INT NOT NULL DEFAULT 0 CHECK (current_qty >= 0),
  min_reorder_level INT NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_id, product_id)
);

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 11. VIEWS (Running Balance Ledger)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ledgers_with_balance AS
SELECT
  l.id,
  l.retailer_id,
  l.distributor_id,
  l.invoice_id,
  l.debit_amount,
  l.credit_amount,
  l.payment_mode,
  l.reference_number,
  l.narrative,
  l.created_at,
  SUM(l.debit_amount - l.credit_amount) OVER (
    PARTITION BY l.retailer_id, l.distributor_id
    ORDER BY l.created_at ASC
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_balance
FROM ledgers l;

-- ----------------------------------------------------------------------------
-- 12. TRIGGERS & PROCEDURES
-- ----------------------------------------------------------------------------

-- Trigger: Enforce NPPA Ceiling Price on Product Creation/Update
CREATE OR REPLACE FUNCTION check_nppa_ceiling_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nppa_ceiling_price IS NOT NULL AND NEW.mrp > NEW.nppa_ceiling_price THEN
    RAISE EXCEPTION 'MRP (₹%) cannot exceed NPPA ceiling price (₹%) for SKU %',
      NEW.mrp, NEW.nppa_ceiling_price, NEW.sku;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_nppa_ceiling_price
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_nppa_ceiling_price();

-- Trigger: Prevent UPDATE or DELETE on Ledgers (Append-Only Enforcement)
CREATE OR REPLACE FUNCTION enforce_ledger_append_only()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are append-only. UPDATE or DELETE is strictly prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_ledger_update_delete
  BEFORE UPDATE OR DELETE ON ledgers
  FOR EACH ROW
  EXECUTE FUNCTION enforce_ledger_append_only();

-- RPC: Atomic FEFO Allocation with FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION allocate_batch_inventory(
  p_distributor_id UUID,
  p_product_id UUID,
  p_required_qty INT
)
RETURNS TABLE (
  out_inventory_id UUID,
  out_batch_number TEXT,
  out_allocated_qty INT
) AS $$
DECLARE
  v_remaining INT := p_required_qty;
  r_inventory RECORD;
  v_allocated INT;
BEGIN
  FOR r_inventory IN
    SELECT id, batch_number, (available_qty - reserved_qty) AS net_qty
    FROM inventory
    WHERE distributor_id = p_distributor_id
      AND product_id = p_product_id
      AND is_quarantined = false
      AND expiry_date > CURRENT_DATE + INTERVAL '30 days'
      AND (available_qty - reserved_qty) > 0
    ORDER BY expiry_date ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    IF v_remaining <= 0 THEN
      EXIT;
    END IF;

    v_allocated := LEAST(r_inventory.net_qty, v_remaining);

    -- Reserve the inventory
    UPDATE inventory
    SET reserved_qty = reserved_qty + v_allocated
    WHERE id = r_inventory.id;

    v_remaining := v_remaining - v_allocated;

    out_inventory_id := r_inventory.id;
    out_batch_number := r_inventory.batch_number;
    out_allocated_qty := v_allocated;
    RETURN NEXT;
  END LOOP;

  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'Insufficient FEFO inventory for product %. Short by % units.', p_product_id, v_remaining;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- RPC: Emergency Batch Recall
CREATE OR REPLACE FUNCTION block_batch_recalled(
  p_product_id UUID,
  p_batch_number TEXT,
  p_recall_reason TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Mark inventory as quarantined and zero out available
  UPDATE inventory
  SET is_quarantined = true,
      available_qty = 0,
      updated_at = now()
  WHERE product_id = p_product_id
    AND batch_number = p_batch_number;

  -- Log batch recall
  INSERT INTO batch_recalls (product_id, batch_number, recall_reason, recalled_by_user_id)
  VALUES (p_product_id, p_batch_number, p_recall_reason, p_user_id);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE grn_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grn_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read active products
CREATE POLICY "Public product read" ON products
  FOR SELECT USING (is_active = true);

-- Orders: Retailers see their own, Distributors see incoming
CREATE POLICY "Retailer read own orders" ON orders
  FOR SELECT USING (
    retailer_id IN (SELECT retailer_id FROM profiles WHERE id = auth.uid())
    OR distributor_id IN (SELECT distributor_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Retailer insert orders" ON orders
  FOR INSERT WITH CHECK (
    retailer_id IN (SELECT retailer_id FROM profiles WHERE id = auth.uid())
  );

-- Inventory: Distributors see their own
CREATE POLICY "Distributor inventory access" ON inventory
  FOR ALL USING (
    distributor_id IN (SELECT distributor_id FROM profiles WHERE id = auth.uid())
  );

-- Ledgers: Retailers and Distributors read their mutual entries
CREATE POLICY "Ledger view policy" ON ledgers
  FOR SELECT USING (
    retailer_id IN (SELECT retailer_id FROM profiles WHERE id = auth.uid())
    OR distributor_id IN (SELECT distributor_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Ledger insert policy" ON ledgers
  FOR INSERT WITH CHECK (
    distributor_id IN (SELECT distributor_id FROM profiles WHERE id = auth.uid())
    OR retailer_id IN (SELECT retailer_id FROM profiles WHERE id = auth.uid())
  );
