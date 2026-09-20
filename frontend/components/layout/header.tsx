"use client";

import Link from "next/link";
import { Layers, RotateCcw } from "lucide-react";
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
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3 lg:gap-3 lg:px-6">
      <MobileNav />

      <Link href="/" className="flex shrink-0 items-center gap-2 lg:hidden" aria-label="BuildLedger home">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Layers className="h-4 w-4" />
        </span>
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
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          SC
        </span>
      </div>
    </header>
  );
}
