import { Card, CardContent } from "@/components/ui/card";
import { SourceBadge, systemLabels } from "@/components/source-badge";
import { cn } from "@/lib/utils";
import type { IntegrationStatus, System } from "@/lib/types";

/** Neutral placeholder marks — no real brand logos anywhere in this demo. */
const initials: Record<System, string> = {
  Xero: "XO",
  CostX: "CX",
  EzzyBills: "EB",
  ApprovalMax: "AM",
  M365: "MS",
};

const mark: Record<System, string> = {
  Xero: "bg-src-xero-soft text-src-xero",
  CostX: "bg-src-costx-soft text-src-costx",
  EzzyBills: "bg-src-ezzybills-soft text-src-ezzybills",
  ApprovalMax: "bg-src-approvalmax-soft text-src-approvalmax",
  M365: "bg-src-m365-soft text-src-m365",
};

export function SystemCard({ integration }: { integration: IntegrationStatus }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                mark[integration.system]
              )}
              aria-hidden
            >
              {initials[integration.system]}
            </span>
            <div>
              <p className="font-medium leading-tight">{systemLabels[integration.system]}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {integration.note ?? "Cloud API"}
              </p>
            </div>
          </div>
          <SourceBadge system={integration.system} short />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ok">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            Connected
          </span>
          <span className="text-xs text-muted-foreground">Last sync {integration.lastSync}</span>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reads</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{integration.reads}</p>
        </div>
      </CardContent>
    </Card>
  );
}
