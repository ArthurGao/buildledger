import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Chat } from "@/components/assistant/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/source-badge";

export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Assistant"
        description="Ask about budgets, spend, margins or exceptions in plain English. Answers are read-only and always cite the systems they came from."
        actions={
          <div className="flex items-center gap-1.5">
            <SourceBadge system="CostX" />
            <SourceBadge system="Xero" />
          </div>
        }
      />

      <Suspense fallback={<Skeleton className="h-[440px] w-full rounded-lg" />}>
        <Chat />
      </Suspense>
    </div>
  );
}
