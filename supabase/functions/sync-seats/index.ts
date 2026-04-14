// Syncs the Stripe subscription quantity to match current org member count.
// Called from a Postgres trigger (or manually) after organization_members change.
// Accepts: { organization_id: string }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { corsHeaders, json } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { organization_id } = await req.json();
    if (!organization_id) return json({ error: "organization_id required" }, { status: 400 });

    const { data: license } = await supabase
      .from("organization_licenses")
      .select("stripe_subscription_id, license_plans!inner(plan_type, max_seats)")
      .eq("organization_id", organization_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!license?.stripe_subscription_id) {
      return json({ skipped: true, reason: "no active subscription" });
    }

    const { count } = await supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization_id);

    const newQuantity = Math.max(count ?? 1, 1);

    // Respect plan seat cap.
    const maxSeats = (license.license_plans as unknown as { max_seats: number | null })?.max_seats;
    if (maxSeats != null && newQuantity > maxSeats) {
      return json(
        { error: `Plan cap exceeded (${newQuantity} > ${maxSeats})`, maxSeats, requested: newQuantity },
        { status: 400 },
      );
    }

    const sub = await stripe.subscriptions.retrieve(license.stripe_subscription_id);
    const item = sub.items.data[0];
    if (!item) return json({ error: "no subscription item" }, { status: 500 });

    if (item.quantity === newQuantity) {
      return json({ skipped: true, reason: "already in sync", quantity: newQuantity });
    }

    await stripe.subscriptions.update(license.stripe_subscription_id, {
      items: [{ id: item.id, quantity: newQuantity }],
      proration_behavior: "create_prorations",
    });

    await supabase
      .from("organization_licenses")
      .update({ seat_count: newQuantity })
      .eq("stripe_subscription_id", license.stripe_subscription_id);

    return json({ ok: true, quantity: newQuantity });
  } catch (e) {
    console.error("[sync-seats]", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
});
