import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TitleBand } from "@/components/ledger/title-band";
import { RuledFigure } from "@/components/ledger/ruled-figure";
import { SectionHead } from "@/components/ledger/section-head";
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

  const first = "pl-4 md:pl-5";
  const last = "pr-4 md:pr-5";

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <TitleBand
        title="Purchase requests"
        description="Where commitment starts. A request becomes a purchase order, the order becomes committed cost in the forecast, and the order is what an incoming invoice is matched against."
        action={
          <div className="flex items-center gap-1.5">
            <SourceBadge system="ApprovalMax" />
            <SourceBadge system="Xero" />
          </div>
        }
      />

      <div className="divide-y divide-border border border-border bg-card">
        <section
          aria-label="Purchase figures"
          className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(even)]:border-l max-lg:[&>*:nth-child(n+3)]:border-t lg:[&>*+*]:border-l"
        >
          <RuledFigure label="Open requests" value={String(requests.length - raised.length)} source="ApprovalMax" note="not yet a purchase order" />
          <RuledFigure
            label="Awaiting approval"
            value={String(pending.length)}
            source="ApprovalMax"
            note={formatCompactCurrency(pending.reduce((s, r) => s + r.amount, 0))}
          />
          <RuledFigure label="Orders raised" value={String(raised.length)} source="Xero" note={`${formatCompactCurrency(committed)} committed`} />
          <RuledFigure label="Unmapped cost codes" value="0" source="CostX" note="all requests map to Xero" />
        </section>

        {/* The flow said once, as a line of the sheet rather than a tinted card. */}
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-3 text-[12.5px] md:px-5">
          <span className="font-medium">Request</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">Approval</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">Purchase order</span>
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">committed cost in the forecast, and the key an invoice is matched against</span>
        </p>

        <section aria-labelledby="requests-title">
          <SectionHead
            id="requests-title"
            title="All requests"
            description="Each request carries the cost code it will be charged to, so commitment lands on the right line of the reconciliation before any invoice arrives."
          />
          <Table className="text-[13px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={first}>Supplier</TableHead>
                <TableHead className="hidden lg:table-cell">Project</TableHead>
                <TableHead className="hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    Cost code <SourceBadge system="CostX" short />
                  </span>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5">
                    Maps to <SourceBadge system="Xero" short />
                  </span>
                </TableHead>
                <TableHead className="text-right max-md:pr-4">Amount</TableHead>
                <TableHead className="hidden md:table-cell">Requested</TableHead>
                <TableHead className={`hidden md:table-cell ${last}`}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const mapping = getCostCodeMapping(r.costCode);
                return (
                  <TableRow key={r.id}>
                    <TableCell className={`py-2.5 ${first}`}>
                      <span className="font-medium">{r.supplier}</span>
                      <span className="block text-[12px] text-muted-foreground">by {r.requestedBy}</span>
                      {/* Below md the project, code and status fold under the supplier. */}
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground md:hidden">
                        <span>{getProjectName(r.projectId)}</span>
                        <span className="font-mono text-[11px] sm:hidden">{r.costCode}</span>
                        <Badge variant={tone[r.status]}>{r.status}</Badge>
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{getProjectName(r.projectId)}</TableCell>
                    <TableCell className="hidden whitespace-nowrap font-mono text-[11.5px] sm:table-cell">{r.costCode}</TableCell>
                    <TableCell className="hidden font-mono text-[11.5px] text-muted-foreground md:table-cell">
                      {mapping?.xeroAccountCode ?? "—"}
                      {mapping?.xeroTrackingOption ? ` · ${mapping.xeroTrackingOption}` : ""}
                    </TableCell>
                    <TableCell className="tabular text-right font-medium max-md:pr-4">{formatCurrency(r.amount)}</TableCell>
                    <TableCell className="tabular hidden whitespace-nowrap text-muted-foreground md:table-cell">
                      {formatDateShort(r.requestedOn)}
                    </TableCell>
                    <TableCell className={`hidden md:table-cell ${last}`}>
                      <Badge variant={tone[r.status]}>{r.status}</Badge>
                      {r.poNumber ? (
                        <span className="mt-1 block font-mono text-[11px] text-muted-foreground">{r.poNumber}</span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
