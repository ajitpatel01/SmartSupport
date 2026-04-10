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
import { fetchNotifications, fetchOrg } from "@/lib/api-resources";
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

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(false),
    select: (d) => d.unreadCount,
    refetchInterval: 30_000,
  });

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5 p-2">
      {links.map((item) => {
        if (!hasMinRole(item.minRole)) return null;
        const Icon = item.icon;
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const showUnread = item.href === "/app/notifications" && unreadCount > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              active
                ? "bg-sidebar-accent text-sidebar-foreground border-l-2 border-l-primary pl-[10px] shadow-sm"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 border-l-2 border-l-transparent pl-[10px]",
            )}
          >
            <span className="relative inline-flex shrink-0">
              <Icon className="h-4 w-4" aria-hidden />
              {showUnread && (
                <span className="bg-destructive text-destructive-foreground absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="bg-background flex min-h-[100dvh]">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-56 shrink-0 flex-col border-r border-sidebar-border md:flex lg:w-60">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-16">
          <Link href="/app" className="text-sidebar-foreground font-semibold tracking-tight transition-opacity hover:opacity-90">
            SmartSupport
          </Link>
        </div>
        <div className="border-b border-sidebar-border px-4 py-3.5 text-xs">
          <p className="text-sidebar-foreground truncate font-medium">{org?.name ?? "…"}</p>
          <p className="text-muted-foreground truncate capitalize">{user?.role}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <NavLinks />
        </div>
        <div className="mt-auto border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            className="text-sidebar-foreground hover:bg-sidebar-accent/80 h-10 w-full justify-start rounded-xl"
            onClick={() => void logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/90 supports-backdrop-filter:backdrop-blur-md flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:hidden lg:px-5">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "min-h-11 min-w-11 shrink-0")}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw,18rem)] border-sidebar-border bg-sidebar p-0">
              <div className="border-sidebar-border border-b px-4 py-4">
                <p className="text-sidebar-foreground font-semibold">SmartSupport</p>
                <p className="text-muted-foreground truncate text-xs">{org?.name}</p>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
              <div className="border-sidebar-border mt-auto border-t p-2">
                <Button
                  variant="ghost"
                  className="text-sidebar-foreground h-11 w-full justify-start rounded-xl"
                  onClick={() => void logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-foreground min-w-0 truncate text-sm font-semibold tracking-tight">
            Console
          </span>
          <span className="w-11 shrink-0" aria-hidden />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
