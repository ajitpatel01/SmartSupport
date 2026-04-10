import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description: "Authentication, tenancy, and data handling practices.",
};

export default function SecurityPage() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(70%_100%_at_70%_0%,oklch(0.28_0.06_158/0.2)_0%,transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">Security</h1>
        <div className="animate-fade-up animate-delay-100 text-muted-foreground mt-8 space-y-5 text-base leading-relaxed sm:text-[1.05rem]">
          <p>
            Sessions use short-lived access tokens and rotating refresh tokens. Presenting a reused
            refresh token revokes the entire family—mitigating token theft replay.
          </p>
          <p>
            Data is partitioned by organization at the database layer; API routes enforce org scope and
            role-based access for users, moderators, and admins.
          </p>
          <p>
            For production, configure CORS to your deployed web origin and run the API behind HTTPS.
            Treat Gemini and email provider keys as secrets—never embed them in client bundles.
          </p>
        </div>
      </div>
    </div>
  );
}
