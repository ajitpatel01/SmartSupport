import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
  description: "How AI-SmartSupport triages, routes, and reports on support work.",
};

export default function ProductPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Product</h1>
      <div className="text-muted-foreground mt-8 space-y-4 text-base leading-relaxed">
        <p>
          When a ticket arrives, our pipeline classifies it with Google Gemini—pulling
          category, priority, required skills, and structured notes for agents. Validated
          with Zod, those fields drive routing and analytics without fragile string
          parsing.
        </p>
        <p>
          Moderators are scored against ticket skills; we break ties by who has the
          lightest open queue. If no one clears the confidence threshold, we escalate to
          an org admin so nothing stalls.
        </p>
        <p>
          Inngest runs triage and assignment after create, watches SLAs on a schedule,
          and triggers CSAT when tickets resolve—so your HTTP API only does the work
          users are waiting on.
        </p>
      </div>
    </div>
  );
}
