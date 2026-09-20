import { cn } from "@/lib/utils";
import type { System } from "@/lib/types";

/**
 * The small tag that sits beside a figure to say which upstream system it
 * came from. This is the core idea of the product made visible, so it looks
 * and behaves identically everywhere it appears.
 */

const systemStyles: Record<System, string> = {
  CostX: "bg-src-costx-soft text-src-costx ring-src-costx/20",
  Xero: "bg-src-xero-soft text-src-xero ring-src-xero/20",
  EzzyBills: "bg-src-ezzybills-soft text-src-ezzybills ring-src-ezzybills/20",
  ApprovalMax: "bg-src-approvalmax-soft text-src-approvalmax ring-src-approvalmax/20",
  M365: "bg-src-m365-soft text-src-m365 ring-src-m365/20",
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
        "inline-flex items-center rounded px-1.5 py-px text-[10px] font-semibold leading-4 tracking-wide ring-1 ring-inset",
        systemStyles[system],
        className
      )}
      title={`Sourced from ${systemLabels[system]}`}
    >
      {short ? system : systemLabels[system]}
    </span>
  );
}

/** A dot in the system's colour — for legends and compact lists. */
export function SourceDot({ system, className }: { system: System; className?: string }) {
  const dot: Record<System, string> = {
    CostX: "bg-src-costx",
    Xero: "bg-src-xero",
    EzzyBills: "bg-src-ezzybills",
    ApprovalMax: "bg-src-approvalmax",
    M365: "bg-src-m365",
  };
  return <span className={cn("inline-block h-2 w-2 rounded-full", dot[system], className)} />;
}

export { systemLabels };
