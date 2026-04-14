// Creates a Stripe Checkout session for the caller's current organization.
// Expects: { plan: 'basic' | 'professional', cycle: 'monthly' | 'annual', currency: 'usd'|'eur'|'gbp', seats?: number }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { corsHeaders, json } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const TRIAL_DAYS = 14;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, { status: 401 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, { status: 401 });
    const userId = userData.user.id;

    const { plan, cycle, currency, seats } = await req.json();
    if (!["basic", "professional"].includes(plan)) {
      return json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!["monthly", "annual"].includes(cycle)) {
      return json({ error: "Invalid cycle" }, { status: 400 });
    }
    if (!["usd", "eur", "gbp"].includes(currency)) {
      return json({ error: "Invalid currency" }, { status: 400 });
    }

    // Profile → org
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_organization_id, email, first_name, last_name")
      .eq("id", userId)
      .single();

    const orgId = profile?.current_organization_id;
    if (!orgId) return json({ error: "No organization" }, { status: 400 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, stripe_customer_id")
      .eq("id", orgId)
      .single();

    // Confirm caller is owner/admin of the org
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", orgId)
      .eq("auth_user_id", userId)
      .single();
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return json({ error: "Only owners/admins can manage billing" }, { status: 403 });
    }

    // Price IDs live in env: STRIPE_PRICE_<PLAN>_<CYCLE>_<CURRENCY>
    const envKey = `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}_${currency.toUpperCase()}`;
    const priceId = Deno.env.get(envKey);
    if (!priceId) {
      return json({ error: `Price not configured (missing env ${envKey})` }, { status: 500 });
    }

    // Ensure Stripe customer
    let customerId = org?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email ?? undefined,
        name: org?.name ?? undefined,
        metadata: { organization_id: orgId, user_id: userId },
      });
      customerId = customer.id;
      await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", orgId);
    }

    const origin = req.headers.get("origin") ?? "http://localhost:8080";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: seats && seats > 0 ? seats : 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: { organization_id: orgId, plan_type: plan, billing_cycle: cycle },
      },
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      customer_update: { address: "auto", name: "auto" },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { organization_id: orgId, user_id: userId },
    });

    return json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("[create-checkout-session]", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
});
