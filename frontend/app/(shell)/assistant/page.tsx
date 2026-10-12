import { Suspense } from "react";
import { TitleBand } from "@/components/ledger/title-band";
import { Chat } from "@/components/assistant/chat";
import { SourceBadge } from "@/components/source-badge";

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <TitleBand
        title="Assistant"
        meta={[
          "Read-only",
          <span key="reads" className="inline-flex items-center gap-1">
            Reads from <SourceBadge system="CostX" short /> <SourceBadge system="Xero" short />
          </span>,
        ]}
        description="Ask about budgets, spend, margins or exceptions in plain English. Answers are read-only and always cite the systems they came from."
      />

      <div className="border border-border bg-card">
        <Suspense fallback={<div className="h-[460px]" aria-busy="true" />}>
          <Chat />
        </Suspense>
      </div>
    </div>
  );
}
