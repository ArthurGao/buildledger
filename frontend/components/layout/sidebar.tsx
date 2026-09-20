"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActive, navItems } from "@/components/layout/nav-items";
import { getExceptionCounts } from "@/lib/derive";
import { useDemoState } from "@/lib/demo-state";

export function Sidebar() {
  const pathname = usePathname();
  const { invoices } = useDemoState();

  // Counts track the demo state, so approving something updates the badge.
  const counts = {
    approvals: invoices.filter((i) => i.status === "Pending approval").length,
    exceptions: getExceptionCounts().total,
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <Link href="/" className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="h-4.5 w-4.5" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">BuildLedger</span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const count = item.badge ? counts[item.badge] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {count ? (
                <span
                  className={cn(
                    "tabular rounded px-1.5 py-px text-[11px] font-semibold",
                    item.tone === "over" ? "bg-over-soft text-over" : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/integrations"
          className="block rounded-md bg-muted/60 px-3 py-2.5 transition-colors hover:bg-muted"
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
            </span>
            5 systems connected
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Xero · CostX · EzzyBills · +2</p>
        </Link>
      </div>
    </aside>
  );
}
