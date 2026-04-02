"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Ticket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { fetchOrg, fetchTicketAnalytics, fetchTicketsQuery } from "@/lib/api-resources";

export default function AppHomePage() {
  const { user, hasMinRole } = useAuth();

  const { data: org } = useQuery({ queryKey: ["org"], queryFn: fetchOrg });
  const { data: ticketsPage } = useQuery({
    queryKey: ["tickets", "recent"],
    queryFn: () => fetchTicketsQuery("?limit=5"),
  });
  const { data: analytics } = useQuery({
    queryKey: ["analytics", "tickets"],
    queryFn: fetchTicketAnalytics,
    enabled: hasMinRole("admin"),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          {org?.name ?? "Your organization"} · {org?.plan ?? "—"} plan
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5" />
              Tickets
            </CardTitle>
            <CardDescription>Submit issues and track AI triage through resolution.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/app/tickets/new"
              className={cn(buttonVariants(), "inline-flex items-center")}
            >
              New ticket <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {hasMinRole("admin") && analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Last 30 days</CardTitle>
              <CardDescription>Ticket volume in your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{analytics.total}</p>
              <p className="text-muted-foreground text-sm">Total tickets</p>
            </CardContent>
          </Card>
        )}
      </div>

      {ticketsPage?.data?.length ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent tickets</CardTitle>
            <Link
              href="/app/tickets"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticketsPage.data.map((t) => (
              <Link
                key={t._id}
                href={`/app/tickets/${t._id}`}
                className="hover:bg-muted/60 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <span className="font-medium">{t.title}</span>
                <span className="text-muted-foreground text-xs capitalize">{t.status.replace("_", " ")}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
