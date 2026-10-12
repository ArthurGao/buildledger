import Link from "next/link";
import { SectionHead } from "@/components/ledger/section-head";
import { getExceptionsBySeverity } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The top exceptions across the portfolio, in the same ruled form as a project's own list. */
export function RecentExceptions({ limit = 4 }: { limit?: number }) {
  const all = getExceptionsBySeverity();
  const items = all.slice(0, limit);

  return (
    <section aria-labelledby="dash-exceptions-title" className="min-w-0">
      <SectionHead
        id="dash-exceptions-title"
        title="Exceptions"
        aside={
          <Link href="/exceptions" className="hover:text-foreground hover:underline">
            All {all.length} exceptions
          </Link>
        }
      />
      <ul className="divide-y divide-border">
        {items.map((e) => (
          <li key={e.id}>
            <Link
              href="/exceptions"
              className="grid grid-cols-[1rem_minmax(0,1fr)_auto] gap-x-3 px-4 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] md:px-5"
            >
              <span aria-hidden="true" className={cn("mt-[5px] h-2 w-2", e.severity === "High" ? "bg-over" : "bg-warn")} />
              <span className="min-w-0">
                <span className="flex flex-wrap items-baseline gap-x-2 text-[13px] font-medium">
                  {e.type}
                  <span className="font-mono text-[11px] font-normal text-muted-foreground">{e.projectId}</span>
                  {e.severity === "High" ? <span className="sr-only">(high severity)</span> : null}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{e.description}</span>
              </span>
              <span className="tabular text-right text-[13px] font-medium">{e.amount ? formatCurrency(e.amount) : ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
