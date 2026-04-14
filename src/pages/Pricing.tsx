import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLAN_PRICING, TRIAL_DAYS, formatPrice, type Currency } from "@/lib/licensing";

const CONTACT_SALES_EMAIL = "sales@publishernest.com";

type TierId = "free" | "basic" | "professional" | "enterprise";

type Tier = {
  id: TierId;
  name: string;
  tagline: string;
  highlight?: boolean;
  cta: string;
  features: string[];
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try PublisherNest with your first project.",
    cta: "Get started",
    features: [
      "1 user",
      "5 quote requests / month",
      "2 suppliers",
      "1 customer",
      "Core quotes, POs & sales orders",
      "Exports include “Powered by PublisherNest”",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    tagline: "Small teams replacing spreadsheets and email threads.",
    cta: "Start 14-day trial",
    features: [
      "Up to 5 users",
      "50 quote requests / month",
      "10 suppliers",
      "3 customers",
      "Core quotes, POs & sales orders",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Full publishing workflow, no limits on quotes or partners.",
    highlight: true,
    cta: "Start 14-day trial",
    features: [
      "Up to 25 users",
      "Unlimited quote requests",
      "Unlimited suppliers & customers",
      "Sales presentations",
      "Publishing programs",
      "Custom product fields",
      "Advanced reporting",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Large publishers and printer-led white-label deployments.",
    cta: "Contact sales",
    features: [
      "Unlimited users",
      "Everything in Professional",
      "SSO (SAML / OAuth)",
      "API access",
      "Audit logs & data retention",
      "White-label / custom domain",
      "Dedicated success manager",
      "SLA & onboarding",
    ],
  },
];

export default function Pricing() {
  const [cycle, setCycle] = useState<"monthly" | "annual">("annual");
  const [currency, setCurrency] = useState<Currency>("usd");

  const priceFor = (tier: TierId) => {
    if (tier === "free") return { label: formatPrice(0, currency), sub: "forever" };
    if (tier === "enterprise") return { label: "Let's talk", sub: "custom pricing" };
    const p = PLAN_PRICING[tier][currency];
    if (cycle === "annual") {
      const perMonth = Math.round(p.annual / 12);
      return { label: `${formatPrice(perMonth, currency)}`, sub: "per seat / month, billed annually" };
    }
    return { label: `${formatPrice(p.monthly, currency)}`, sub: "per seat / month" };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple, per-seat pricing</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {TRIAL_DAYS} days free. No credit card required.
        </p>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <span className={cycle === "monthly" ? "font-medium" : "text-muted-foreground"}>Monthly</span>
            <Switch
              checked={cycle === "annual"}
              onCheckedChange={(v) => setCycle(v ? "annual" : "monthly")}
            />
            <span className={cycle === "annual" ? "font-medium" : "text-muted-foreground"}>
              Annual <span className="text-xs text-green-600">(save ~15%)</span>
            </span>
          </div>

          <Tabs value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <TabsList>
              <TabsTrigger value="usd">USD</TabsTrigger>
              <TabsTrigger value="eur">EUR</TabsTrigger>
              <TabsTrigger value="gbp">GBP</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const price = priceFor(tier.id);
          return (
            <Card
              key={tier.id}
              className={tier.highlight ? "border-primary shadow-lg ring-2 ring-primary/20" : ""}
            >
              <CardHeader>
                {tier.highlight && (
                  <div className="mb-2 w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most popular
                  </div>
                )}
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription className="min-h-[3rem]">{tier.tagline}</CardDescription>
                <div className="pt-2">
                  <div className="text-3xl font-bold">{price.label}</div>
                  <div className="text-sm text-muted-foreground">{price.sub}</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {tier.id === "enterprise" ? (
                  <Button asChild className="w-full" variant="outline">
                    <a href={`mailto:${CONTACT_SALES_EMAIL}?subject=Enterprise%20inquiry`}>
                      {tier.cta}
                    </a>
                  </Button>
                ) : tier.id === "free" ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/auth?mode=signup&plan=free">{tier.cta}</Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full"
                    variant={tier.highlight ? "default" : "outline"}
                  >
                    <Link to={`/auth?mode=signup&plan=${tier.id}&cycle=${cycle}&currency=${currency}`}>
                      {tier.cta}
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Prices in {currency.toUpperCase()}. Taxes calculated at checkout.</p>
        <p className="mt-1">
          Questions? <a className="underline" href={`mailto:${CONTACT_SALES_EMAIL}`}>{CONTACT_SALES_EMAIL}</a>
        </p>
      </div>
    </div>
  );
}

// Unused but kept for future comparison table
void Minus;
