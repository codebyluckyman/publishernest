-- =====================================================================
-- Row Level Security: helpers + enable RLS on every table + policies
-- =====================================================================
-- Tenancy model:
--   * Most data is scoped to an organization (organization_id column).
--   * Users belong to an org via organization_members.
--   * Some tables are user-scoped (profiles, notification prefs, push subs,
--     chat) or global-read (license_plans).
--   * Edge functions use the service role key which bypasses RLS.

-- =========== HELPER FUNCTIONS ===========
-- SECURITY DEFINER so they bypass RLS on organization_members (prevents recursion).

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id AND auth_user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id
      AND auth_user_id = auth.uid()
      AND role IN ('owner','admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.user_orgs()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM organization_members WHERE auth_user_id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.user_orgs() TO authenticated, anon;

-- =========== ENABLE (and FORCE) RLS ON EVERY PUBLIC TABLE ===========
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- stripe_webhook_events: service role only; no policies. Drop FORCE so service role operates normally.
ALTER TABLE public.stripe_webhook_events NO FORCE ROW LEVEL SECURITY;

-- =========== LICENSE_PLANS: global read for all users ===========
DROP POLICY IF EXISTS "license_plans_read_all" ON public.license_plans;
CREATE POLICY "license_plans_read_all" ON public.license_plans
  FOR SELECT TO authenticated, anon USING (true);

-- =========== ORG-SCOPED TABLES (has organization_id column) ===========
DO $$
DECLARE
  t text;
  org_tables text[] := ARRAY[
    'api_keys', 'customers', 'extra_costs', 'format_components', 'formats',
    'invoices', 'organization_default_price_breaks', 'organization_invoice_counters',
    'organization_notification_preferences', 'organization_notifications',
    'organization_product_fields', 'organization_production_steps',
    'organization_purchase_order_counters', 'organization_quote_counters',
    'organization_quote_request_counters', 'organization_reminder_settings',
    'organization_sales_order_counters', 'print_runs', 'product_prices',
    'products', 'publishing_program_tags', 'publishing_programs',
    'purchase_orders', 'quote_requests', 'sales_orders', 'sales_presentations',
    'savings', 'stock_on_hand', 'supplier_quotes', 'suppliers',
    'unit_of_measures', 'warehouses'
  ];
BEGIN
  FOREACH t IN ARRAY org_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "members_all" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "members_all" ON public.%I FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id))',
      t
    );
  END LOOP;
END $$;

-- organization_licenses: members read, admins write
DROP POLICY IF EXISTS "members_read" ON public.organization_licenses;
DROP POLICY IF EXISTS "admins_write" ON public.organization_licenses;
CREATE POLICY "members_read" ON public.organization_licenses
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "admins_write" ON public.organization_licenses
  FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id))
  WITH CHECK (public.is_org_admin(organization_id));

-- organization_members: self-read, org-peer read, admin manage
DROP POLICY IF EXISTS "self_read" ON public.organization_members;
DROP POLICY IF EXISTS "org_members_read" ON public.organization_members;
DROP POLICY IF EXISTS "admins_manage" ON public.organization_members;
CREATE POLICY "self_read" ON public.organization_members
  FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "org_members_read" ON public.organization_members
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY "admins_manage" ON public.organization_members
  FOR ALL TO authenticated
  USING (public.is_org_admin(organization_id))
  WITH CHECK (public.is_org_admin(organization_id));

-- organizations: members read, admins update, any authed can create
DROP POLICY IF EXISTS "members_read" ON public.organizations;
DROP POLICY IF EXISTS "admins_update" ON public.organizations;
DROP POLICY IF EXISTS "authed_create" ON public.organizations;
CREATE POLICY "members_read" ON public.organizations
  FOR SELECT TO authenticated USING (public.is_org_member(id));
CREATE POLICY "admins_update" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.is_org_admin(id))
  WITH CHECK (public.is_org_admin(id));
CREATE POLICY "authed_create" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (true);

-- =========== CHILD TABLES (scope via parent org) ===========

DROP POLICY IF EXISTS "members_all" ON public.customer_delivery_locations;
CREATE POLICY "members_all" ON public.customer_delivery_locations
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.customers c WHERE c.id = customer_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.customers c WHERE c.id = customer_id)));

DROP POLICY IF EXISTS "members_all" ON public.customer_requirements;
CREATE POLICY "members_all" ON public.customer_requirements
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.customers c WHERE c.id = customer_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.customers c WHERE c.id = customer_id)));

DROP POLICY IF EXISTS "members_all" ON public.format_component_links;
CREATE POLICY "members_all" ON public.format_component_links
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.formats f WHERE f.id = format_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.formats f WHERE f.id = format_id)));

DROP POLICY IF EXISTS "members_all" ON public.invoice_line_items;
CREATE POLICY "members_all" ON public.invoice_line_items
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.invoices i WHERE i.id = invoice_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.invoices i WHERE i.id = invoice_id)));

DROP POLICY IF EXISTS "members_all" ON public.product_custom_field_values;
CREATE POLICY "members_all" ON public.product_custom_field_values
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.products p WHERE p.id = product_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.products p WHERE p.id = product_id)));

DROP POLICY IF EXISTS "members_all" ON public.program_formats;
CREATE POLICY "members_all" ON public.program_formats
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.publishing_programs pp WHERE pp.id = program_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.publishing_programs pp WHERE pp.id = program_id)));

DROP POLICY IF EXISTS "members_all" ON public.program_titles;
CREATE POLICY "members_all" ON public.program_titles
  FOR ALL TO authenticated
  USING (public.is_org_member((
    SELECT pp.organization_id FROM public.program_formats pf
    JOIN public.publishing_programs pp ON pp.id = pf.program_id
    WHERE pf.id = program_format_id
  )))
  WITH CHECK (public.is_org_member((
    SELECT pp.organization_id FROM public.program_formats pf
    JOIN public.publishing_programs pp ON pp.id = pf.program_id
    WHERE pf.id = program_format_id
  )));

-- purchase_order_*
DROP POLICY IF EXISTS "members_all" ON public.purchase_order_audit;
CREATE POLICY "members_all" ON public.purchase_order_audit
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.purchase_orders p WHERE p.id = purchase_order_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.purchase_orders p WHERE p.id = purchase_order_id)));

DROP POLICY IF EXISTS "members_all" ON public.purchase_order_line_items;
CREATE POLICY "members_all" ON public.purchase_order_line_items
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.purchase_orders p WHERE p.id = purchase_order_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.purchase_orders p WHERE p.id = purchase_order_id)));

-- quote_request_*
DROP POLICY IF EXISTS "members_all" ON public.quote_request_attachments;
CREATE POLICY "members_all" ON public.quote_request_attachments
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)));

DROP POLICY IF EXISTS "members_all" ON public.quote_request_audit;
CREATE POLICY "members_all" ON public.quote_request_audit
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)));

DROP POLICY IF EXISTS "members_all" ON public.quote_request_extra_costs;
CREATE POLICY "members_all" ON public.quote_request_extra_costs
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)));

DROP POLICY IF EXISTS "members_all" ON public.quote_request_formats;
CREATE POLICY "members_all" ON public.quote_request_formats
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)));

DROP POLICY IF EXISTS "members_all" ON public.quote_request_savings;
CREATE POLICY "members_all" ON public.quote_request_savings
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)));

-- quote_request_format_price_breaks / format_products → quote_request_formats → quote_requests
DROP POLICY IF EXISTS "members_all" ON public.quote_request_format_price_breaks;
CREATE POLICY "members_all" ON public.quote_request_format_price_breaks
  FOR ALL TO authenticated
  USING (public.is_org_member((
    SELECT q.organization_id FROM public.quote_request_formats qrf
    JOIN public.quote_requests q ON q.id = qrf.quote_request_id
    WHERE qrf.id = quote_request_format_id
  )))
  WITH CHECK (public.is_org_member((
    SELECT q.organization_id FROM public.quote_request_formats qrf
    JOIN public.quote_requests q ON q.id = qrf.quote_request_id
    WHERE qrf.id = quote_request_format_id
  )));

DROP POLICY IF EXISTS "members_all" ON public.quote_request_format_products;
CREATE POLICY "members_all" ON public.quote_request_format_products
  FOR ALL TO authenticated
  USING (public.is_org_member((
    SELECT q.organization_id FROM public.quote_request_formats qrf
    JOIN public.quote_requests q ON q.id = qrf.quote_request_id
    WHERE qrf.id = quote_request_format_id
  )))
  WITH CHECK (public.is_org_member((
    SELECT q.organization_id FROM public.quote_request_formats qrf
    JOIN public.quote_requests q ON q.id = qrf.quote_request_id
    WHERE qrf.id = quote_request_format_id
  )));

-- sales_order_*
DROP POLICY IF EXISTS "members_all" ON public.sales_order_audit;
CREATE POLICY "members_all" ON public.sales_order_audit
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)));

DROP POLICY IF EXISTS "members_all" ON public.sales_order_charges;
CREATE POLICY "members_all" ON public.sales_order_charges
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)));

DROP POLICY IF EXISTS "members_all" ON public.sales_order_line_items;
CREATE POLICY "members_all" ON public.sales_order_line_items
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)));

DROP POLICY IF EXISTS "members_all" ON public.sales_order_requirements;
CREATE POLICY "members_all" ON public.sales_order_requirements
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.sales_orders s WHERE s.id = sales_order_id)));

-- presentation_* → sales_presentations
DROP POLICY IF EXISTS "members_all" ON public.presentation_analytics;
CREATE POLICY "members_all" ON public.presentation_analytics
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.sales_presentations sp WHERE sp.id = presentation_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.sales_presentations sp WHERE sp.id = presentation_id)));
-- anon can insert a view-event (for shared-presentation analytics tracking)
DROP POLICY IF EXISTS "anon_insert_view" ON public.presentation_analytics;
CREATE POLICY "anon_insert_view" ON public.presentation_analytics
  FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "members_all" ON public.presentation_sections;
CREATE POLICY "members_all" ON public.presentation_sections
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.sales_presentations sp WHERE sp.id = presentation_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.sales_presentations sp WHERE sp.id = presentation_id)));

DROP POLICY IF EXISTS "members_all" ON public.presentation_items;
CREATE POLICY "members_all" ON public.presentation_items
  FOR ALL TO authenticated
  USING (public.is_org_member((
    SELECT sp.organization_id FROM public.presentation_sections ps
    JOIN public.sales_presentations sp ON sp.id = ps.presentation_id
    WHERE ps.id = section_id
  )))
  WITH CHECK (public.is_org_member((
    SELECT sp.organization_id FROM public.presentation_sections ps
    JOIN public.sales_presentations sp ON sp.id = ps.presentation_id
    WHERE ps.id = section_id
  )));

DROP POLICY IF EXISTS "members_all" ON public.presentation_shares;
CREATE POLICY "members_all" ON public.presentation_shares
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.sales_presentations sp WHERE sp.id = presentation_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.sales_presentations sp WHERE sp.id = presentation_id)));
-- anon can read a share row by the share_token (for public presentation viewer)
DROP POLICY IF EXISTS "public_read_by_token" ON public.presentation_shares;
CREATE POLICY "public_read_by_token" ON public.presentation_shares
  FOR SELECT TO anon USING (share_token IS NOT NULL);

-- supplier_communications → purchase_orders
DROP POLICY IF EXISTS "members_all" ON public.supplier_communications;
CREATE POLICY "members_all" ON public.supplier_communications
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.purchase_orders p WHERE p.id = purchase_order_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.purchase_orders p WHERE p.id = purchase_order_id)));

-- supplier_quote_* → supplier_quotes
DO $$
DECLARE
  t text;
  sq_tables text[] := ARRAY[
    'supplier_quote_attachments', 'supplier_quote_audit',
    'supplier_quote_extra_cost_price_breaks', 'supplier_quote_extra_costs',
    'supplier_quote_extra_costs_price_breaks', 'supplier_quote_formats',
    'supplier_quote_price_breaks', 'supplier_quote_savings'
  ];
BEGIN
  FOREACH t IN ARRAY sq_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "members_all" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "members_all" ON public.%I FOR ALL TO authenticated USING (public.is_org_member((SELECT organization_id FROM public.supplier_quotes sq WHERE sq.id = supplier_quote_id))) WITH CHECK (public.is_org_member((SELECT organization_id FROM public.supplier_quotes sq WHERE sq.id = supplier_quote_id)))',
      t
    );
  END LOOP;
END $$;

-- supplier_users → suppliers
DROP POLICY IF EXISTS "members_all" ON public.supplier_users;
CREATE POLICY "members_all" ON public.supplier_users
  FOR ALL TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.suppliers s WHERE s.id = supplier_id)))
  WITH CHECK (public.is_org_member((SELECT organization_id FROM public.suppliers s WHERE s.id = supplier_id)));

-- notification_delivery_log → quote_requests (read-only for members; writes via service role)
DROP POLICY IF EXISTS "members_read" ON public.notification_delivery_log;
CREATE POLICY "members_read" ON public.notification_delivery_log
  FOR SELECT TO authenticated
  USING (public.is_org_member((SELECT organization_id FROM public.quote_requests q WHERE q.id = quote_request_id)));

-- =========== PROFILES ===========
DROP POLICY IF EXISTS "self_read" ON public.profiles;
DROP POLICY IF EXISTS "shared_org_read" ON public.profiles;
DROP POLICY IF EXISTS "self_insert" ON public.profiles;
DROP POLICY IF EXISTS "self_update" ON public.profiles;

CREATE POLICY "self_read" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "shared_org_read" ON public.profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.organization_members m1
    JOIN public.organization_members m2 ON m1.organization_id = m2.organization_id
    WHERE m1.auth_user_id = auth.uid() AND m2.auth_user_id = profiles.id
  ));
CREATE POLICY "self_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- =========== USER-SCOPED TABLES ===========
DROP POLICY IF EXISTS "self_all" ON public.notification_preferences;
CREATE POLICY "self_all" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "self_all" ON public.push_subscriptions;
CREATE POLICY "self_all" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- product_saved_views: org peers can read; user can only create/edit own
DROP POLICY IF EXISTS "members_all" ON public.product_saved_views;
DROP POLICY IF EXISTS "members_read" ON public.product_saved_views;
DROP POLICY IF EXISTS "self_write" ON public.product_saved_views;
CREATE POLICY "members_read" ON public.product_saved_views
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));
CREATE POLICY "self_write" ON public.product_saved_views
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id) AND user_id = auth.uid())
  WITH CHECK (public.is_org_member(organization_id) AND user_id = auth.uid());

-- =========== CHAT / MESSAGING ===========
DROP POLICY IF EXISTS "sender_or_receiver_read" ON public.communications;
DROP POLICY IF EXISTS "sender_insert" ON public.communications;
DROP POLICY IF EXISTS "sender_update" ON public.communications;
CREATE POLICY "sender_or_receiver_read" ON public.communications
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "sender_insert" ON public.communications
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "sender_update" ON public.communications
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "self_all" ON public.conversations;
CREATE POLICY "self_all" ON public.conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "self_all" ON public.typing_status;
CREATE POLICY "self_all" ON public.typing_status
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "self_all" ON public.message_reads;
CREATE POLICY "self_all" ON public.message_reads
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
