"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchNotifications, markNotificationRead } from "@/lib/api-resources";
import { ApiError } from "@/lib/api";

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(false),
    refetchInterval: 30_000,
    select: (d) => d.notifications,
  });

  const mut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Could not update"),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Polled every 30s—read state syncs with the API.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            In-app events for your account (assignment, escalation, resolution, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : data?.length === 0 ? (
            <p className="text-muted-foreground text-sm">You&apos;re all caught up.</p>
          ) : (
            data?.map((n) => (
              <div
                key={n._id}
                className={`flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between ${n.read ? "opacity-70" : ""}`}
              >
                <div>
                  <p className="font-medium capitalize">{n.type.replace("_", " ")}</p>
                  <p className="text-muted-foreground text-sm">
                    {n.payload?.title ?? JSON.stringify(n.payload ?? {})}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => mut.mutate(n._id)}
                    disabled={mut.isPending}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
