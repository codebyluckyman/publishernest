-- Stripe billing integration
-- Extends existing license_plans / organization_licenses tables with Stripe linkage
-- and adds a 'free' tier plus webhook idempotency table.

-- 1. Extend license_plan_type enum with 'free'
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'free'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'license_plan_type')
  ) THEN
    ALTER TYPE license_plan_type ADD VALUE 'free' BEFORE 'basic';
  END IF;
END $$;

-- 2. organizations → Stripe customer linkage
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- 3. Stripe product + price IDs live in env (easier test↔live swap).
-- See STRIPE_PRICE_* vars in edge function secrets.

-- 4. organization_licenses → full Stripe subscription state
ALTER TABLE organization_licenses
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_status TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd';

CREATE INDEX IF NOT EXISTS idx_org_licenses_stripe_subscription
  ON organization_licenses (stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_org_licenses_stripe_status
  ON organization_licenses (stripe_status);

-- 5. Webhook idempotency + audit
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_type
  ON stripe_webhook_events (type);

-- 6. Seed license plans (idempotent)
-- Prices are in dollars; Stripe IDs are filled in after products are created in Stripe dashboard.
INSERT INTO license_plans (
  plan_type, name, description,
  monthly_price_per_seat, annual_price_per_seat,
  max_seats, is_active, features
)
VALUES
  ('free', 'Free',
   'Trial out PublisherNest with a single user and essentials.',
   0, 0, 1, true,
   '{"max_quote_requests_per_month": 5, "max_suppliers": 2, "max_customers": 1, "features": []}'::jsonb),
  ('basic', 'Basic',
   'For small publishing teams ready to replace spreadsheets and email threads.',
   29, 288, 5, true,
   '{"max_quote_requests_per_month": 50, "max_suppliers": 10, "max_customers": 3, "features": []}'::jsonb),
  ('professional', 'Professional',
   'Full workflow with unlimited quotes, sales presentations, and publishing programs.',
   69, 708, 25, true,
   '{"max_quote_requests_per_month": null, "max_suppliers": null, "max_customers": null, "features": ["sales_presentations","publishing_programs","custom_fields","advanced_reporting"]}'::jsonb),
  ('enterprise', 'Enterprise',
   'Unlimited everything. SSO, API, audit logs, dedicated success manager.',
   149, 1524, NULL, true,
   '{"max_quote_requests_per_month": null, "max_suppliers": null, "max_customers": null, "features": ["sales_presentations","publishing_programs","custom_fields","advanced_reporting","api_access","sso","audit_logs","white_label"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- 7. RLS for stripe_webhook_events (locked down — only service role writes)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
