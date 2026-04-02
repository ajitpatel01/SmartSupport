"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const from = pathname ? `?from=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${from}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
