import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description: "Authentication, tenancy, and data handling practices.",
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Security</h1>
      <div className="text-muted-foreground mt-8 space-y-4 text-base leading-relaxed">
        <p>
          Sessions use short-lived access tokens and rotating refresh tokens. Presenting a
          reused refresh token revokes the entire family—mitigating token theft replay.
        </p>
        <p>
          Data is partitioned by organization at the database layer; API routes enforce
          org scope and role-based access for users, moderators, and admins.
        </p>
        <p>
          For production, configure CORS to your deployed web origin and run the API
          behind HTTPS. Treat Gemini and email provider keys as secrets—never embed them
          in client bundles.
        </p>
      </div>
    </div>
  );
}
