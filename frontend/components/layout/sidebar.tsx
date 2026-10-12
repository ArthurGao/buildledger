"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/layout/brand-mark";
import { isActive, navItems } from "@/components/layout/nav-items";
import { useNavBadges } from "@/components/layout/use-nav-badges";

export function Sidebar() {
  const pathname = usePathname();
  // Counts track the demo state, so approving something updates the badge.
  const badges = useNavBadges();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-chrome lg:flex">
      <Link href="/" className="flex h-12 items-center gap-2.5 border-b border-border px-4">
        <BrandMark />
        <span className="text-[15px] font-semibold tracking-[-0.01em]">BuildLedger</span>
      </Link>

      <nav className="flex-1 space-y-px overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const badge = item.badge ? badges[item.badge] : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-sm px-2.5 py-[7px] text-[13px] font-medium transition-colors duration-150",
                active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
              )}
            >
              <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {badge?.count ? (
                <span
                  className={cn(
                    "tabular min-w-[1.25rem] text-right text-[11.5px] font-semibold",
                    active
                      ? badge.tone === "muted" ? "text-background/70" : "text-background"
                      : badge.tone === "over" ? "text-over" : badge.tone === "warn" ? "text-warn" : "text-muted-foreground"
                  )}
                >
                  {badge.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2">
        <Link
          href="/integrations"
          className="block rounded-sm px-2.5 py-2 transition-colors hover:bg-foreground/[0.06]"
        >
          {/* Honest about the demo: an open square, not a green "connected" light. */}
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            <span aria-hidden="true" className="inline-flex h-1.5 w-1.5 border border-foreground/60" />
            5 systems · sample data
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Xero · CostX · EzzyBills · +2</p>
        </Link>
      </div>
    </aside>
  );
}
