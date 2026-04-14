// Stripe webhook receiver. Verifies signature, upserts subscription state
// into organization_licenses, and logs events for idempotency.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Idempotency: skip if we already processed this event.
  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("processed_at")
    .eq("id", event.id)
    .maybeSingle();
  if (existing?.processed_at) {
    return new Response("ok", { status: 200 });
  }

  await supabase
    .from("stripe_webhook_events")
    .upsert({ id: event.id, type: event.type, payload: event as unknown as object });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.trial_will_end":
        await upsertSubscription(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await markSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_failed":
        await onPaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        // Not tracked.
        break;
    }

    await supabase
      .from("stripe_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", event.id);

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(`[stripe-webhook] handler failed for ${event.type}`, e);
    return new Response("handler error", { status: 500 });
  }
});

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription) return;
  const sub = await stripe.subscriptions.retrieve(
    typeof session.subscription === "string" ? session.subscription : session.subscription.id,
  );
  await upsertSubscription(sub);
}

async function upsertSubscription(sub: Stripe.Subscription) {
  const orgId =
    (sub.metadata?.organization_id as string | undefined) ??
    (await orgIdFromCustomer(sub.customer as string));
  if (!orgId) {
    console.warn("[stripe-webhook] no organization_id for subscription", sub.id);
    return;
  }

  const price = sub.items.data[0]?.price;
  const planType = (price?.metadata?.plan_type as string | undefined) ?? null;
  const billingCycle =
    (price?.recurring?.interval === "year" ? "annual" : "monthly") as "annual" | "monthly";
  const currency = (price?.currency ?? "usd").toLowerCase();
  const seatCount = sub.items.data[0]?.quantity ?? 1;

  // Look up license_plan row by plan_type
  let licensePlanId: string | null = null;
  if (planType) {
    const { data: plan } = await supabase
      .from("license_plans")
      .select("id")
      .eq("plan_type", planType)
      .maybeSingle();
    licensePlanId = plan?.id ?? null;
  }

  const record: Record<string, unknown> = {
    organization_id: orgId,
    license_plan_id: licensePlanId,
    seat_count: seatCount,
    billing_cycle: billingCycle,
    currency,
    stripe_subscription_id: sub.id,
    stripe_status: sub.status,
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    is_active: ["active", "trialing", "past_due"].includes(sub.status),
    start_date: new Date(sub.start_date * 1000).toISOString(),
  };

  // Deactivate any other licenses for this org first.
  await supabase
    .from("organization_licenses")
    .update({ is_active: false })
    .eq("organization_id", orgId)
    .neq("stripe_subscription_id", sub.id);

  await supabase
    .from("organization_licenses")
    .upsert(record, { onConflict: "stripe_subscription_id" });
}

async function markSubscriptionCanceled(sub: Stripe.Subscription) {
  await supabase
    .from("organization_licenses")
    .update({ stripe_status: "canceled", is_active: false })
    .eq("stripe_subscription_id", sub.id);
}

async function onPaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  const subId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;
  await supabase
    .from("organization_licenses")
    .update({ stripe_status: "past_due" })
    .eq("stripe_subscription_id", subId);
}

async function orgIdFromCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from("organizations")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}
