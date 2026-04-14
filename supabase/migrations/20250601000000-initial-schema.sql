-- =====================================================================
-- Initial schema reconstruction for publishernest
-- Generated from src/integrations/supabase/types.ts
-- Strategy: enums, then CREATE TABLE IF NOT EXISTS without FKs,
-- then ALTER TABLE ADD CONSTRAINT for FKs, then indexes on FK columns.
-- Pure DDL only: no RLS, triggers, functions, seed data, or views.
-- =====================================================================

-- =====================================================================
-- ENUMS
-- =====================================================================

DO $$ BEGIN
  CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'annual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.license_plan_type AS ENUM ('basic', 'professional', 'enterprise');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.requirement_type AS ENUM ('packaging', 'shipping', 'quality', 'documentation', 'approval', 'payment', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.tax_type AS ENUM ('vat', 'gst', 'sales_tax', 'none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- TABLES
-- =====================================================================

-- api_keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  last_used_at TIMESTAMPTZ,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL
);

-- communications
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT,
  read_by TEXT[],
  receiver_id UUID,
  room_id UUID,
  sender_id UUID
);

-- conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_id UUID,
  last_message_read_id UUID,
  room_id UUID,
  user_id UUID
);

-- customer_delivery_locations
CREATE TABLE IF NOT EXISTS public.customer_delivery_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT,
  contact_email TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_id UUID NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  location_name TEXT NOT NULL,
  notes TEXT,
  postal_code TEXT,
  state TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- customer_requirements
CREATE TABLE IF NOT EXISTS public.customer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_id UUID NOT NULL,
  description TEXT NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  requirement_type public.requirement_type NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  advance_payment_required BOOLEAN NOT NULL DEFAULT false,
  carton_marking_requirements TEXT,
  contact_email TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_name TEXT NOT NULL,
  delivery_address TEXT,
  document_notes TEXT,
  file_approval_required BOOLEAN NOT NULL DEFAULT false,
  freight_forwarder TEXT,
  notes TEXT,
  organization_id UUID NOT NULL,
  packaging_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  website TEXT
);

-- extra_costs
CREATE TABLE IF NOT EXISTS public.extra_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  unit_of_measure_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- format_component_links
CREATE TABLE IF NOT EXISTS public.format_component_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format_id UUID NOT NULL,
  notes TEXT,
  quantity NUMERIC NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- format_components
CREATE TABLE IF NOT EXISTS public.format_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  organization_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- formats
CREATE TABLE IF NOT EXISTS public.formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_type TEXT,
  cover_material TEXT,
  cover_stock_print TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_papers_material TEXT,
  end_papers_print TEXT,
  extent TEXT,
  format_name TEXT NOT NULL,
  internal_material TEXT,
  internal_stock_print TEXT,
  organization_id UUID NOT NULL,
  orientation TEXT,
  spacers_material TEXT,
  spacers_stock_print TEXT,
  sticker_material TEXT,
  sticker_stock_print TEXT,
  tps_depth_mm NUMERIC,
  tps_height_mm NUMERIC,
  tps_plc_depth_mm NUMERIC,
  tps_plc_height_mm NUMERIC,
  tps_plc_width_mm NUMERIC,
  tps_width_mm NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- invoice_line_items
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT NOT NULL,
  invoice_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL
);

-- invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_period_end DATE NOT NULL,
  billing_period_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  currency TEXT DEFAULT 'USD',
  due_date DATE NOT NULL,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  organization_id UUID NOT NULL,
  organization_license_id UUID,
  status public.invoice_status DEFAULT 'draft',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- license_plans
CREATE TABLE IF NOT EXISTS public.license_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_price_per_seat NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  max_seats INTEGER,
  monthly_price_per_seat NUMERIC NOT NULL,
  name TEXT NOT NULL,
  plan_type public.license_plan_type NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- message_reads
CREATE TABLE IF NOT EXISTS public.message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  message_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

-- notification_delivery_log
CREATE TABLE IF NOT EXISTS public.notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  quote_request_id UUID NOT NULL,
  reminder_type TEXT NOT NULL,
  supplier_id UUID NOT NULL
);

-- notification_preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_type TEXT NOT NULL,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- organization_default_price_breaks
CREATE TABLE IF NOT EXISTS public.organization_default_price_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  organization_id UUID NOT NULL,
  quantity NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- organization_invoice_counters
CREATE TABLE IF NOT EXISTS public.organization_invoice_counters (
  organization_id UUID PRIMARY KEY,
  next_invoice_number INTEGER NOT NULL DEFAULT 1
);

-- organization_licenses
CREATE TABLE IF NOT EXISTS public.organization_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_renew BOOLEAN DEFAULT true,
  billing_cycle public.billing_cycle NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT now(),
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  license_plan_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  seat_count INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tax_jurisdiction TEXT,
  tax_rate NUMERIC,
  tax_type public.tax_type,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- organization_members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  member_type TEXT,
  organization_id UUID NOT NULL,
  role TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- organization_notification_preferences
CREATE TABLE IF NOT EXISTS public.organization_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_method TEXT NOT NULL DEFAULT 'in_app',
  enabled BOOLEAN NOT NULL DEFAULT true,
  notification_type TEXT NOT NULL,
  organization_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID
);

-- organization_notifications
CREATE TABLE IF NOT EXISTS public.organization_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data JSONB,
  expires_at TIMESTAMPTZ,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  organization_id UUID NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  user_id UUID
);

-- organization_product_fields
CREATE TABLE IF NOT EXISTS public.organization_product_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  display_order INTEGER NOT NULL DEFAULT 0,
  field_key TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  options JSONB,
  organization_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- organization_production_steps
CREATE TABLE IF NOT EXISTS public.organization_production_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  estimated_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_number INTEGER NOT NULL,
  organization_id UUID NOT NULL,
  step_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- organization_purchase_order_counters
CREATE TABLE IF NOT EXISTS public.organization_purchase_order_counters (
  organization_id UUID PRIMARY KEY,
  next_po_number INTEGER NOT NULL DEFAULT 1
);

-- organization_quote_counters
CREATE TABLE IF NOT EXISTS public.organization_quote_counters (
  organization_id UUID PRIMARY KEY,
  next_quote_number INTEGER NOT NULL DEFAULT 1
);

-- organization_quote_request_counters
CREATE TABLE IF NOT EXISTS public.organization_quote_request_counters (
  organization_id UUID PRIMARY KEY,
  next_quote_number INTEGER NOT NULL DEFAULT 1
);

-- organization_reminder_settings
CREATE TABLE IF NOT EXISTS public.organization_reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  issue_quote_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL UNIQUE,
  reminder_days_before INTEGER[] NOT NULL DEFAULT ARRAY[3, 1],
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- organization_sales_order_counters
CREATE TABLE IF NOT EXISTS public.organization_sales_order_counters (
  organization_id UUID PRIMARY KEY,
  next_so_number INTEGER NOT NULL DEFAULT 1
);

-- organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  default_extra_costs JSONB,
  default_num_products INTEGER NOT NULL DEFAULT 1,
  default_savings JSONB,
  logo_url TEXT,
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'publisher',
  slug TEXT NOT NULL UNIQUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- presentation_analytics
CREATE TABLE IF NOT EXISTS public.presentation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  items_viewed JSONB,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  presentation_id UUID NOT NULL,
  sections_viewed JSONB,
  view_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  view_duration INTEGER,
  view_id TEXT NOT NULL,
  viewer_device TEXT,
  viewer_ip TEXT,
  viewer_location TEXT
);

-- presentation_items
CREATE TABLE IF NOT EXISTS public.presentation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  currency TEXT,
  custom_content JSONB,
  custom_price NUMERIC,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  item_id UUID,
  item_type TEXT NOT NULL,
  section_id UUID NOT NULL,
  title TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- presentation_sections
CREATE TABLE IF NOT EXISTS public.presentation_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  presentation_id UUID NOT NULL,
  section_order INTEGER NOT NULL DEFAULT 0,
  section_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- presentation_shares
CREATE TABLE IF NOT EXISTS public.presentation_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ,
  presentation_id UUID NOT NULL,
  share_link TEXT NOT NULL,
  share_token TEXT NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  shared_by UUID NOT NULL,
  shared_with TEXT
);

-- print_runs
CREATE TABLE IF NOT EXISTS public.print_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- product_custom_field_values
CREATE TABLE IF NOT EXISTS public.product_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  field_id UUID NOT NULL,
  field_value JSONB,
  product_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- product_prices
CREATE TABLE IF NOT EXISTS public.product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  currency_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  organization_id UUID NOT NULL,
  price NUMERIC,
  product_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- product_saved_views
CREATE TABLE IF NOT EXISTS public.product_saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  filters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  search_query TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

-- products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_range TEXT,
  carton_height_mm NUMERIC,
  carton_length_mm NUMERIC,
  carton_quantity INTEGER,
  carton_weight_kg NUMERIC,
  carton_width_mm NUMERIC,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  currency_code TEXT,
  edition_number INTEGER,
  format_extra_comments TEXT,
  format_extras JSONB,
  format_id UUID,
  height_measurement NUMERIC,
  internal_images TEXT[],
  isbn10 TEXT,
  isbn13 TEXT,
  language_code TEXT,
  license TEXT,
  list_price NUMERIC,
  organization_id UUID NOT NULL,
  page_count INTEGER,
  product_availability_code TEXT,
  product_form TEXT,
  product_form_detail TEXT,
  publication_date DATE,
  publisher_name TEXT,
  selling_points TEXT,
  series_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  subject_code TEXT,
  subtitle TEXT,
  synopsis TEXT,
  thickness_measurement NUMERIC,
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  weight_measurement NUMERIC,
  width_measurement NUMERIC
);

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_organization_id UUID,
  email TEXT NOT NULL,
  first_name TEXT,
  is_online BOOLEAN DEFAULT false,
  job_title TEXT,
  last_name TEXT,
  last_seen TIMESTAMPTZ,
  online_status TEXT DEFAULT 'offline',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- program_formats
CREATE TABLE IF NOT EXISTS public.program_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_allocation NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format_id UUID NOT NULL,
  notes TEXT,
  program_id UUID NOT NULL,
  status TEXT DEFAULT 'planned',
  target_quantity NUMERIC,
  timeline_end DATE,
  timeline_start DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- program_titles
CREATE TABLE IF NOT EXISTS public.program_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_brief TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_cost NUMERIC,
  notes TEXT,
  planned_pub_date DATE,
  product_id UUID,
  program_format_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  target_isbn TEXT,
  target_quantity NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  working_title TEXT NOT NULL
);

-- publishing_program_tags
CREATE TABLE IF NOT EXISTS public.publishing_program_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  usage_count INTEGER NOT NULL DEFAULT 0
);

-- publishing_programs
CREATE TABLE IF NOT EXISTS public.publishing_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  end_date DATE,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  program_year INTEGER,
  start_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  tags JSONB,
  target_budget NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- purchase_order_audit
CREATE TABLE IF NOT EXISTS public.purchase_order_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  changed_by UUID,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purchase_order_id UUID
);

-- purchase_order_line_items
CREATE TABLE IF NOT EXISTS public.purchase_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format_id UUID,
  product_id UUID NOT NULL,
  production_quantity NUMERIC,
  purchase_order_id UUID NOT NULL,
  quantity NUMERIC NOT NULL,
  received_quantity NUMERIC,
  total_cost NUMERIC NOT NULL,
  transit_quantity NUMERIC,
  unit_cost NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- purchase_orders
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  awaiting_shipment_at TIMESTAMPTZ,
  awaiting_shipment_by UUID,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  delivery_date DATE,
  goods_checked_at TIMESTAMPTZ,
  goods_checked_by UUID,
  issue_date DATE,
  issued_at TIMESTAMPTZ,
  issued_by UUID,
  notes TEXT,
  organization_id UUID NOT NULL,
  payment_terms TEXT,
  po_number TEXT NOT NULL,
  print_run_id UUID NOT NULL,
  production_completed_at TIMESTAMPTZ,
  production_completed_by UUID,
  production_started_at TIMESTAMPTZ,
  production_started_by UUID,
  received_at TIMESTAMPTZ,
  received_by UUID,
  scheduled_at TIMESTAMPTZ,
  scheduled_by UUID,
  shipped_at TIMESTAMPTZ,
  shipped_by UUID,
  shipping_address TEXT,
  shipping_method TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  status_code TEXT NOT NULL DEFAULT 'draft',
  supplier_id UUID NOT NULL,
  supplier_quote_id UUID,
  total_amount NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  user_id UUID NOT NULL
);

-- quote_request_attachments
CREATE TABLE IF NOT EXISTS public.quote_request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size NUMERIC,
  file_type TEXT,
  quote_request_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID
);

-- quote_request_audit
CREATE TABLE IF NOT EXISTS public.quote_request_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  changed_by UUID,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  quote_request_id UUID
);

-- quote_request_extra_costs
CREATE TABLE IF NOT EXISTS public.quote_request_extra_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  name TEXT NOT NULL,
  quote_request_id UUID NOT NULL,
  unit_of_measure_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- quote_request_format_price_breaks
CREATE TABLE IF NOT EXISTS public.quote_request_format_price_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  num_products INTEGER NOT NULL DEFAULT 1,
  quantity NUMERIC NOT NULL,
  quote_request_format_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- quote_request_format_products
CREATE TABLE IF NOT EXISTS public.quote_request_format_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  product_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  quote_request_format_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- quote_request_formats
CREATE TABLE IF NOT EXISTS public.quote_request_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format_id UUID NOT NULL,
  notes TEXT,
  num_products INTEGER NOT NULL DEFAULT 1,
  quantity NUMERIC NOT NULL DEFAULT 0,
  quote_request_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- quote_request_savings
CREATE TABLE IF NOT EXISTS public.quote_request_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  name TEXT NOT NULL,
  quote_request_id UUID NOT NULL,
  unit_of_measure_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- quote_requests
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  due_date DATE,
  notes TEXT,
  organization_id UUID NOT NULL,
  production_schedule_requested BOOLEAN NOT NULL DEFAULT false,
  products JSONB,
  quantities JSONB,
  reference_id TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  requested_by UUID NOT NULL,
  required_step_date DATE,
  required_step_id UUID,
  status TEXT NOT NULL DEFAULT 'draft',
  supplier_id UUID,
  supplier_ids UUID[],
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sales_order_audit
CREATE TABLE IF NOT EXISTS public.sales_order_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  changed_by UUID,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sales_order_id UUID NOT NULL
);

-- sales_order_charges
CREATE TABLE IF NOT EXISTS public.sales_order_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  charge_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  sales_order_id UUID NOT NULL,
  taxable BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sales_order_line_items
CREATE TABLE IF NOT EXISTS public.sales_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format_id UUID,
  product_id UUID NOT NULL,
  purchase_order_line_item_id UUID,
  quantity NUMERIC NOT NULL,
  sales_order_id UUID NOT NULL,
  total_cost NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  unit_cost NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sales_order_requirements
CREATE TABLE IF NOT EXISTS public.sales_order_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  requirement_id UUID NOT NULL,
  sales_order_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sales_orders
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_payment_status TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  customer_contact_name TEXT,
  customer_id UUID NOT NULL,
  customer_purchase_order TEXT,
  delivery_date DATE,
  delivery_location_id UUID,
  departing_port TEXT,
  file_approval_status TEXT,
  fob_date DATE,
  grand_total NUMERIC,
  issue_date DATE,
  notes TEXT,
  organization_id UUID NOT NULL,
  payment_terms TEXT,
  print_run_id UUID,
  sales_person TEXT,
  so_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  tax_amount NUMERIC,
  tax_rate NUMERIC,
  total_amount NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sales_presentations
CREATE TABLE IF NOT EXISTS public.sales_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  description TEXT,
  display_settings JSONB,
  expires_at TIMESTAMPTZ,
  organization_id UUID NOT NULL,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- savings
CREATE TABLE IF NOT EXISTS public.savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  unit_of_measure_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- stock_on_hand
CREATE TABLE IF NOT EXISTS public.stock_on_hand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  organization_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  warehouse_id UUID NOT NULL
);

-- supplier_communications
CREATE TABLE IF NOT EXISTS public.supplier_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  communication_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  message TEXT NOT NULL,
  purchase_order_id UUID NOT NULL,
  receiver_id UUID
);

-- supplier_quote_attachments
CREATE TABLE IF NOT EXISTS public.supplier_quote_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size NUMERIC,
  file_type TEXT,
  supplier_quote_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID
);

-- supplier_quote_audit
CREATE TABLE IF NOT EXISTS public.supplier_quote_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  changed_by UUID,
  changes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  supplier_quote_id UUID
);

-- supplier_quote_extra_cost_price_breaks
CREATE TABLE IF NOT EXISTS public.supplier_quote_extra_cost_price_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extra_cost_id UUID,
  quantity NUMERIC,
  supplier_quote_id UUID,
  unit_cost NUMERIC,
  unit_cost_1 NUMERIC,
  unit_cost_2 NUMERIC,
  unit_cost_3 NUMERIC,
  unit_cost_4 NUMERIC,
  unit_cost_5 NUMERIC,
  unit_cost_6 NUMERIC,
  unit_cost_7 NUMERIC,
  unit_cost_8 NUMERIC,
  unit_cost_9 NUMERIC,
  unit_cost_10 NUMERIC,
  unit_of_measure_id UUID
);

-- supplier_quote_extra_costs
CREATE TABLE IF NOT EXISTS public.supplier_quote_extra_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extra_cost_id UUID NOT NULL,
  price_break_id UUID,
  quote_price_break_each_id UUID,
  supplier_quote_id UUID NOT NULL,
  unit_cost NUMERIC,
  unit_cost_1 NUMERIC,
  unit_cost_2 NUMERIC,
  unit_cost_3 NUMERIC,
  unit_cost_4 NUMERIC,
  unit_cost_5 NUMERIC,
  unit_cost_6 NUMERIC,
  unit_cost_7 NUMERIC,
  unit_cost_8 NUMERIC,
  unit_cost_9 NUMERIC,
  unit_cost_10 NUMERIC,
  unit_of_measure_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- supplier_quote_extra_costs_price_breaks
CREATE TABLE IF NOT EXISTS public.supplier_quote_extra_costs_price_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extra_cost_id UUID NOT NULL,
  price_break_id UUID NOT NULL,
  supplier_quote_id UUID NOT NULL,
  unit_cost NUMERIC,
  unit_cost_1 NUMERIC,
  unit_cost_2 NUMERIC,
  unit_cost_3 NUMERIC,
  unit_cost_4 NUMERIC,
  unit_cost_5 NUMERIC,
  unit_cost_6 NUMERIC,
  unit_cost_7 NUMERIC,
  unit_cost_8 NUMERIC,
  unit_cost_9 NUMERIC,
  unit_cost_10 NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- supplier_quote_formats
CREATE TABLE IF NOT EXISTS public.supplier_quote_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format_id UUID NOT NULL,
  quote_request_format_id UUID,
  supplier_quote_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- supplier_quote_price_breaks
CREATE TABLE IF NOT EXISTS public.supplier_quote_price_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  format_id UUID,
  price_break_id UUID NOT NULL,
  product_id UUID,
  quantity NUMERIC NOT NULL,
  quote_request_format_id UUID NOT NULL,
  supplier_quote_id UUID NOT NULL,
  unit_cost NUMERIC,
  unit_cost_1 NUMERIC,
  unit_cost_2 NUMERIC,
  unit_cost_3 NUMERIC,
  unit_cost_4 NUMERIC,
  unit_cost_5 NUMERIC,
  unit_cost_6 NUMERIC,
  unit_cost_7 NUMERIC,
  unit_cost_8 NUMERIC,
  unit_cost_9 NUMERIC,
  unit_cost_10 NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- supplier_quote_savings
CREATE TABLE IF NOT EXISTS public.supplier_quote_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  price_break_id UUID,
  saving_id UUID NOT NULL,
  supplier_quote_id UUID NOT NULL,
  unit_cost NUMERIC,
  unit_cost_1 NUMERIC,
  unit_cost_2 NUMERIC,
  unit_cost_3 NUMERIC,
  unit_cost_4 NUMERIC,
  unit_cost_5 NUMERIC,
  unit_cost_6 NUMERIC,
  unit_cost_7 NUMERIC,
  unit_cost_8 NUMERIC,
  unit_cost_9 NUMERIC,
  unit_cost_10 NUMERIC,
  unit_of_measure_id UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- supplier_quotes
CREATE TABLE IF NOT EXISTS public.supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  organization_id UUID NOT NULL,
  packaging_carton_height NUMERIC,
  packaging_carton_length NUMERIC,
  packaging_carton_quantity NUMERIC,
  packaging_carton_volume NUMERIC,
  packaging_carton_weight NUMERIC,
  packaging_carton_width NUMERIC,
  packaging_cartons_per_pallet NUMERIC,
  packaging_copies_per_20ft_palletized NUMERIC,
  packaging_copies_per_20ft_unpalletized NUMERIC,
  packaging_copies_per_40ft_palletized NUMERIC,
  packaging_copies_per_40ft_unpalletized NUMERIC,
  production_schedule JSONB,
  quote_request_id UUID NOT NULL,
  reference TEXT,
  reference_id TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID,
  rejection_reason TEXT,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  supplier_id UUID NOT NULL,
  terms TEXT,
  total_cost NUMERIC,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_from DATE,
  valid_to DATE
);

-- supplier_users
CREATE TABLE IF NOT EXISTS public.supplier_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  status TEXT NOT NULL DEFAULT 'active',
  supplier_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT,
  contact_email TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  organization_id UUID NOT NULL,
  profile_id UUID,
  status TEXT DEFAULT 'active',
  supplier_name TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  website TEXT
);

-- typing_status
CREATE TABLE IF NOT EXISTS public.typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_typing BOOLEAN DEFAULT false,
  room_id UUID NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL
);

-- unit_of_measures
CREATE TABLE IF NOT EXISTS public.unit_of_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abbreviation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_inventory_unit BOOLEAN NOT NULL DEFAULT false,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  location TEXT,
  name TEXT NOT NULL,
  organization_id UUID NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- FOREIGN KEYS
-- =====================================================================

-- api_keys
DO $$ BEGIN
  ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- communications
DO $$ BEGIN
  ALTER TABLE public.communications
    ADD CONSTRAINT communications_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- conversations
DO $$ BEGIN
  ALTER TABLE public.conversations
    ADD CONSTRAINT conversations_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- customer_delivery_locations
DO $$ BEGIN
  ALTER TABLE public.customer_delivery_locations
    ADD CONSTRAINT customer_delivery_locations_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- customer_requirements
DO $$ BEGIN
  ALTER TABLE public.customer_requirements
    ADD CONSTRAINT customer_requirements_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- customers
DO $$ BEGIN
  ALTER TABLE public.customers
    ADD CONSTRAINT customers_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- extra_costs
DO $$ BEGIN
  ALTER TABLE public.extra_costs
    ADD CONSTRAINT extra_costs_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.extra_costs
    ADD CONSTRAINT fk_extra_costs_unit_of_measure
    FOREIGN KEY (unit_of_measure_id) REFERENCES public.unit_of_measures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- format_component_links
DO $$ BEGIN
  ALTER TABLE public.format_component_links
    ADD CONSTRAINT format_component_links_component_id_fkey
    FOREIGN KEY (component_id) REFERENCES public.format_components(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.format_component_links
    ADD CONSTRAINT format_component_links_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- format_components
DO $$ BEGIN
  ALTER TABLE public.format_components
    ADD CONSTRAINT format_components_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- formats
DO $$ BEGIN
  ALTER TABLE public.formats
    ADD CONSTRAINT formats_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- invoice_line_items
DO $$ BEGIN
  ALTER TABLE public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_fkey
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- invoices
DO $$ BEGIN
  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.invoices
    ADD CONSTRAINT invoices_organization_license_id_fkey
    FOREIGN KEY (organization_license_id) REFERENCES public.organization_licenses(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- message_reads
DO $$ BEGIN
  ALTER TABLE public.message_reads
    ADD CONSTRAINT message_reads_message_id_fkey
    FOREIGN KEY (message_id) REFERENCES public.communications(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.message_reads
    ADD CONSTRAINT message_reads_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- notification_delivery_log
DO $$ BEGIN
  ALTER TABLE public.notification_delivery_log
    ADD CONSTRAINT notification_delivery_log_quote_request_id_fkey
    FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.notification_delivery_log
    ADD CONSTRAINT notification_delivery_log_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_default_price_breaks
DO $$ BEGIN
  ALTER TABLE public.organization_default_price_breaks
    ADD CONSTRAINT organization_default_price_breaks_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_invoice_counters
DO $$ BEGIN
  ALTER TABLE public.organization_invoice_counters
    ADD CONSTRAINT organization_invoice_counters_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_licenses
DO $$ BEGIN
  ALTER TABLE public.organization_licenses
    ADD CONSTRAINT organization_licenses_license_plan_id_fkey
    FOREIGN KEY (license_plan_id) REFERENCES public.license_plans(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.organization_licenses
    ADD CONSTRAINT organization_licenses_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_members
DO $$ BEGIN
  ALTER TABLE public.organization_members
    ADD CONSTRAINT organization_members_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_notification_preferences
DO $$ BEGIN
  ALTER TABLE public.organization_notification_preferences
    ADD CONSTRAINT organization_notification_preferences_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_notifications
DO $$ BEGIN
  ALTER TABLE public.organization_notifications
    ADD CONSTRAINT organization_notifications_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_product_fields
DO $$ BEGIN
  ALTER TABLE public.organization_product_fields
    ADD CONSTRAINT organization_product_fields_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_production_steps
DO $$ BEGIN
  ALTER TABLE public.organization_production_steps
    ADD CONSTRAINT organization_production_steps_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_purchase_order_counters
DO $$ BEGIN
  ALTER TABLE public.organization_purchase_order_counters
    ADD CONSTRAINT organization_purchase_order_counters_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_quote_counters
DO $$ BEGIN
  ALTER TABLE public.organization_quote_counters
    ADD CONSTRAINT organization_quote_counters_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_quote_request_counters
DO $$ BEGIN
  ALTER TABLE public.organization_quote_request_counters
    ADD CONSTRAINT organization_quote_request_counters_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_reminder_settings
DO $$ BEGIN
  ALTER TABLE public.organization_reminder_settings
    ADD CONSTRAINT organization_reminder_settings_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organization_sales_order_counters
DO $$ BEGIN
  ALTER TABLE public.organization_sales_order_counters
    ADD CONSTRAINT organization_sales_order_counters_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- presentation_analytics
DO $$ BEGIN
  ALTER TABLE public.presentation_analytics
    ADD CONSTRAINT presentation_analytics_presentation_id_fkey
    FOREIGN KEY (presentation_id) REFERENCES public.sales_presentations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- presentation_items
DO $$ BEGIN
  ALTER TABLE public.presentation_items
    ADD CONSTRAINT presentation_items_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES public.presentation_sections(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- presentation_sections
DO $$ BEGIN
  ALTER TABLE public.presentation_sections
    ADD CONSTRAINT presentation_sections_presentation_id_fkey
    FOREIGN KEY (presentation_id) REFERENCES public.sales_presentations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- presentation_shares
DO $$ BEGIN
  ALTER TABLE public.presentation_shares
    ADD CONSTRAINT presentation_shares_presentation_id_fkey
    FOREIGN KEY (presentation_id) REFERENCES public.sales_presentations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- print_runs
DO $$ BEGIN
  ALTER TABLE public.print_runs
    ADD CONSTRAINT print_runs_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- product_custom_field_values
DO $$ BEGIN
  ALTER TABLE public.product_custom_field_values
    ADD CONSTRAINT product_custom_field_values_field_id_fkey
    FOREIGN KEY (field_id) REFERENCES public.organization_product_fields(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.product_custom_field_values
    ADD CONSTRAINT product_custom_field_values_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- product_prices
DO $$ BEGIN
  ALTER TABLE public.product_prices
    ADD CONSTRAINT product_prices_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.product_prices
    ADD CONSTRAINT product_prices_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- product_saved_views
DO $$ BEGIN
  ALTER TABLE public.product_saved_views
    ADD CONSTRAINT product_saved_views_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- products
DO $$ BEGIN
  ALTER TABLE public.products
    ADD CONSTRAINT products_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.products
    ADD CONSTRAINT products_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- profiles
DO $$ BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_current_organization_id_fkey
    FOREIGN KEY (current_organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- program_formats
DO $$ BEGIN
  ALTER TABLE public.program_formats
    ADD CONSTRAINT program_formats_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.program_formats
    ADD CONSTRAINT program_formats_program_id_fkey
    FOREIGN KEY (program_id) REFERENCES public.publishing_programs(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- program_titles
DO $$ BEGIN
  ALTER TABLE public.program_titles
    ADD CONSTRAINT program_titles_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.program_titles
    ADD CONSTRAINT program_titles_program_format_id_fkey
    FOREIGN KEY (program_format_id) REFERENCES public.program_formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- publishing_program_tags
DO $$ BEGIN
  ALTER TABLE public.publishing_program_tags
    ADD CONSTRAINT fk_publishing_program_tags_organization
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- publishing_programs
DO $$ BEGIN
  ALTER TABLE public.publishing_programs
    ADD CONSTRAINT publishing_programs_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- purchase_order_audit
DO $$ BEGIN
  ALTER TABLE public.purchase_order_audit
    ADD CONSTRAINT purchase_order_audit_purchase_order_id_fkey
    FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- purchase_order_line_items
DO $$ BEGIN
  ALTER TABLE public.purchase_order_line_items
    ADD CONSTRAINT purchase_order_line_items_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.purchase_order_line_items
    ADD CONSTRAINT purchase_order_line_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.purchase_order_line_items
    ADD CONSTRAINT purchase_order_line_items_purchase_order_id_fkey
    FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- purchase_orders
DO $$ BEGIN
  ALTER TABLE public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.purchase_orders
    ADD CONSTRAINT purchase_orders_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.purchase_orders
    ADD CONSTRAINT purchase_orders_print_run_id_fkey
    FOREIGN KEY (print_run_id) REFERENCES public.print_runs(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_request_attachments
DO $$ BEGIN
  ALTER TABLE public.quote_request_attachments
    ADD CONSTRAINT quote_request_attachments_quote_request_id_fkey
    FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_request_audit
DO $$ BEGIN
  ALTER TABLE public.quote_request_audit
    ADD CONSTRAINT quote_request_audit_quote_request_id_fkey
    FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_request_extra_costs
DO $$ BEGIN
  ALTER TABLE public.quote_request_extra_costs
    ADD CONSTRAINT quote_request_extra_costs_quote_request_id_fkey
    FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.quote_request_extra_costs
    ADD CONSTRAINT quote_request_extra_costs_unit_of_measure_id_fkey
    FOREIGN KEY (unit_of_measure_id) REFERENCES public.unit_of_measures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_request_format_price_breaks
DO $$ BEGIN
  ALTER TABLE public.quote_request_format_price_breaks
    ADD CONSTRAINT quote_request_format_price_breaks_quote_request_format_id_fkey
    FOREIGN KEY (quote_request_format_id) REFERENCES public.quote_request_formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_request_format_products
DO $$ BEGIN
  ALTER TABLE public.quote_request_format_products
    ADD CONSTRAINT quote_request_format_products_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.quote_request_format_products
    ADD CONSTRAINT quote_request_format_products_quote_request_format_id_fkey
    FOREIGN KEY (quote_request_format_id) REFERENCES public.quote_request_formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_request_formats
DO $$ BEGIN
  ALTER TABLE public.quote_request_formats
    ADD CONSTRAINT quote_request_formats_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.quote_request_formats
    ADD CONSTRAINT quote_request_formats_quote_request_id_fkey
    FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_request_savings
DO $$ BEGIN
  ALTER TABLE public.quote_request_savings
    ADD CONSTRAINT quote_request_savings_quote_request_id_fkey
    FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.quote_request_savings
    ADD CONSTRAINT quote_request_savings_unit_of_measure_id_fkey
    FOREIGN KEY (unit_of_measure_id) REFERENCES public.unit_of_measures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quote_requests
DO $$ BEGIN
  ALTER TABLE public.quote_requests
    ADD CONSTRAINT quote_requests_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.quote_requests
    ADD CONSTRAINT quote_requests_requested_by_fkey
    FOREIGN KEY (requested_by) REFERENCES public.profiles(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.quote_requests
    ADD CONSTRAINT quote_requests_required_step_id_fkey
    FOREIGN KEY (required_step_id) REFERENCES public.organization_production_steps(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.quote_requests
    ADD CONSTRAINT quote_requests_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- sales_order_audit
DO $$ BEGIN
  ALTER TABLE public.sales_order_audit
    ADD CONSTRAINT sales_order_audit_sales_order_id_fkey
    FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- sales_order_charges
DO $$ BEGIN
  ALTER TABLE public.sales_order_charges
    ADD CONSTRAINT sales_order_charges_sales_order_id_fkey
    FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- sales_order_line_items
DO $$ BEGIN
  ALTER TABLE public.sales_order_line_items
    ADD CONSTRAINT sales_order_line_items_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sales_order_line_items
    ADD CONSTRAINT sales_order_line_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sales_order_line_items
    ADD CONSTRAINT sales_order_line_items_purchase_order_line_item_id_fkey
    FOREIGN KEY (purchase_order_line_item_id) REFERENCES public.purchase_order_line_items(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sales_order_line_items
    ADD CONSTRAINT sales_order_line_items_sales_order_id_fkey
    FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- sales_order_requirements
DO $$ BEGIN
  ALTER TABLE public.sales_order_requirements
    ADD CONSTRAINT sales_order_requirements_requirement_id_fkey
    FOREIGN KEY (requirement_id) REFERENCES public.customer_requirements(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sales_order_requirements
    ADD CONSTRAINT sales_order_requirements_sales_order_id_fkey
    FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- sales_orders
DO $$ BEGIN
  ALTER TABLE public.sales_orders
    ADD CONSTRAINT sales_orders_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES public.customers(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sales_orders
    ADD CONSTRAINT sales_orders_delivery_location_id_fkey
    FOREIGN KEY (delivery_location_id) REFERENCES public.customer_delivery_locations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sales_orders
    ADD CONSTRAINT sales_orders_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.sales_orders
    ADD CONSTRAINT sales_orders_print_run_id_fkey
    FOREIGN KEY (print_run_id) REFERENCES public.print_runs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- sales_presentations
DO $$ BEGIN
  ALTER TABLE public.sales_presentations
    ADD CONSTRAINT sales_presentations_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- savings
DO $$ BEGIN
  ALTER TABLE public.savings
    ADD CONSTRAINT savings_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.savings
    ADD CONSTRAINT savings_unit_of_measure_id_fkey
    FOREIGN KEY (unit_of_measure_id) REFERENCES public.unit_of_measures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- stock_on_hand
DO $$ BEGIN
  ALTER TABLE public.stock_on_hand
    ADD CONSTRAINT stock_on_hand_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.stock_on_hand
    ADD CONSTRAINT stock_on_hand_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.stock_on_hand
    ADD CONSTRAINT stock_on_hand_warehouse_id_fkey
    FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_communications
DO $$ BEGIN
  ALTER TABLE public.supplier_communications
    ADD CONSTRAINT supplier_communications_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_communications
    ADD CONSTRAINT supplier_communications_purchase_order_id_fkey
    FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_attachments
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_attachments
    ADD CONSTRAINT supplier_quote_attachments_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_audit
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_audit
    ADD CONSTRAINT supplier_quote_audit_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_extra_cost_price_breaks
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_cost_price_breaks
    ADD CONSTRAINT supplier_quote_extra_cost_price_breaks_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_extra_costs
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_costs
    ADD CONSTRAINT supplier_quote_extra_costs_extra_cost_id_fkey
    FOREIGN KEY (extra_cost_id) REFERENCES public.quote_request_extra_costs(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_costs
    ADD CONSTRAINT supplier_quote_extra_costs_price_break_id_fkey
    FOREIGN KEY (price_break_id) REFERENCES public.quote_request_format_price_breaks(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_costs
    ADD CONSTRAINT supplier_quote_extra_costs_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_costs
    ADD CONSTRAINT supplier_quote_extra_costs_unit_of_measure_id_fkey
    FOREIGN KEY (unit_of_measure_id) REFERENCES public.unit_of_measures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_extra_costs_price_breaks
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_costs_price_breaks
    ADD CONSTRAINT supplier_quote_extra_costs_price_breaks_extra_cost_id_fkey
    FOREIGN KEY (extra_cost_id) REFERENCES public.extra_costs(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_costs_price_breaks
    ADD CONSTRAINT supplier_quote_extra_costs_price_breaks_price_break_id_fkey
    FOREIGN KEY (price_break_id) REFERENCES public.quote_request_format_price_breaks(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_extra_costs_price_breaks
    ADD CONSTRAINT supplier_quote_extra_costs_price_breaks_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_formats
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_formats
    ADD CONSTRAINT supplier_quote_formats_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_formats
    ADD CONSTRAINT supplier_quote_formats_quote_request_format_id_fkey
    FOREIGN KEY (quote_request_format_id) REFERENCES public.quote_request_formats(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_formats
    ADD CONSTRAINT supplier_quote_formats_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_price_breaks
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_price_breaks
    ADD CONSTRAINT supplier_quote_price_breaks_format_id_fkey
    FOREIGN KEY (format_id) REFERENCES public.formats(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_price_breaks
    ADD CONSTRAINT supplier_quote_price_breaks_price_break_id_fkey
    FOREIGN KEY (price_break_id) REFERENCES public.quote_request_format_price_breaks(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_price_breaks
    ADD CONSTRAINT supplier_quote_price_breaks_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_price_breaks
    ADD CONSTRAINT supplier_quote_price_breaks_quote_request_format_id_fkey
    FOREIGN KEY (quote_request_format_id) REFERENCES public.quote_request_formats(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_price_breaks
    ADD CONSTRAINT supplier_quote_price_breaks_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quote_savings
DO $$ BEGIN
  ALTER TABLE public.supplier_quote_savings
    ADD CONSTRAINT supplier_quote_savings_price_break_id_fkey
    FOREIGN KEY (price_break_id) REFERENCES public.quote_request_format_price_breaks(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_savings
    ADD CONSTRAINT supplier_quote_savings_saving_id_fkey
    FOREIGN KEY (saving_id) REFERENCES public.quote_request_savings(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_savings
    ADD CONSTRAINT supplier_quote_savings_supplier_quote_id_fkey
    FOREIGN KEY (supplier_quote_id) REFERENCES public.supplier_quotes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quote_savings
    ADD CONSTRAINT supplier_quote_savings_unit_of_measure_id_fkey
    FOREIGN KEY (unit_of_measure_id) REFERENCES public.unit_of_measures(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_quotes
DO $$ BEGIN
  ALTER TABLE public.supplier_quotes
    ADD CONSTRAINT supplier_quotes_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quotes
    ADD CONSTRAINT supplier_quotes_quote_request_id_fkey
    FOREIGN KEY (quote_request_id) REFERENCES public.quote_requests(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.supplier_quotes
    ADD CONSTRAINT supplier_quotes_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- supplier_users
DO $$ BEGIN
  ALTER TABLE public.supplier_users
    ADD CONSTRAINT supplier_users_supplier_id_fkey
    FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- suppliers
DO $$ BEGIN
  ALTER TABLE public.suppliers
    ADD CONSTRAINT fk_suppliers_organization
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.suppliers
    ADD CONSTRAINT suppliers_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- typing_status
DO $$ BEGIN
  ALTER TABLE public.typing_status
    ADD CONSTRAINT typing_status_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- warehouses
DO $$ BEGIN
  ALTER TABLE public.warehouses
    ADD CONSTRAINT warehouses_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================================
-- INDEXES (on foreign-key columns)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON public.api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON public.communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_delivery_locations_customer_id ON public.customer_delivery_locations(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_requirements_customer_id ON public.customer_requirements(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON public.customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_extra_costs_organization_id ON public.extra_costs(organization_id);
CREATE INDEX IF NOT EXISTS idx_extra_costs_unit_of_measure_id ON public.extra_costs(unit_of_measure_id);
CREATE INDEX IF NOT EXISTS idx_format_component_links_component_id ON public.format_component_links(component_id);
CREATE INDEX IF NOT EXISTS idx_format_component_links_format_id ON public.format_component_links(format_id);
CREATE INDEX IF NOT EXISTS idx_format_components_organization_id ON public.format_components(organization_id);
CREATE INDEX IF NOT EXISTS idx_formats_organization_id ON public.formats(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_license_id ON public.invoices(organization_license_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON public.message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id ON public.message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_quote_request_id ON public.notification_delivery_log(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_supplier_id ON public.notification_delivery_log(supplier_id);
CREATE INDEX IF NOT EXISTS idx_organization_default_price_breaks_organization_id ON public.organization_default_price_breaks(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_licenses_license_plan_id ON public.organization_licenses(license_plan_id);
CREATE INDEX IF NOT EXISTS idx_organization_licenses_organization_id ON public.organization_licenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_notification_preferences_organization_id ON public.organization_notification_preferences(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_notifications_organization_id ON public.organization_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_product_fields_organization_id ON public.organization_product_fields(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_production_steps_organization_id ON public.organization_production_steps(organization_id);
CREATE INDEX IF NOT EXISTS idx_presentation_analytics_presentation_id ON public.presentation_analytics(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_items_section_id ON public.presentation_items(section_id);
CREATE INDEX IF NOT EXISTS idx_presentation_sections_presentation_id ON public.presentation_sections(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_shares_presentation_id ON public.presentation_shares(presentation_id);
CREATE INDEX IF NOT EXISTS idx_print_runs_organization_id ON public.print_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_custom_field_values_field_id ON public.product_custom_field_values(field_id);
CREATE INDEX IF NOT EXISTS idx_product_custom_field_values_product_id ON public.product_custom_field_values(product_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_organization_id ON public.product_prices(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_prices_product_id ON public.product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_saved_views_organization_id ON public.product_saved_views(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_format_id ON public.products(format_id);
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_current_organization_id ON public.profiles(current_organization_id);
CREATE INDEX IF NOT EXISTS idx_program_formats_format_id ON public.program_formats(format_id);
CREATE INDEX IF NOT EXISTS idx_program_formats_program_id ON public.program_formats(program_id);
CREATE INDEX IF NOT EXISTS idx_program_titles_product_id ON public.program_titles(product_id);
CREATE INDEX IF NOT EXISTS idx_program_titles_program_format_id ON public.program_titles(program_format_id);
CREATE INDEX IF NOT EXISTS idx_publishing_program_tags_organization_id ON public.publishing_program_tags(organization_id);
CREATE INDEX IF NOT EXISTS idx_publishing_programs_organization_id ON public.publishing_programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_audit_purchase_order_id ON public.purchase_order_audit(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_line_items_format_id ON public.purchase_order_line_items(format_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_line_items_product_id ON public.purchase_order_line_items(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_line_items_purchase_order_id ON public.purchase_order_line_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_organization_id ON public.purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_print_run_id ON public.purchase_orders(print_run_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_quote_id ON public.purchase_orders(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_attachments_quote_request_id ON public.quote_request_attachments(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_audit_quote_request_id ON public.quote_request_audit(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_extra_costs_quote_request_id ON public.quote_request_extra_costs(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_extra_costs_unit_of_measure_id ON public.quote_request_extra_costs(unit_of_measure_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_format_price_breaks_quote_request_format_id ON public.quote_request_format_price_breaks(quote_request_format_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_format_products_product_id ON public.quote_request_format_products(product_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_format_products_quote_request_format_id ON public.quote_request_format_products(quote_request_format_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_formats_format_id ON public.quote_request_formats(format_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_formats_quote_request_id ON public.quote_request_formats(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_savings_quote_request_id ON public.quote_request_savings(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quote_request_savings_unit_of_measure_id ON public.quote_request_savings(unit_of_measure_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_organization_id ON public.quote_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_requested_by ON public.quote_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_quote_requests_required_step_id ON public.quote_requests(required_step_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_supplier_id ON public.quote_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_audit_sales_order_id ON public.sales_order_audit(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_charges_sales_order_id ON public.sales_order_charges(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_line_items_format_id ON public.sales_order_line_items(format_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_line_items_product_id ON public.sales_order_line_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_line_items_purchase_order_line_item_id ON public.sales_order_line_items(purchase_order_line_item_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_line_items_sales_order_id ON public.sales_order_line_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_requirements_requirement_id ON public.sales_order_requirements(requirement_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_requirements_sales_order_id ON public.sales_order_requirements(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON public.sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_delivery_location_id ON public.sales_orders(delivery_location_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_organization_id ON public.sales_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_print_run_id ON public.sales_orders(print_run_id);
CREATE INDEX IF NOT EXISTS idx_sales_presentations_organization_id ON public.sales_presentations(organization_id);
CREATE INDEX IF NOT EXISTS idx_savings_organization_id ON public.savings(organization_id);
CREATE INDEX IF NOT EXISTS idx_savings_unit_of_measure_id ON public.savings(unit_of_measure_id);
CREATE INDEX IF NOT EXISTS idx_stock_on_hand_organization_id ON public.stock_on_hand(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_on_hand_product_id ON public.stock_on_hand(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_on_hand_warehouse_id ON public.stock_on_hand(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_supplier_communications_created_by ON public.supplier_communications(created_by);
CREATE INDEX IF NOT EXISTS idx_supplier_communications_purchase_order_id ON public.supplier_communications(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_attachments_supplier_quote_id ON public.supplier_quote_attachments(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_audit_supplier_quote_id ON public.supplier_quote_audit(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_cost_price_breaks_supplier_quote_id ON public.supplier_quote_extra_cost_price_breaks(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_costs_extra_cost_id ON public.supplier_quote_extra_costs(extra_cost_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_costs_price_break_id ON public.supplier_quote_extra_costs(price_break_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_costs_supplier_quote_id ON public.supplier_quote_extra_costs(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_costs_unit_of_measure_id ON public.supplier_quote_extra_costs(unit_of_measure_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_costs_price_breaks_extra_cost_id ON public.supplier_quote_extra_costs_price_breaks(extra_cost_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_costs_price_breaks_price_break_id ON public.supplier_quote_extra_costs_price_breaks(price_break_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_extra_costs_price_breaks_supplier_quote_id ON public.supplier_quote_extra_costs_price_breaks(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_formats_format_id ON public.supplier_quote_formats(format_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_formats_quote_request_format_id ON public.supplier_quote_formats(quote_request_format_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_formats_supplier_quote_id ON public.supplier_quote_formats(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_price_breaks_format_id ON public.supplier_quote_price_breaks(format_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_price_breaks_price_break_id ON public.supplier_quote_price_breaks(price_break_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_price_breaks_product_id ON public.supplier_quote_price_breaks(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_price_breaks_quote_request_format_id ON public.supplier_quote_price_breaks(quote_request_format_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_price_breaks_supplier_quote_id ON public.supplier_quote_price_breaks(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_savings_price_break_id ON public.supplier_quote_savings(price_break_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_savings_saving_id ON public.supplier_quote_savings(saving_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_savings_supplier_quote_id ON public.supplier_quote_savings(supplier_quote_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quote_savings_unit_of_measure_id ON public.supplier_quote_savings(unit_of_measure_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_organization_id ON public.supplier_quotes(organization_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_quote_request_id ON public.supplier_quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_supplier_quotes_supplier_id ON public.supplier_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_users_supplier_id ON public.supplier_users(supplier_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_organization_id ON public.suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_profile_id ON public.suppliers(profile_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_user_id ON public.typing_status(user_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_organization_id ON public.warehouses(organization_id);
