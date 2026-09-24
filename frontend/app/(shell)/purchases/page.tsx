import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { SourceBadge } from "@/components/source-badge";
import { getCostCodeMapping, getProjectName, getPurchaseRequests } from "@/lib/derive";
import { formatCompactCurrency, formatCurrency, formatDateShort } from "@/lib/format";
import type { PurchaseRequestStatus } from "@/lib/types";

const tone: Record<PurchaseRequestStatus, "secondary" | "warn" | "ok" | "default"> = {
  Draft: "secondary",
  "Pending approval": "warn",
  Approved: "ok",
  "PO raised": "default",
};

export default function PurchasesPage() {
  const requests = getPurchaseRequests();
  const pending = requests.filter((r) => r.status === "Pending approval");
  const raised = requests.filter((r) => r.status === "PO raised");
  const committed = raised.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase requests"
        description="Where commitment starts. A request becomes a purchase order, the order becomes committed cost in the forecast, and the order is what an incoming invoice is matched against."
        actions={
          <div className="flex items-center gap-1.5">
            <SourceBadge system="ApprovalMax" />
            <SourceBadge system="Xero" />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open requests" value={String(requests.length - raised.length)} sources={["ApprovalMax"]} sub="not yet a purchase order" />
        <KpiCard label="Awaiting approval" value={String(pending.length)} sources={["ApprovalMax"]} sub={formatCompactCurrency(pending.reduce((s, r) => s + r.amount, 0))} />
        <KpiCard label="Orders raised" value={String(raised.length)} sources={["Xero"]} sub={`${formatCompactCurrency(committed)} committed`} />
        <KpiCard label="Unmapped cost codes" value="0" sources={["CostX"]} sub="all requests map to Xero" />
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-wrap items-center gap-x-3 gap-y-2 p-5 text-sm">
          <span className="font-medium">Request</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">Approval</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">Purchase order</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            committed cost in the forecast, and the key an invoice is matched against
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">All requests</CardTitle>
          <CardDescription>
            Each request carries the cost code it will be charged to, so commitment lands on the right
            line of the reconciliation before any invoice arrives.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Supplier</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    Cost code <SourceBadge system="CostX" short />
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1.5">
                    Maps to <SourceBadge system="Xero" short />
                  </span>
                </TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const mapping = getCostCodeMapping(r.costCode);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="py-3">
                      <span className="font-medium">{r.supplier}</span>
                      <span className="block text-xs text-muted-foreground">by {r.requestedBy}</span>
                    </TableCell>
                    <TableCell className="text-sm">{getProjectName(r.projectId)}</TableCell>
                    <TableCell className="tabular font-mono text-xs">{r.costCode}</TableCell>
                    <TableCell className="tabular font-mono text-xs text-muted-foreground">
                      {mapping?.xeroAccountCode ?? "—"}
                      {mapping?.xeroTrackingOption ? ` · ${mapping.xeroTrackingOption}` : ""}
                    </TableCell>
                    <TableCell className="tabular text-right font-medium">{formatCurrency(r.amount)}</TableCell>
                    <TableCell className="tabular text-sm text-muted-foreground">
                      {formatDateShort(r.requestedOn)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tone[r.status]}>{r.status}</Badge>
                      {r.poNumber ? (
                        <span className="tabular mt-1 block font-mono text-[11px] text-muted-foreground">
                          {r.poNumber}
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
