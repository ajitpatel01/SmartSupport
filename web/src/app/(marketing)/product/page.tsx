import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
  description: "How AI-SmartSupport triages, routes, and reports on support work.",
};

export default function ProductPage() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_30%_0%,oklch(0.3_0.06_158/0.22)_0%,transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">Product</h1>
        <div className="animate-fade-up animate-delay-100 text-muted-foreground mt-8 space-y-5 text-base leading-relaxed sm:text-[1.05rem]">
          <p>
            When a ticket arrives, our pipeline classifies it with Google Gemini—pulling category,
            priority, required skills, and structured notes for agents. Validated with Zod, those
            fields drive routing and analytics without fragile string parsing.
          </p>
          <p>
            Moderators are scored against ticket skills; we break ties by who has the lightest open
            queue. If no one clears the confidence threshold, we escalate to an org admin so nothing
            stalls.
          </p>
          <p>
            Inngest runs triage and assignment after create, watches SLAs on a schedule, and triggers
            CSAT when tickets resolve—so your HTTP API only does the work users are waiting on.
          </p>
        </div>
      </div>
    </div>
  );
}
