"use client";

import { Check, Clock, X } from "lucide-react";
import { useApprovalChain } from "@/lib/demo-state";
import { cn } from "@/lib/utils";
import { formatDateTimeShort } from "@/lib/format";

/** Step-by-step approval trail, straight out of ApprovalMax. */
export function ApprovalChain({ invoiceId, compact = false }: { invoiceId: string; compact?: boolean }) {
  const steps = useApprovalChain(invoiceId);

  if (steps.length === 0) {
    return <p className="text-xs text-muted-foreground">Not yet in an approval workflow.</p>;
  }

  return (
    <ol className={cn("flex", compact ? "items-center gap-2" : "flex-col gap-3")}>
      {steps.map((s, i) => {
        const Icon = s.status === "Approved" ? Check : s.status === "Rejected" ? X : Clock;
        const tone =
          s.status === "Approved"
            ? "bg-ok-soft text-ok"
            : s.status === "Rejected"
              ? "bg-over-soft text-over"
              : "bg-warn-soft text-warn";

        if (compact) {
          return (
            <li key={`${s.invoiceId}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <span className="h-px w-3 bg-border" /> : null}
              <span
                className={cn("flex h-6 w-6 items-center justify-center rounded-full", tone)}
                title={`${s.approver} — ${s.status}`}
              >
                <Icon className="h-3 w-3" />
              </span>
            </li>
          );
        }

        return (
          <li key={`${s.invoiceId}-${i}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", tone)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {i < steps.length - 1 ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium leading-tight">{s.approver}</p>
              <p className="text-xs text-muted-foreground">{s.role}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {s.status === "Waiting"
                  ? "Waiting"
                  : `${s.status} · ${s.timestamp ? formatDateTimeShort(s.timestamp) : ""}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
