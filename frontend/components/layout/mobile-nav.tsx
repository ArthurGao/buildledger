"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isActive, navItems } from "@/components/layout/nav-items";
import { getClockCounts, getExceptionCounts, getRetentionPosition } from "@/lib/derive";
import { useDemoState } from "@/lib/demo-state";
import { cn } from "@/lib/utils";

/** Navigation below the sidebar breakpoint. Without this the demo is a dead end on a phone. */
export function MobileNav() {
  const pathname = usePathname();
  const { invoices } = useDemoState();

  const counts = {
    approvals: invoices.filter((i) => i.status === "Pending approval").length,
    exceptions: getExceptionCounts().total,
    variationClocks: getClockCounts().overdue,
    retentionAlert: getRetentionPosition().compliant ? 0 : 1,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>BuildLedger</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          const count = item.badge ? counts[item.badge] : 0;

          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className={cn(active && "bg-primary/10 text-primary")}>
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
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
