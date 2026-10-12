"use client";

import { SectionHead } from "@/components/ledger/section-head";
import { useDemoState } from "@/lib/demo-state";
import { cn } from "@/lib/utils";
import type { System } from "@/lib/types";

const square: Record<System, string> = {
  CostX: "bg-src-costx",
  Xero: "bg-src-xero",
  EzzyBills: "bg-src-ezzybills",
  ApprovalMax: "bg-src-approvalmax",
  M365: "bg-src-m365",
};

/** What the joined systems did lately; updates as actions are taken in the demo. */
export function RecentActivity() {
  const { activity } = useDemoState();

  return (
    <section aria-labelledby="dash-activity-title">
      <SectionHead id="dash-activity-title" title="Recent activity" aside="Across all five systems" />
      <ol className="grid md:grid-cols-2 md:[&>li:nth-child(even)]:border-l [&>li]:border-b [&>li]:border-border md:[&>li:nth-last-child(-n+2):nth-child(odd)]:border-b-0 [&>li:last-child]:border-b-0">
        {activity.slice(0, 6).map((a) => (
          <li key={a.id} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 px-4 py-2.5 md:px-5">
            <span aria-hidden="true" className={cn("mt-[6px] h-1.5 w-1.5", square[a.system])} />
            <span className="min-w-0">
              <span className="block text-[13px] leading-snug">{a.message}</span>
              <span className="mt-0.5 block text-[11.5px] text-muted-foreground">
                {a.at} · {a.system === "M365" ? "Microsoft 365" : a.system}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
