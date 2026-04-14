import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useLicense } from "@/hooks/useLicense";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, TRIAL_DAYS, type Currency } from "@/lib/licensing";
import { toast } from "@/hooks/use-toast";

export default function Billing() {
  const { license, plan, limits, active, trialing, trialEndsAt, seatCount, isLoading } = useLicense();
  const [portalLoading, setPortalLoading] = useState(false);

  const currency = (license?.currency ?? "usd") as Currency;
  const cycle = license?.billing_cycle ?? "monthly";
  const planName = license?.license_plans?.name ?? "Free";
  const pricePerSeat =
    cycle === "annual"
      ? Math.round((license?.license_plans?.annual_price_per_seat ?? 0) / 12)
      : license?.license_plans?.monthly_price_per_seat ?? 0;
  const monthlyTotal = pricePerSeat * Math.max(seatCount, 1);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e: unknown) {
      toast({
        title: "Could not open billing portal",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading your plan…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing & Plan</h1>
        <p className="text-muted-foreground">Manage your subscription, seats, and invoices.</p>
      </div>

      {trialing && trialEndsAt && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Free trial</AlertTitle>
          <AlertDescription>
            Your {TRIAL_DAYS}-day trial ends {trialEndsAt.toLocaleDateString()}.{" "}
            Add a payment method any time from the portal below.
          </AlertDescription>
        </Alert>
      )}

      {!active && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription inactive</AlertTitle>
          <AlertDescription>
            Your subscription is {license?.stripe_status ?? "not active"}.
            Update your payment method to restore access.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {planName}
                {plan !== "free" && (
                  <Badge variant={active ? "default" : "destructive"}>
                    {license?.stripe_status ?? "active"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {cycle === "annual" ? "Billed annually" : "Billed monthly"} ·{" "}
                {formatPrice(pricePerSeat, currency)}/seat/month
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">
                {formatPrice(monthlyTotal, currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                {seatCount} seat{seatCount === 1 ? "" : "s"} × {formatPrice(pricePerSeat, currency)}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <LimitBox label="Seat limit" value={limits.maxSeats === null ? "Unlimited" : String(limits.maxSeats)} />
            <LimitBox
              label="Quote requests / mo"
              value={limits.maxQuoteRequestsPerMonth === null ? "Unlimited" : String(limits.maxQuoteRequestsPerMonth)}
            />
            <LimitBox
              label="Suppliers"
              value={limits.maxSuppliers === null ? "Unlimited" : String(limits.maxSuppliers)}
            />
            <LimitBox
              label="Customers"
              value={limits.maxCustomers === null ? "Unlimited" : String(limits.maxCustomers)}
            />
          </div>

          {license?.current_period_end && (
            <p className="text-sm text-muted-foreground">
              {license?.cancel_at_period_end
                ? `Cancels on ${new Date(license.current_period_end).toLocaleDateString()}.`
                : `Next invoice on ${new Date(license.current_period_end).toLocaleDateString()}.`}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {plan === "free" ? (
              <Button asChild>
                <Link to="/pricing">Upgrade plan</Link>
              </Button>
            ) : (
              <>
                <Button onClick={openPortal} disabled={portalLoading}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {portalLoading ? "Opening…" : "Manage subscription"}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/pricing">Change plan</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LimitBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
