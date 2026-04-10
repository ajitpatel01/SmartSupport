"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { isDemoMode } from "@/lib/demo/config";
import { enterDemoSession } from "@/lib/demo/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Required"),
});

type Form = z.infer<typeof schema>;

export function LoginForm() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const from = searchParams.get("from") || "/app";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (ready && user) router.replace(from.startsWith("/") ? from : "/app");
  }, [ready, user, router, from]);

  async function onSubmit(data: Form) {
    setPending(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back");
      router.push(from.startsWith("/") ? from : "/app");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Login failed";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="auth-glass-card w-full max-w-md rounded-2xl border border-white/10 shadow-[var(--glow-primary)]">
      <CardHeader>
        <CardTitle className="text-xl tracking-tight">Log in</CardTitle>
        <CardDescription>Access your organization workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        {isDemoMode() && (
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => {
              enterDemoSession();
              router.push(from.startsWith("/") ? from : "/app");
            }}
          >
            View demo (no login)
          </Button>
        )}
        <p className="text-muted-foreground mt-6 text-center text-sm">
          No account?{" "}
          <Link href="/register" className="text-primary font-medium underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
