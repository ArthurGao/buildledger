"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MobileNav } from "@/components/layout/mobile-nav";
import { GlobalSearch } from "@/components/layout/global-search";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PageGuideButton } from "@/components/layout/page-guide";
import { useDemoState } from "@/lib/demo-state";

export function Header() {
  const { reset } = useDemoState();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-3 lg:gap-3 lg:px-6">
      <MobileNav />

      <Link href="/" className="flex shrink-0 items-center gap-2 lg:hidden" aria-label="BuildLedger home">
        <BrandMark />
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">BuildLedger</span>
      </Link>

      <ProjectSwitcher />

      <GlobalSearch className="ml-auto hidden w-full max-w-xs md:block" />

      <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0 lg:gap-2">
        <PageGuideButton />

        <ThemeToggle />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={reset} aria-label="Reset demo">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset the demo to its starting state</TooltipContent>
        </Tooltip>

        <div className="ml-1 hidden text-right sm:block">
          <p className="text-xs font-medium leading-tight">Sarah Chen</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Project Manager</p>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-foreground/25 text-[11px] font-semibold">
          SC
        </span>
      </div>
    </header>
  );
}
