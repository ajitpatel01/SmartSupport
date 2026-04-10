import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple plans from free to enterprise with usage-based ticket quotas.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Try the full workflow with your team.",
    features: ["10 tickets / month", "AI triage & routing", "Core analytics"],
    cta: "Get started",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    desc: "For growing support and success teams.",
    features: [
      "500 tickets / month",
      "SLA escalation jobs",
      "Moderator dashboards",
      "Email + in-app notifications",
    ],
    cta: "Start free, upgrade later",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Unlimited scale, security review, and SSO roadmap.",
    features: ["Unlimited tickets", "Dedicated support", "Custom contracts"],
    cta: "Contact sales",
    href: "mailto:sales@smartsupport.io",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(80%_100%_at_50%_0%,oklch(0.32_0.07_158/0.25)_0%,transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="animate-fade-up text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pricing</h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base leading-relaxed">
            Start on the free tier and move up as volume grows. Stripe metered billing is on the
            roadmap—today quotas are enforced server-side per plan.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlight
                ? "border-primary/40 shadow-[var(--glow-primary)] ring-1 ring-primary/25"
                : "border-border/60"
            }
          >
            <CardHeader>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{tier.desc}</p>
              <p className="pt-2 text-3xl font-semibold">{tier.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link
                href={tier.href}
                className={
                  tier.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 w-full items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors"
                    : "border-border bg-background hover:bg-muted inline-flex h-9 w-full items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors"
                }
              >
                {tier.cta}
              </Link>
            </CardFooter>
          </Card>
        ))}
        </div>
      </div>
    </div>
  );
}
