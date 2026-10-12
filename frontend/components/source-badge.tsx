import { cn } from "@/lib/utils";
import type { System } from "@/lib/types";

/**
 * The small tag that sits beside a figure to say which upstream system it
 * came from. This is the core idea of the product made visible, so it looks
 * and behaves identically everywhere it appears. It is an outlined tag in the
 * system's own hue — quiet enough that a red overrun still reads first.
 */

const systemStyles: Record<System, string> = {
  CostX: "text-src-costx border-src-costx/45",
  Xero: "text-src-xero border-src-xero/45",
  EzzyBills: "text-src-ezzybills border-src-ezzybills/45",
  ApprovalMax: "text-src-approvalmax border-src-approvalmax/45",
  M365: "text-src-m365 border-src-m365/45",
};

const systemLabels: Record<System, string> = {
  CostX: "CostX",
  Xero: "Xero",
  EzzyBills: "EzzyBills",
  ApprovalMax: "ApprovalMax",
  M365: "Microsoft 365",
};

export function SourceBadge({
  system,
  className,
  short = false,
}: {
  system: System;
  className?: string;
  /** Use the bare system name — for tight spots like table headers. */
  short?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-sm border px-1 text-[10px] font-semibold leading-[15px] tracking-[0.01em]",
        systemStyles[system],
        className
      )}
      title={`Sourced from ${systemLabels[system]}`}
    >
      {short ? system : systemLabels[system]}
    </span>
  );
}

/** A square in the system's colour — for legends and compact lists. */
export function SourceDot({ system, className }: { system: System; className?: string }) {
  const dot: Record<System, string> = {
    CostX: "bg-src-costx",
    Xero: "bg-src-xero",
    EzzyBills: "bg-src-ezzybills",
    ApprovalMax: "bg-src-approvalmax",
    M365: "bg-src-m365",
  };
  return <span className={cn("inline-block h-2 w-2", dot[system], className)} />;
}

export { systemLabels };
