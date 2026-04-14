import type { Database } from "@/integrations/supabase/types";

export type PlanType = Database["public"]["Enums"]["license_plan_type"] | "free";
export type BillingCycle = Database["public"]["Enums"]["billing_cycle"];
export type Currency = "usd" | "eur" | "gbp";

export type Feature =
  | "sales_presentations"
  | "publishing_programs"
  | "custom_fields"
  | "advanced_reporting"
  | "api_access"
  | "sso"
  | "audit_logs"
  | "white_label";

type PlanLimits = {
  maxSeats: number | null;
  maxQuoteRequestsPerMonth: number | null;
  maxSuppliers: number | null;
  maxCustomers: number | null;
  features: Feature[];
};

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxSeats: 1,
    maxQuoteRequestsPerMonth: 5,
    maxSuppliers: 2,
    maxCustomers: 1,
    features: [],
  },
  basic: {
    maxSeats: 5,
    maxQuoteRequestsPerMonth: 50,
    maxSuppliers: 10,
    maxCustomers: 3,
    features: [],
  },
  professional: {
    maxSeats: 25,
    maxQuoteRequestsPerMonth: null,
    maxSuppliers: null,
    maxCustomers: null,
    features: ["sales_presentations", "publishing_programs", "custom_fields", "advanced_reporting"],
  },
  enterprise: {
    maxSeats: null,
    maxQuoteRequestsPerMonth: null,
    maxSuppliers: null,
    maxCustomers: null,
    features: [
      "sales_presentations",
      "publishing_programs",
      "custom_fields",
      "advanced_reporting",
      "api_access",
      "sso",
      "audit_logs",
      "white_label",
    ],
  },
};

export const PLAN_PRICING: Record<
  Exclude<PlanType, "free" | "enterprise">,
  Record<Currency, { monthly: number; annual: number }>
> = {
  basic: {
    usd: { monthly: 29, annual: 288 },
    eur: { monthly: 27, annual: 264 },
    gbp: { monthly: 23, annual: 228 },
  },
  professional: {
    usd: { monthly: 69, annual: 708 },
    eur: { monthly: 63, annual: 648 },
    gbp: { monthly: 55, annual: 552 },
  },
};

export const TRIAL_DAYS = 14;

export function hasFeature(plan: PlanType | null | undefined, feature: Feature): boolean {
  if (!plan) return false;
  return PLAN_LIMITS[plan].features.includes(feature);
}

export function getSeatLimit(plan: PlanType): number | null {
  return PLAN_LIMITS[plan].maxSeats;
}

export function getQuoteRequestLimit(plan: PlanType): number | null {
  return PLAN_LIMITS[plan].maxQuoteRequestsPerMonth;
}

export function getSupplierLimit(plan: PlanType): number | null {
  return PLAN_LIMITS[plan].maxSuppliers;
}

export function getCustomerLimit(plan: PlanType): number | null {
  return PLAN_LIMITS[plan].maxCustomers;
}

export function isActiveStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

export function formatPrice(amount: number, currency: Currency): string {
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  });
  return fmt.format(amount);
}
