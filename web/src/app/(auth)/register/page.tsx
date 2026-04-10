"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const base = z.object({
  name: z.string().min(2, "At least 2 characters"),
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

const createOrgSchema = base.extend({
  orgName: z.string().min(2, "Organization name required"),
});

const joinOrgSchema = base.extend({
  orgId: z.string().min(1, "Organization ID required"),
});

export default function RegisterPage() {
  const { register: registerUser, user, ready } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"create" | "join">("create");

  const formCreate = useForm<z.infer<typeof createOrgSchema>>({
    resolver: zodResolver(createOrgSchema),
  });

  const formJoin = useForm<z.infer<typeof joinOrgSchema>>({
    resolver: zodResolver(joinOrgSchema),
  });

  useEffect(() => {
    if (ready && user) router.replace("/app");
  }, [ready, user, router]);

  async function onCreate(data: z.infer<typeof createOrgSchema>) {
    setPending(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        orgName: data.orgName,
      });
      toast.success("Organization created");
      router.push("/app");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  async function onJoin(data: z.infer<typeof joinOrgSchema>) {
    setPending(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        orgId: data.orgId,
      });
      toast.success("Joined organization");
      router.push("/app");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="auth-glass-card w-full max-w-md rounded-2xl border border-white/10 shadow-[var(--glow-primary)]">
      <CardHeader>
        <CardTitle className="text-xl tracking-tight">Create account</CardTitle>
        <CardDescription>Start a new org or join with an invite ID.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(v) => setMode(v as "create" | "join")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">New organization</TabsTrigger>
            <TabsTrigger value="join">Join organization</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-4">
            <form
              onSubmit={formCreate.handleSubmit(onCreate)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="c-name">Your name</Label>
                <Input id="c-name" {...formCreate.register("name")} />
                {formCreate.formState.errors.name && (
                  <p className="text-destructive text-sm">
                    {formCreate.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-org">Organization name</Label>
                <Input id="c-org" {...formCreate.register("orgName")} />
                {formCreate.formState.errors.orgName && (
                  <p className="text-destructive text-sm">
                    {formCreate.formState.errors.orgName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" {...formCreate.register("email")} />
                {formCreate.formState.errors.email && (
                  <p className="text-destructive text-sm">
                    {formCreate.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-pass">Password</Label>
                <Input id="c-pass" type="password" {...formCreate.register("password")} />
                {formCreate.formState.errors.password && (
                  <p className="text-destructive text-sm">
                    {formCreate.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creating…" : "Create organization"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="join" className="mt-4">
            <form onSubmit={formJoin.handleSubmit(onJoin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="j-name">Your name</Label>
                <Input id="j-name" {...formJoin.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-org">Organization ID</Label>
                <Input
                  id="j-org"
                  placeholder="24-character ID from your admin"
                  className="font-mono text-sm"
                  {...formJoin.register("orgId")}
                />
                <p className="text-muted-foreground text-xs">
                  Ask an org admin for this value (Settings → Organization). It is the same
                  MongoDB <code className="bg-muted rounded px-1 py-0.5 text-[11px]">ObjectId</code>{" "}
                  string used by the API.
                </p>
                {formJoin.formState.errors.orgId && (
                  <p className="text-destructive text-sm">
                    {formJoin.formState.errors.orgId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-email">Email</Label>
                <Input id="j-email" type="email" {...formJoin.register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="j-pass">Password</Label>
                <Input id="j-pass" type="password" {...formJoin.register("password")} />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Joining…" : "Join organization"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
