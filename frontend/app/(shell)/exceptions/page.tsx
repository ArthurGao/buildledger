import { PageHeader } from "@/components/page-header";
import { ExceptionCard } from "@/components/exceptions/exception-card";
import { Badge } from "@/components/ui/badge";
import { getExceptionCounts, getExceptionsBySeverity } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";

export default function ExceptionsPage() {
  const items = getExceptionsBySeverity();
  const counts = getExceptionCounts();
  const exposure = items.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exceptions"
        description="Automatically surfaced from across Xero, CostX and ApprovalMax. Nobody had to export a spreadsheet to find these."
      />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-5 py-3.5 shadow-card">
        <div className="flex items-center gap-2">
          <Badge variant="over">{counts.high} High</Badge>
          <span className="text-muted-foreground">·</span>
          <Badge variant="warn">{counts.medium} Medium</Badge>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          Total exposure{" "}
          <span className="tabular font-semibold text-foreground">{formatCurrency(exposure)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((e) => (
          <ExceptionCard key={e.id} exception={e} />
        ))}
      </div>
    </div>
  );
}
