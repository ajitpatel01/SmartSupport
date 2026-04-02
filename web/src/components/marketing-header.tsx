"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AI-SmartSupport
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Marketing">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Log in
          </Link>
          <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
