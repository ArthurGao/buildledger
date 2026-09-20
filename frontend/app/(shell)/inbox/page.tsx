"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { ClassBadge, ConfidenceBar } from "@/components/inbox/class-badge";
import { EmailDialog } from "@/components/inbox/email-dialog";
import { useDemoState } from "@/lib/demo-state";
import { formatConfidence, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EmailItem } from "@/lib/types";

export default function InboxPage() {
  const { emails, touched } = useDemoState();
  const [selected, setSelected] = React.useState<EmailItem | null>(null);
  const [open, setOpen] = React.useState(false);

  const live = selected ? (emails.find((e) => e.id === selected.id) ?? null) : null;
  const actionable = emails.filter((e) => e.classifiedAs !== "Noise");
  const avgConfidence = emails.reduce((s, e) => s + e.confidence, 0) / emails.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Incoming mail is auto-classified and routed — invoices to AP, RFQs to estimating, client queries to the PM. Open any message to see why."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Messages today" value={String(emails.length)} sources={["M365"]} sub="read from Outlook" />
        <KpiCard label="Routed automatically" value={String(actionable.length)} sources={["M365"]} sub="no manual sorting" />
        <KpiCard
          label="Average confidence"
          value={formatConfidence(avgConfidence)}
          sources={["M365"]}
          sub="across all classifications"
        />
        <KpiCard
          label="Invoices to AP"
          value={String(emails.filter((e) => e.classifiedAs === "Invoice").length)}
          sources={["EzzyBills"]}
          sub="handed to capture"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {emails.map((email) => (
              <li key={email.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(email);
                    setOpen(true);
                  }}
                  className={cn(
                    "flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 text-left transition-colors hover:bg-accent/50",
                    email.classifiedAs === "Noise" && "opacity-60",
                    touched.includes(email.id) && "bg-primary/5"
                  )}
                >
                  <div className="min-w-[220px] flex-1">
                    <p className="truncate text-sm font-medium">{email.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">{email.from}</p>
                  </div>

                  <ClassBadge value={email.classifiedAs} className="shrink-0" />

                  <div className="flex w-36 shrink-0 items-center gap-1.5 text-sm">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{email.routedTo}</span>
                  </div>

                  <div className="flex w-28 shrink-0 items-center gap-2">
                    <ConfidenceBar value={email.confidence} className="flex-1" />
                    <span className="tabular text-xs text-muted-foreground">
                      {formatConfidence(email.confidence)}
                    </span>
                  </div>

                  <span className="tabular w-20 shrink-0 text-right text-xs text-muted-foreground">
                    {formatDateShort(email.receivedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <EmailDialog email={live} open={open} onOpenChange={setOpen} />
    </div>
  );
}
