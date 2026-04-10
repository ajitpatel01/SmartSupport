"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { fetchTicketsQuery } from "@/lib/api-resources";
import type { TicketStatus, TicketPriority } from "@/lib/types";

function buildQuery(params: {
  status?: string;
  priority?: string;
  cursor?: string | null;
}) {
  const sp = new URLSearchParams();
  sp.set("limit", "20");
  if (params.status && params.status !== "all") sp.set("status", params.status);
  if (params.priority && params.priority !== "all") sp.set("priority", params.priority);
  if (params.cursor) sp.set("cursor", params.cursor);
  return `?${sp.toString()}`;
}

export default function TicketsListPage() {
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["tickets", "list", status, priority],
    queryFn: ({ pageParam }) =>
      fetchTicketsQuery(
        buildQuery({ status, priority, cursor: pageParam as string | null }),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor : undefined,
  });

  const rows = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data?.pages],
  );

  function statusBadge(s: TicketStatus) {
    const variant =
      s === "open"
        ? "success"
        : s === "in_progress"
          ? "default"
          : s === "resolved"
            ? "outline"
            : "muted";
    return (
      <Badge variant={variant} className="capitalize">
        {s.replace("_", " ")}
      </Badge>
    );
  }

  function priorityBadge(p: TicketPriority) {
    return (
      <span className="text-muted-foreground text-sm capitalize">{p}</span>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tickets</h1>
          <p className="text-muted-foreground mt-1 text-sm">Cursor-paginated, org-scoped.</p>
        </div>
        <Link
          href="/app/tickets/new"
          className={cn(
            buttonVariants(),
            "inline-flex h-11 min-h-[44px] shrink-0 items-center justify-center rounded-xl px-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99] sm:h-9",
          )}
        >
          <Plus className="mr-2 h-4 w-4" />
          New ticket
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Select
          value={status}
          onValueChange={(v) => {
            if (v) setStatus(v);
          }}
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:h-9 sm:w-[min(100%,11rem)]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priority}
          onValueChange={(v) => {
            if (v) setPriority(v);
          }}
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:h-9 sm:w-[min(100%,11rem)]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3 lg:hidden">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : null}
      {isLoading ? (
        <div className="hidden space-y-3 p-6 lg:block">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      ) : null}

      {!isLoading && rows.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="text-muted-foreground py-12 text-center text-sm">
            No tickets yet.{" "}
            <Link href="/app/tickets/new" className="text-primary font-medium underline-offset-4 hover:underline">
              Create one
            </Link>
            .
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && rows.length > 0 ? (
        <div className="lg:hidden">
          <ul className="space-y-3">
            {rows.map((t) => (
              <li key={t._id}>
                <Link href={`/app/tickets/${t._id}`} className="block">
                  <Card className="border-border/60 transition-colors duration-200 hover:border-primary/25">
                    <CardContent className="space-y-3 p-4">
                      <p className="text-foreground font-medium leading-snug">{t.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(t.status)}
                        <span className="text-muted-foreground text-xs capitalize">
                          {t.priority} priority
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Updated {new Date(t.updatedAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!isLoading && rows.length > 0 ? (
        <div className="relative hidden min-w-0 lg:block">
          <div className="relative overflow-x-auto rounded-2xl border border-border/80 shadow-inner">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="border-border/80 hover:bg-transparent">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t._id} className="border-border/60">
                    <TableCell>
                      <Link
                        href={`/app/tickets/${t._id}`}
                        className="text-foreground font-medium transition-colors hover:text-primary hover:underline"
                      >
                        {t.title}
                      </Link>
                    </TableCell>
                    <TableCell>{statusBadge(t.status)}</TableCell>
                    <TableCell>{priorityBadge(t.priority)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(t.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}

      {hasNextPage && (
        <Button
          variant="outline"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}
