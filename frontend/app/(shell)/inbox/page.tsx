"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
import { ClassBadge, ConfidenceBar } from "@/components/inbox/class-badge";
import { EmailDialog } from "@/components/inbox/email-dialog";
import { useDemoState } from "@/lib/demo-state";
import { formatConfidence, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EmailItem } from "@/lib/types";

/**
 * Columns shared by the header row and every message. From lg they are the
 * sheet's 12 lines: message 1-5 · class 6-7 · routed to 8-9 · confidence 10-11 ·
 * received 12.
 */
const columns = "grid gap-x-3 px-4 md:px-5 lg:grid-cols-12 lg:gap-x-0 lg:px-0";
const cells = {
  message: "lg:col-span-5 lg:pl-5 lg:pr-3",
  cls: "hidden lg:col-span-2 lg:block lg:pr-3",
  routed: "hidden lg:col-span-2 lg:flex lg:pr-3",
  confidence: "hidden lg:col-span-2 lg:flex lg:pr-3",
  received: "hidden lg:col-span-1 lg:block lg:pr-5 lg:text-right",
};

export default function InboxPage() {
  const { emails, touched } = useDemoState();
  const [selected, setSelected] = React.useState<EmailItem | null>(null);
  const [open, setOpen] = React.useState(false);

  const live = selected ? (emails.find((e) => e.id === selected.id) ?? null) : null;
  const actionable = emails.filter((e) => e.classifiedAs !== "Noise");
  const avgConfidence = emails.reduce((s, e) => s + e.confidence, 0) / emails.length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Inbox"
        description="Incoming mail is auto-classified and routed — invoices to AP, RFQs to estimating, client queries to the PM. Open any message to see why."
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Inbox figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure label="Messages today" value={String(emails.length)} source="M365" note="read from Outlook" />
          <RuledFigure label="Routed automatically" value={String(actionable.length)} source="M365" note="no manual sorting" />
          <RuledFigure
            label="Average confidence"
            value={formatConfidence(avgConfidence)}
            source="M365"
            note="across all classifications"
          />
          <RuledFigure
            label="Invoices to AP"
            value={String(emails.filter((e) => e.classifiedAs === "Invoice").length)}
            source="EzzyBills"
            note="handed to capture"
          />
        </section>

        <section aria-labelledby="messages-title">
          <SectionHead
            id="messages-title"
            title="Messages"
            description="Confidence below 90% shows in amber so a person checks the routing."
          />
          <div
            aria-hidden="true"
            className={cn(columns, "hidden border-b border-border py-2 text-[11.5px] font-medium text-muted-foreground lg:grid")}
          >
            <span className={cells.message}>Message</span>
            <span className={cells.cls}>Classified as</span>
            <span className={cells.routed}>Routed to</span>
            <span className={cells.confidence}>Confidence</span>
            <span className={cells.received}>Received</span>
          </div>
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
                    columns,
                    "w-full items-center py-2.5 text-left transition-colors duration-150 hover:bg-foreground/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    email.classifiedAs === "Noise" && "text-muted-foreground",
                    touched.includes(email.id) && "bg-foreground/[0.04]"
                  )}
                >
                  <span className={cn(cells.message, "min-w-0")}>
                    <span className="block truncate text-[13px] font-medium">{email.subject}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">{email.from}</span>
                    {/* Below lg the class, route and confidence fold into one line. */}
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground lg:hidden">
                      <ClassBadge value={email.classifiedAs} />
                      <span className="inline-flex items-center gap-1">
                        <ArrowRight aria-hidden="true" className="h-3 w-3" />
                        {email.routedTo}
                      </span>
                      <span className={cn("tabular", email.confidence < 0.9 && "text-warn")}>
                        {formatConfidence(email.confidence)}
                      </span>
                      <span className="tabular">{formatDateShort(email.receivedAt)}</span>
                    </span>
                  </span>

                  <span className={cells.cls}>
                    <ClassBadge value={email.classifiedAs} />
                  </span>

                  <span className={cn(cells.routed, "min-w-0 items-center gap-1.5 text-[13px]")}>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{email.routedTo}</span>
                  </span>

                  <span className={cn(cells.confidence, "items-center gap-2")}>
                    <ConfidenceBar value={email.confidence} className="flex-1" />
                    <span
                      className={cn(
                        "tabular w-9 text-right text-[12px]",
                        email.confidence < 0.9 ? "text-warn" : "text-muted-foreground"
                      )}
                    >
                      {formatConfidence(email.confidence)}
                    </span>
                  </span>

                  <span className={cn(cells.received, "tabular text-[12px] text-muted-foreground")}>
                    {formatDateShort(email.receivedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <EmailDialog email={live} open={open} onOpenChange={setOpen} />
    </div>
  );
}
