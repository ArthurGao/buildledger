import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/source-badge";
import { cn } from "@/lib/utils";
import type { System } from "@/lib/types";

export function KpiCard({
  label,
  value,
  sources,
  sub,
  trend,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sources: System[];
  sub?: string;
  /** Direction of travel, when the figure has one. */
  trend?: { direction: "up" | "down"; label: string; good: boolean };
  tone?: "neutral" | "over";
}) {
  const TrendIcon = trend?.direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="flex shrink-0 items-center gap-1">
          {sources.map((s) => (
            <SourceBadge key={s} system={s} short />
          ))}
        </div>
      </div>

      <p
        className={cn(
          "tabular mt-3 text-3xl font-semibold tracking-tight",
          tone === "over" && "text-over"
        )}
      >
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2 text-xs">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.good ? "text-ok" : "text-over"
            )}
          >
            <TrendIcon className="h-3.5 w-3.5" />
            {trend.label}
          </span>
        ) : null}
        {sub ? <span className="text-muted-foreground">{sub}</span> : null}
      </div>
    </Card>
  );
}
