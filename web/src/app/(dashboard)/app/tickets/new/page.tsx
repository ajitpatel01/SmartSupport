"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { createTicket } from "@/lib/api-resources";

const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
});

type Form = z.infer<typeof schema>;

export default function NewTicketPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const form = useForm<Form>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      void qc.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket created");
      router.push(`/app/tickets/${ticket._id}`);
    },
    onError: (e: unknown) => {
      const msg = e instanceof ApiError ? e.message : "Could not create ticket";
      toast.error(msg);
    },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/app/tickets"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
        >
          ← Back to tickets
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">New ticket</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          AI triage runs after submit—be specific in the description for best routing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Title and description are sent to the API as-is.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={8} {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting…" : "Submit ticket"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
