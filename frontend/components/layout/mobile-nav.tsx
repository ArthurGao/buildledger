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
import { useNavBadges } from "@/components/layout/use-nav-badges";
import { cn } from "@/lib/utils";

/** Navigation below the sidebar breakpoint. Without this the demo is a dead end on a phone. */
export function MobileNav() {
  const pathname = usePathname();
  const badges = useNavBadges();

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
          const badge = item.badge ? badges[item.badge] : undefined;

          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className={cn(active && "bg-foreground text-background focus:bg-foreground focus:text-background")}>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge?.count ? (
                  <span
                    className={cn(
                      "tabular text-[11.5px] font-semibold",
                      active
                        ? "text-background"
                        : badge.tone === "over" ? "text-over" : badge.tone === "warn" ? "text-warn" : "text-muted-foreground"
                    )}
                  >
                    {badge.count}
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
