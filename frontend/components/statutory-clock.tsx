import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/format";
import type { LiveClock } from "@/lib/derive";

/**
 * A statutory deadline, counted in working days.
 *
 * The due date is always shown alongside the countdown: it is a computed aid,
 * not a determination, and the person acting on it needs to be able to check it
 * against the contract.
 */

/**
 * A missed deadline of ours is a red alarm. A missed deadline of theirs means
 * they failed to pay us — that is an entitlement, so it reads as information,
 * not danger.
 */
function tone(clock: LiveClock) {
  if (clock.satisfied) return "ok";
  if (clock.overdue) return clock.exposure === "Ours" ? "over" : "info";
  if (clock.remaining <= 3 && clock.exposure === "Ours") return "warn";
  return "neutral";
}

export function ClockBadge({ clock, className }: { clock: LiveClock; className?: string }) {
  const t = tone(clock);
  const Icon = clock.satisfied ? CheckCircle2 : clock.overdue ? AlertTriangle : Clock;

  const days = Math.abs(clock.remaining);
  const unit = days === 1 ? "day" : "days";
  const label = clock.satisfied
    ? "Met"
    : clock.overdue
      ? clock.exposure === "Ours"
        ? `${days} working ${unit} overdue`
        : `Unanswered ${days} working ${unit}`
      : `${clock.remaining} working ${unit} left`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        t === "over" && "border-over-border bg-over-soft text-over",
        t === "warn" && "border-warn-border bg-warn-soft text-warn",
        t === "ok" && "border-ok-border bg-ok-soft text-ok",
        t === "info" && "border-primary/30 bg-primary/10 text-primary",
        t === "neutral" && "border-border bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </span>
  );
}

/** The full statement: deadline, what happens if it passes, and where it came from. */
export function ClockDetail({ clock, className }: { clock: LiveClock; className?: string }) {
  const t = tone(clock);

  return (
    <div
      className={cn(
        "rounded-md border p-3",
        t === "over" ? "border-over-border bg-over-soft/50" : "border-border bg-muted/40",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ClockBadge clock={clock} />
        <span className="tabular text-xs text-muted-foreground">
          {clock.workingDays} working days from {formatDateShort(clock.triggeredOn)} · due{" "}
          {formatDateShort(clock.dueOn)}
        </span>
      </div>

      <p
        className={cn(
          "mt-2 text-sm",
          clock.overdue && clock.exposure === "Ours" && "font-medium text-over",
          clock.overdue && clock.exposure === "Theirs" && "font-medium text-primary",
          !clock.overdue && "text-muted-foreground"
        )}
      >
        {clock.overdue ? clock.consequence : `If missed: ${clock.consequence.toLowerCase()}`}
      </p>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Calculated on New Zealand working days — weekends, public holidays, the regional anniversary
        day and 24 Dec to 5 Jan are excluded. Confirm against the contract before relying on it.
        {clock.uncertain ? " Calendar data does not cover this period." : ""}
      </p>
    </div>
  );
}
