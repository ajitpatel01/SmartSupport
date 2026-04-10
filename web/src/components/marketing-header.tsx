"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/product", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-border/80 bg-background/75 supports-backdrop-filter:backdrop-blur-xl sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="text-foreground shrink-0 text-lg font-semibold tracking-tight transition-opacity hover:opacity-90"
        >
          AI-SmartSupport
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Marketing">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden min-h-10 px-3 sm:inline-flex",
            )}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }), "hidden min-h-10 px-4 sm:inline-flex")}
          >
            Get started
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "min-h-11 min-w-11 md:hidden",
              )}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw,20rem)] gap-0 p-0">
              <SheetHeader className="border-border border-b px-5 py-4 text-left">
                <SheetTitle className="font-heading text-lg">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-foreground hover:bg-accent/80 rounded-xl px-4 py-3.5 text-base font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-border mt-2 border-t pt-4">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "lg" }),
                      "mb-2 w-full justify-center rounded-xl py-6 text-base",
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ size: "lg" }), "w-full justify-center rounded-xl py-6 text-base")}
                  >
                    Get started
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
