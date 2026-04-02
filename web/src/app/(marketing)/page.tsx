import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Route, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div>
      <section className="border-b bg-gradient-to-b from-muted/40 to-background py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-primary mb-4 font-medium text-sm uppercase tracking-widest">
            AI-native support operations
          </p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Ship support that scales like your product
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            AI-SmartSupport triages tickets with Gemini, routes to the right agent by
            skill and load, and runs SLA workflows in the background—multi-tenant and
            production-minded out of the box.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="border-border bg-background hover:bg-muted inline-flex h-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Built for teams that outgrow shared inboxes
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Sparkles className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg">AI triage</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Category, priority, and agent-ready notes—schema-validated so downstream
              automation never breaks.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Route className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg">Skill routing</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Match agents by skills, break ties by open workload, fall back to admins
              when nobody qualifies.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg">Event-driven SLA</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Background jobs for escalation and CSAT—decoupled from the request path so
              API stays fast.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="text-primary mb-2 h-8 w-8" aria-hidden />
              <CardTitle className="text-lg">Tenant isolation</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Org-scoped data by design, JWT rotation with reuse detection, and RBAC
              for users, moderators, and admins.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
