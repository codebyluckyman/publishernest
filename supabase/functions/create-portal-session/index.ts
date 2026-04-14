// Redirects the caller to the Stripe Customer Portal for their org.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { corsHeaders, json } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

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

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_organization_id")
      .eq("id", userData.user.id)
      .single();

    const orgId = profile?.current_organization_id;
    if (!orgId) return json({ error: "No organization" }, { status: 400 });

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", orgId)
      .eq("auth_user_id", userData.user.id)
      .single();
    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return json({ error: "Only owners/admins can manage billing" }, { status: 403 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", orgId)
      .single();

    if (!org?.stripe_customer_id) {
      return json({ error: "No Stripe customer for this organization" }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? "http://localhost:8080";
    const portal = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${origin}/billing`,
    });

    return json({ url: portal.url });
  } catch (e) {
    console.error("[create-portal-session]", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
});
