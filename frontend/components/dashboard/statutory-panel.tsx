import Link from "next/link";
import { SectionHead } from "@/components/ledger/section-head";
import { ClockBadge } from "@/components/statutory-clock";
import { getOpenClocks, getProjectName, getRetentionPosition } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The statutory position, on the opening screen.
 *
 * Budget overruns cost margin; these cost the right to be paid. They belong
 * where someone sees them first, not three clicks in.
 */
export function StatutoryPanel() {
  const clocks = getOpenClocks().slice(0, 3);
  const retention = getRetentionPosition();

  return (
    <section aria-labelledby="dash-deadlines-title" className="min-w-0">
      <SectionHead
        id="dash-deadlines-title"
        title="Statutory deadlines"
        aside={
          <Link href="/variations" className="hover:text-foreground hover:underline">
            View all
          </Link>
        }
      />
      <ul className="divide-y divide-border">
        {clocks.map((c) => (
          <li key={c.id}>
            <Link
              href={c.kind === "Variation notice due" ? "/variations" : c.kind === "Payment due" ? "/claims" : "/approvals"}
              className="block px-4 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] md:px-5"
            >
              <span className="block text-[13px] font-medium leading-snug">{c.sourceLabel}</span>
              <span className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-[12.5px] text-muted-foreground">
                  {c.kind} · {getProjectName(c.projectId)}
                </span>
                <ClockBadge clock={c} />
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/retentions"
            className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 px-4 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] md:px-5"
          >
            <span aria-hidden="true" className={cn("mt-[5px] h-2 w-2", retention.compliant ? "bg-ok" : "bg-over")} />
            <span className="min-w-0">
              <span className="block text-[13px] font-medium">Retention held on trust</span>
              <span className={cn("mt-0.5 block text-[12.5px] leading-snug", retention.compliant ? "text-muted-foreground" : "text-over")}>
                {retention.compliant
                  ? `${formatCurrency(retention.liability)} fully backed by the trust account`
                  : `${formatCurrency(retention.shortfall)} short of the ledger — an offence under the 2023 amendment`}
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
