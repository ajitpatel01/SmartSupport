"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchModeratorAnalytics, fetchTicketAnalytics } from "@/lib/api-resources";
import { useAuth } from "@/contexts/auth-context";

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="truncate">{label}</span>
        <span className="text-muted-foreground tabular-nums">{value}</span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { hasMinRole } = useAuth();

  const ticketsQ = useQuery({
    queryKey: ["analytics", "tickets"],
    queryFn: fetchTicketAnalytics,
    enabled: hasMinRole("admin"),
  });

  const modQ = useQuery({
    queryKey: ["analytics", "moderators"],
    queryFn: fetchModeratorAnalytics,
    enabled: hasMinRole("admin"),
  });

  if (!hasMinRole("admin")) {
    return (
      <p className="text-muted-foreground">Analytics is limited to organization admins.</p>
    );
  }

  const ta = ticketsQ.data;
  const maxStatus = ta
    ? Math.max(...Object.values(ta.byStatus), 1)
    : 1;
  const maxPri = ta ? Math.max(...Object.values(ta.byPriority), 1) : 1;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Last {ticketsQ.data?.period ?? "30d"} of ticket volume and moderator throughput.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>Total: {ta?.total ?? "—"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium">By status</h3>
              <div className="space-y-3">
                {ta &&
                  Object.entries(ta.byStatus).map(([k, v]) => (
                    <BarRow key={k} label={k.replace("_", " ")} value={v} max={maxStatus} />
                  ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium">By priority</h3>
              <div className="space-y-3">
                {ta &&
                  Object.entries(ta.byPriority).map(([k, v]) => (
                    <BarRow key={k} label={k} value={v} max={maxPri} />
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderators</CardTitle>
            <CardDescription>Assigned volume and resolution signal.</CardDescription>
          </CardHeader>
          <CardContent>
            {modQ.isLoading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Resolved</TableHead>
                    <TableHead className="text-right">Avg resolve</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modQ.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground text-center">
                        No assignment data yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    modQ.data?.map((row) => (
                      <TableRow key={row.moderatorId}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.totalTickets}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.resolvedTickets}</TableCell>
                        <TableCell className="text-muted-foreground text-right text-sm">
                          {row.avgResolutionMs != null
                            ? `${Math.round(row.avgResolutionMs / 60000)}m`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
