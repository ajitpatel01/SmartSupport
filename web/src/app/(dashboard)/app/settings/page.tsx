"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ApiError } from "@/lib/api";
import {
  fetchOrg,
  fetchProfile,
  fetchUsers,
  inviteMember,
  patchOrg,
  patchProfile,
} from "@/lib/api-resources";
import { useAuth } from "@/contexts/auth-context";

const profileSchema = z.object({
  name: z.string().min(2),
});

const orgSchema = z.object({
  name: z.string().min(2),
  webhookUrl: z.string().optional(),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["user", "moderator", "admin"]),
});

export default function SettingsPage() {
  const { hasMinRole } = useAuth();
  const qc = useQueryClient();

  const profileQ = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const orgQ = useQuery({ queryKey: ["org"], queryFn: fetchOrg });
  const usersQ = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: hasMinRole("moderator"),
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: profileQ.data ? { name: profileQ.data.name } : undefined,
  });

  const orgForm = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    values: orgQ.data
      ? {
          name: orgQ.data.name,
          webhookUrl: orgQ.data.webhookUrl ?? "",
        }
      : undefined,
  });

  useEffect(() => {
    if (profileQ.data) profileForm.reset({ name: profileQ.data.name });
  }, [profileQ.data, profileForm]);

  useEffect(() => {
    if (orgQ.data) {
      orgForm.reset({
        name: orgQ.data.name,
        webhookUrl: orgQ.data.webhookUrl ?? "",
      });
    }
  }, [orgQ.data, orgForm]);

  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "user" },
  });

  const profileMut = useMutation({
    mutationFn: patchProfile,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Save failed"),
  });

  const orgMut = useMutation({
    mutationFn: patchOrg,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["org"] });
      toast.success("Organization updated");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Save failed"),
  });

  const inviteMut = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Invitation sent");
      inviteForm.reset({ email: "", role: "user" });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : "Invite failed"),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Profile, organization, and members.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
          <CardDescription>Visible to others in your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-md space-y-4"
            onSubmit={profileForm.handleSubmit((v) => profileMut.mutate(v))}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...profileForm.register("name")} />
            </div>
            <Button type="submit" disabled={profileMut.isPending || !profileQ.data}>
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasMinRole("admin") && (
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>Name and optional webhook URL for integrations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="max-w-md space-y-4"
              onSubmit={orgForm.handleSubmit((v) =>
                orgMut.mutate({
                  name: v.name,
                  webhookUrl: v.webhookUrl || null,
                }),
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input id="orgName" {...orgForm.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  placeholder="https://"
                  {...orgForm.register("webhookUrl")}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Plan: {orgQ.data?.plan ?? "—"} · Org ID: {orgQ.data?._id ?? "—"}
              </p>
              <Button type="submit" disabled={orgMut.isPending || !orgQ.data}>
                Save organization
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {hasMinRole("admin") && (
        <Card>
          <CardHeader>
            <CardTitle>Invite member</CardTitle>
            <CardDescription>
              Sends email with a temporary password—share securely with the recipient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex max-w-md flex-col gap-4 sm:flex-row sm:items-end"
              onSubmit={inviteForm.handleSubmit((v) => inviteMut.mutate(v))}
            >
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email</Label>
                  <Input id="inviteEmail" type="email" {...inviteForm.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={inviteForm.watch("role")}
                    onValueChange={(v) =>
                      inviteForm.setValue("role", v as "user" | "moderator" | "admin")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={inviteMut.isPending}>
                Send invite
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {hasMinRole("moderator") && (
        <Card>
          <CardHeader>
            <CardTitle>Team directory</CardTitle>
            <CardDescription>All users in this organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQ.data?.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
