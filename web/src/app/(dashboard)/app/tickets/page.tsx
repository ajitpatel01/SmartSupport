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
        ? "default"
        : s === "in_progress"
          ? "secondary"
          : s === "resolved"
            ? "outline"
            : "secondary";
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground text-sm">Cursor-paginated, org-scoped.</p>
        </div>
        <Link
          href="/app/tickets/new"
          className={cn(buttonVariants(), "inline-flex items-center")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New ticket
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={status}
          onValueChange={(v) => {
            if (v) setStatus(v);
          }}
        >
          <SelectTrigger className="w-[160px]">
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
          <SelectTrigger className="w-[160px]">
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

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                    No tickets yet.{" "}
                    <Link href="/app/tickets/new" className="text-primary underline">
                      Create one
                    </Link>
                    .
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>
                      <Link
                        href={`/app/tickets/${t._id}`}
                        className="font-medium hover:underline"
                      >
                        {t.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{statusBadge(t.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">{priorityBadge(t.priority)}</TableCell>
                    <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                      {new Date(t.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

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
