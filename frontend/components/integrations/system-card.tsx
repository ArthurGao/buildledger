import { SourceBadge, systemLabels } from "@/components/source-badge";
import { cn } from "@/lib/utils";
import type { IntegrationSource, System } from "@/lib/types";

/**
 * Columns shared by the header row and every system row. From lg they are the
 * sheet's 12 zero-gutter columns: system 1-3 · reads 4-6 · in this demo 7-9 ·
 * needed from you 10-12.
 */
export const systemColumns = "grid gap-y-2 px-4 md:px-5 lg:grid-cols-12 lg:gap-y-0 lg:px-0";
export const systemCells = {
  system: "lg:col-span-3 lg:pl-5 lg:pr-3",
  reads: "lg:col-span-3 lg:pr-3",
  demo: "lg:col-span-3 lg:pr-3",
  needed: "lg:col-span-3 lg:pr-5",
};

/** Below lg the header row is hidden, so each cell carries its own caption. */
function Caption({ children }: { children: React.ReactNode }) {
  return <span className="mb-0.5 block text-[11.5px] font-medium text-muted-foreground lg:hidden">{children}</span>;
}

/** What the demo holds in place of a connection: a sample file (ink square) or nothing yet (open square). */
export function DemoSource({ source }: { source: IntegrationSource }) {
  const sample = source.kind === "Sample export";
  return (
    <span className="flex items-start gap-2">
      <span
        aria-hidden="true"
        className={cn("mt-[5px] h-1.5 w-1.5 shrink-0", sample ? "bg-foreground" : "border border-foreground/50")}
      />
      <span className="min-w-0">
        <span className={cn("block text-[13px]", sample ? "font-medium" : "text-muted-foreground")}>{source.kind}</span>
        {sample ? (
          <span className="block truncate font-mono text-[11px] text-muted-foreground">{source.file}</span>
        ) : (
          <span className="block text-[12px] text-muted-foreground">No sample yet</span>
        )}
      </span>
    </span>
  );
}

/** One row of the integrations ledger. */
export function SystemRow({
  system,
  label,
  note,
  reads,
  source,
  needed,
}: {
  system?: System;
  /** Overrides the system's name, for rows that span systems (the cost-code mapping). */
  label?: string;
  note?: string;
  reads: string;
  source: IntegrationSource;
  needed: string;
}) {
  return (
    <li className={cn(systemColumns, "py-3")}>
      <div className={cn(systemCells.system, "min-w-0")}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium">
          {label ?? (system ? systemLabels[system] : null)}
          {system ? <SourceBadge system={system} short /> : null}
        </p>
        {note ? <p className="text-[12px] text-muted-foreground">{note}</p> : null}
      </div>
      <p className={cn(systemCells.reads, "text-[12.5px] leading-snug text-muted-foreground")}>
        <Caption>Reads</Caption>
        {reads}
      </p>
      <div className={systemCells.demo}>
        <Caption>In this demo</Caption>
        <DemoSource source={source} />
      </div>
      <p className={cn(systemCells.needed, "text-[12.5px] leading-snug")}>
        <Caption>Needed from you</Caption>
        {needed}
      </p>
    </li>
  );
}
