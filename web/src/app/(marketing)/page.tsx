"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sparkles, Route, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/lib/demo/config";
import { enterDemoSession } from "@/lib/demo/session";

export default function LandingPage() {
  const router = useRouter();
  const demo = isDemoMode();

  function goDemo() {
    enterDemoSession();
    router.push("/app");
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,oklch(0.35_0.08_158/0.35)_0%,transparent_55%)]"
          aria-hidden
        />
        <div className="animate-fade-up relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="text-primary mb-4 text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
            AI-native support operations
          </p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.08]">
            Ship support that scales like your product
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">
            AI-SmartSupport triages tickets with Gemini, routes to the right agent by skill and load,
            and runs SLA workflows in the background—multi-tenant and production-minded out of the
            box.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "shadow-[var(--glow-primary)] h-11 min-w-[8rem] rounded-xl px-6 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]",
              )}
            >
              Start free
            </Link>
            {demo && (
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-xl px-5 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
                onClick={() => goDemo()}
              >
                View demo
              </Button>
            )}
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-xl border-primary/25 px-6 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="animate-fade-up animate-delay-100 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Built for teams that outgrow shared inboxes
        </h2>
        <div className="mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-up animate-delay-100 border-border/60">
            <CardHeader>
              <Sparkles className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg tracking-tight">AI triage</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              Category, priority, and agent-ready notes—schema-validated so downstream automation never
              breaks.
            </CardContent>
          </Card>
          <Card className="animate-fade-up animate-delay-200 border-border/60">
            <CardHeader>
              <Route className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg tracking-tight">Skill routing</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              Match agents by skills, break ties by open workload, fall back to admins when nobody
              qualifies.
            </CardContent>
          </Card>
          <Card className="animate-fade-up animate-delay-300 border-border/60">
            <CardHeader>
              <Zap className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg tracking-tight">Event-driven SLA</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              Background jobs for escalation and CSAT—decoupled from the request path so API stays
              fast.
            </CardContent>
          </Card>
          <Card className="animate-fade-up border-border/60">
            <CardHeader>
              <Shield className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg tracking-tight">Tenant isolation</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm leading-relaxed">
              Org-scoped data by design, JWT rotation with reuse detection, and RBAC for users,
              moderators, and admins.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
