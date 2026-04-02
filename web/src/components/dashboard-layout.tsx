"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { fetchOrg } from "@/lib/api-resources";
import type { UserRole } from "@/lib/types";

const links: { href: string; label: string; icon: typeof Ticket; minRole: UserRole }[] = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, minRole: "user" },
  { href: "/app/tickets", label: "Tickets", icon: Ticket, minRole: "user" },
  { href: "/app/moderators", label: "Team", icon: Users, minRole: "moderator" },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3, minRole: "admin" },
  { href: "/app/notifications", label: "Notifications", icon: Bell, minRole: "user" },
  { href: "/app/settings", label: "Settings", icon: Settings, minRole: "user" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, hasMinRole } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: org } = useQuery({
    queryKey: ["org"],
    queryFn: fetchOrg,
  });

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 p-2">
      {links.map((item) => {
        if (!hasMinRole(item.minRole)) return null;
        const Icon = item.icon;
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="bg-background flex min-h-screen">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-56 shrink-0 border-r md:flex md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/app" className="font-semibold tracking-tight">
            SmartSupport
          </Link>
        </div>
        <div className="text-sidebar-foreground/70 border-b px-4 py-3 text-xs">
          <p className="truncate font-medium text-sidebar-foreground">{org?.name ?? "…"}</p>
          <p className="truncate capitalize">{user?.role}</p>
        </div>
        <NavLinks />
        <div className="mt-auto border-t p-2">
          <Button
            variant="ghost"
            className="text-sidebar-foreground w-full justify-start"
            onClick={() => void logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background flex h-14 items-center justify-between border-b px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={buttonVariants({ variant: "outline", size: "icon" })}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="border-b p-4">
                <p className="font-semibold">SmartSupport</p>
                <p className="text-muted-foreground text-xs">{org?.name}</p>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
              <div className="border-t p-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => void logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium">Console</span>
          <span className="w-10" />
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
