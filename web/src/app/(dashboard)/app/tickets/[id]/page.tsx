"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api";
import {
  deleteTicket,
  fetchModerators,
  fetchTicket,
  updateTicket,
} from "@/lib/api-resources";
import { useAuth } from "@/contexts/auth-context";
import type { Ticket, TicketStatus, TicketUserRef } from "@/lib/types";

function statusBadgeVariant(s: TicketStatus): "success" | "default" | "outline" | "muted" {
  if (s === "open") return "success";
  if (s === "in_progress") return "default";
  if (s === "resolved") return "outline";
  return "muted";
}

function nameOf(u: Ticket["createdBy"]): string {
  if (typeof u === "object" && u && "name" in u) return u.name;
  return "—";
}

const updateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  assignedTo: z.string().optional(),
});

type UpdateForm = z.infer<typeof updateSchema>;

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const qc = useQueryClient();
  const { hasMinRole } = useAuth();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id),
  });

  const { data: moderators } = useQuery({
    queryKey: ["moderators"],
    queryFn: fetchModerators,
    enabled: hasMinRole("moderator"),
  });

  const form = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: "open",
      priority: "medium",
      assignedTo: undefined,
    },
    values: ticket
      ? {
          status: ticket.status,
          priority: ticket.priority,
          assignedTo:
            typeof ticket.assignedTo === "object" && ticket.assignedTo
              ? ticket.assignedTo._id
              : (ticket.assignedTo as string) || undefined,
        }
      : undefined,
  });

  const updateMut = useMutation({
    mutationFn: (body: Partial<UpdateForm>) => updateTicket(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ticket", id] });
      void qc.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket updated");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Update failed"),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteMut = useMutation({
    mutationFn: () => deleteTicket(id),
    onSuccess: () => {
      setDeleteOpen(false);
      void qc.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket deleted");
      router.push("/app/tickets");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Delete failed"),
  });

  if (isLoading || !ticket) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-9 w-2/3 max-w-md rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 sm:space-y-10">
      <div>
        <Link href="/app/tickets" className="text-muted-foreground text-sm hover:underline">
          ← Tickets
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{ticket.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Created {new Date(ticket.createdAt).toLocaleString()} ·{" "}
              {nameOf(ticket.createdBy)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusBadgeVariant(ticket.status)} className="capitalize">
              {ticket.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {ticket.priority}
            </Badge>
            {ticket.category && (
              <Badge variant="secondary">{ticket.category}</Badge>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
        </CardContent>
      </Card>

      {(ticket.aiNotes || (ticket.skills && ticket.skills.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>AI triage</CardTitle>
            <CardDescription>Populated by the triage pipeline after create.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {ticket.skills && ticket.skills.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {ticket.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {ticket.aiNotes && (
              <div>
                <p className="text-muted-foreground mb-1">Notes</p>
                <p className="whitespace-pre-wrap">{ticket.aiNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasMinRole("moderator") && (
        <Card>
          <CardHeader>
            <CardTitle>Moderate</CardTitle>
            <CardDescription>Update routing and status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={form.handleSubmit((v) => updateMut.mutate(v))}
            >
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch("status") ?? ticket.status}
                  onValueChange={(v) =>
                    form.setValue("status", v as UpdateForm["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.watch("priority") ?? ticket.priority}
                  onValueChange={(v) =>
                    form.setValue("priority", v as UpdateForm["priority"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Assign to</Label>
                <Select
                  value={
                    form.watch("assignedTo") ||
                    (typeof ticket.assignedTo === "object" && ticket.assignedTo
                      ? ticket.assignedTo._id
                      : (ticket.assignedTo as string | undefined)) ||
                    "none"
                  }
                  onValueChange={(v) =>
                    form.setValue(
                      "assignedTo",
                      !v || v === "none" ? undefined : v,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {moderators?.map((m) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.name} ({m.openTickets} open)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={updateMut.isPending} className="sm:col-span-2">
                {updateMut.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {hasMinRole("admin") && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>Soft-delete — preserves audit trail server-side.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ticket
            </Button>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will soft-delete the ticket for your organization.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMut.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">Audit trail</h2>
        <div className="space-y-3">
          {ticket.auditLog?.length ? (
            ticket.auditLog.map((entry) => (
              <div key={entry._id}>
                <Separator className="mb-3" />
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium capitalize">
                    {entry.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">
                  {nameOf(entry.actor as TicketUserRef)}
                </p>
                {entry.meta && (
                  <pre className="bg-muted/50 mt-2 max-h-32 overflow-auto rounded p-2 text-xs">
                    {JSON.stringify(entry.meta, null, 2)}
                  </pre>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No audit entries.</p>
          )}
        </div>
      </div>
    </div>
  );
}
