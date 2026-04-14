import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Feature,
  PlanType,
  PLAN_LIMITS,
  hasFeature as hasFeatureImpl,
  isActiveStatus,
} from "@/lib/licensing";

type LicenseRow = {
  id: string;
  organization_id: string;
  license_plan_id: string;
  seat_count: number;
  billing_cycle: "monthly" | "annual";
  stripe_subscription_id: string | null;
  stripe_status: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  currency: string | null;
  is_active: boolean | null;
  license_plans: {
    id: string;
    name: string;
    plan_type: PlanType;
    monthly_price_per_seat: number;
    annual_price_per_seat: number;
    max_seats: number | null;
  } | null;
};

export function useLicense() {
  const { userProfile } = useAuth();
  const orgId = userProfile?.current_organization_id ?? null;

  const query = useQuery({
    queryKey: ["license", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<LicenseRow | null> => {
      if (!orgId) return null;
      const { data, error } = await supabase
        .from("organization_licenses")
        .select(
          `id, organization_id, license_plan_id, seat_count, billing_cycle,
           stripe_subscription_id, stripe_status, trial_ends_at,
           current_period_start, current_period_end, cancel_at_period_end,
           currency, is_active,
           license_plans:license_plan_id (
             id, name, plan_type, monthly_price_per_seat, annual_price_per_seat, max_seats
           )`
        )
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as LicenseRow | null;
    },
  });

  const plan: PlanType = query.data?.license_plans?.plan_type ?? "free";
  const limits = PLAN_LIMITS[plan];
  const active = isActiveStatus(query.data?.stripe_status) || plan === "free";
  const trialing = query.data?.stripe_status === "trialing";
  const trialEndsAt = query.data?.trial_ends_at ? new Date(query.data.trial_ends_at) : null;

  return {
    license: query.data,
    plan,
    limits,
    active,
    trialing,
    trialEndsAt,
    seatCount: query.data?.seat_count ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    hasFeature: (f: Feature) => hasFeatureImpl(plan, f),
    refetch: query.refetch,
  };
}
