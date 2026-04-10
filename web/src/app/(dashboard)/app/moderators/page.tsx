"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { fetchModerators, updateModeratorSkills } from "@/lib/api-resources";
import type { ModeratorRow } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

export default function ModeratorsPage() {
  const { hasMinRole } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["moderators"],
    queryFn: fetchModerators,
  });

  const [edit, setEdit] = useState<ModeratorRow | null>(null);
  const [skillsRaw, setSkillsRaw] = useState("");

  const mut = useMutation({
    mutationFn: ({ id, skills }: { id: string; skills: string[] }) =>
      updateModeratorSkills(id, skills),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["moderators"] });
      toast.success("Skills updated");
      setEdit(null);
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Update failed"),
  });

  function openEdit(row: ModeratorRow) {
    setEdit(row);
    setSkillsRaw((row.skills ?? []).join(", "));
  }

  function saveSkills() {
    if (!edit) return;
    const skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    mut.mutate({ id: edit._id, skills });
  }

  if (!hasMinRole("moderator")) {
    return (
      <p className="text-muted-foreground">You don&apos;t have access to this page.</p>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Team</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Moderators and open workload—used for skill-based routing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moderators</CardTitle>
          <CardDescription>Open tickets counts drive tie-breaking when skills match.</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/80">
              <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Skills</TableHead>
                  {hasMinRole("admin") && <TableHead className="w-[100px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      No moderators yet—promote users from settings or invite moderators.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.email}</TableCell>
                      <TableCell>{m.openTickets}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {m.skills?.length
                            ? m.skills.map((s) => (
                                <Badge key={s} variant="secondary">
                                  {s}
                                </Badge>
                              ))
                            : "—"}
                        </div>
                      </TableCell>
                      {hasMinRole("admin") && (
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openEdit(m)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit skills — {edit?.name}</DialogTitle>
            <DialogDescription>
              Comma-separated tags (e.g. Node.js, billing, SSO). Routing uses regex-style matching.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              value={skillsRaw}
              onChange={(e) => setSkillsRaw(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => saveSkills()} disabled={mut.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
