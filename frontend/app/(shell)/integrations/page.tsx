import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { SystemCard } from "@/components/integrations/system-card";
import { SourceBadge } from "@/components/source-badge";
import { integrations } from "@/lib/mock-data";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Your existing tools stay in place — this platform reads from them and joins the data. Nothing is migrated, nothing is replaced."
      />

      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-wrap items-center gap-x-3 gap-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge system="CostX" />
            <span className="text-muted-foreground">+</span>
            <SourceBadge system="Xero" />
            <span className="text-muted-foreground">+</span>
            <SourceBadge system="EzzyBills" />
            <span className="text-muted-foreground">+</span>
            <SourceBadge system="ApprovalMax" />
            <span className="text-muted-foreground">+</span>
            <SourceBadge system="M365" />
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm font-medium">
            One reconciled view — budget vs actual, exceptions and plain-English answers.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => (
          <SystemCard key={i.system} integration={i} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Connection states shown here are illustrative. This demo contains sample data only and is not
        connected to any live system.
      </p>
    </div>
  );
}
