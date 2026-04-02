import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
