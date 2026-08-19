"use client";

import {
  Activity,
  Bell,
  BookOpen,
  Building2,
  CheckSquare,
  Contact,
  Goal,
  Home,
  Import,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/database";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Work", href: "/my-work", icon: CheckSquare },
  { label: "Goals", href: "/goals", icon: Goal },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Contacts", href: "/contacts", icon: Contact },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  {
    label: "Reviews",
    href: "/reviews",
    icon: ShieldCheck,
    roles: ["admin", "sales_manager"] as AppRole[],
  },
  { label: "Opportunities", href: "/opportunities", icon: Target },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Playbooks", href: "/playbooks", icon: BookOpen },
  {
    label: "Team",
    href: "/team",
    icon: Users,
    roles: ["admin", "sales_manager"] as AppRole[],
  },
  { label: "Imports", href: "/imports", icon: Import },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"] as AppRole[],
  },
];

function Navigation({
  role,
  onNavigate,
}: {
  role: AppRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="space-y-0.5">
      {items
        .filter((item) => !item.roles || item.roles.includes(role))
        .map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        ))}
    </nav>
  );
}

export function AppShell({
  children,
  role,
  fullName,
  email,
}: {
  children: ReactNode;
  role: AppRole;
  fullName: string;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-xs font-bold text-white">
            GO
          </span>
          <span className="text-sm font-semibold text-slate-950">
            Outreach OS
          </span>
        </div>
        <div className="p-3">
          <Navigation role={role} />
        </div>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-72 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="font-semibold">Outreach OS</span>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-3">
              <Navigation role={role} onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            />
            <input
              aria-label="Global search"
              placeholder="Search companies, contacts, goals…"
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm"
              disabled
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm">
              <Plus className="size-3.5" />
              Quick add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Notifications"
              disabled
            >
              <Bell className="size-4" />
            </Button>
            <div className="hidden border-l border-slate-200 pl-3 sm:block">
              <p className="max-w-40 truncate text-xs font-medium text-slate-800">
                {fullName}
              </p>
              <p className="max-w-40 truncate text-[11px] text-slate-500">
                {email ?? role.replace("_", " ")}
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
