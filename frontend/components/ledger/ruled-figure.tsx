import { SourceBadge } from "@/components/source-badge";
import { cn } from "@/lib/utils";
import type { System } from "@/lib/types";

/**
 * A ruled figure: label with its source tags, the figure, a note beneath. Placed
 * in a column or a row of them divided by hairlines — never as a card. The
 * figure turns red only for an overrun or a margin loss.
 */
export function RuledFigure({
  label,
  value,
  source,
  tone,
  note,
}: {
  label: string;
  value: string;
  source?: System | System[];
  tone?: "over";
  note: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3.5">
      {/* Tags drop under the label rather than squeeze it when the cell is narrow. */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
        {source ? (
          <span className="flex gap-1">
            {(Array.isArray(source) ? source : [source]).map((s) => (
              <SourceBadge key={s} system={s} short />
            ))}
          </span>
        ) : null}
      </div>
      <p className={cn("tabular mt-1 text-[22px] font-semibold leading-tight tracking-[-0.01em]", tone === "over" && "text-over")}>
        {value}
      </p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">{note}</p>
    </div>
  );
}
