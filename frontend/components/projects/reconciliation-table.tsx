import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SourceBadge } from "@/components/source-badge";
import { VarianceBar } from "@/components/variance-bar";
import { getLineTotals, getProjectLines } from "@/lib/derive";
import { formatCurrency, formatSignedCurrency, formatSignedPct } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The centrepiece of the demo: CostX budget against Xero actual, line by
 * line, with the variance spelled out. Over-budget rows are red, everything
 * else stays quiet so the overruns are the only thing that shouts.
 */
export function ReconciliationTable({ projectId }: { projectId: string }) {
  const lines = getProjectLines(projectId);
  const totals = getLineTotals(projectId);
  const maxVariance = Math.max(...lines.map((l) => Math.abs(l.variance)), 1);
  const totalVariance = totals.actual - totals.budget;

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-20">Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1.5">
              Budget <SourceBadge system="CostX" short />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1.5">
              Committed <SourceBadge system="ApprovalMax" short />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1.5">
              Actual <SourceBadge system="Xero" short />
            </span>
          </TableHead>
          <TableHead className="text-right">Variance $</TableHead>
          <TableHead className="text-right">Variance %</TableHead>
          <TableHead className="w-28">Over / under</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {lines.map((l) => (
          <TableRow key={l.code} className={cn(l.isOver && "bg-over-soft/50 hover:bg-over-soft/70")}>
            <TableCell className="tabular font-mono text-xs text-muted-foreground">{l.code}</TableCell>
            <TableCell className={cn("font-medium", l.isOver && "text-over")}>{l.description}</TableCell>
            <TableCell className="tabular text-right">{formatCurrency(l.budgetAmount)}</TableCell>
            <TableCell className="tabular text-right text-muted-foreground">
              {formatCurrency(l.committedAmount)}
            </TableCell>
            <TableCell className="tabular text-right">{formatCurrency(l.actualAmount)}</TableCell>
            <TableCell className={cn("tabular text-right font-medium", l.isOver ? "text-over" : "text-ok")}>
              {formatSignedCurrency(l.variance)}
            </TableCell>
            <TableCell className={cn("tabular text-right", l.isOver ? "text-over" : "text-muted-foreground")}>
              {formatSignedPct(l.variancePct)}
            </TableCell>
            <TableCell>
              <VarianceBar value={l.variance} max={maxVariance} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      <TableFooter>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={2} className="font-semibold">
            Total
          </TableCell>
          <TableCell className="tabular text-right font-semibold">{formatCurrency(totals.budget)}</TableCell>
          <TableCell className="tabular text-right font-semibold">{formatCurrency(totals.committed)}</TableCell>
          <TableCell className="tabular text-right font-semibold">{formatCurrency(totals.actual)}</TableCell>
          <TableCell
            className={cn("tabular text-right font-semibold", totalVariance > 0 ? "text-over" : "text-ok")}
          >
            {formatSignedCurrency(totalVariance)}
          </TableCell>
          <TableCell className="tabular text-right text-muted-foreground">
            {formatSignedPct((totalVariance / totals.budget) * 100)}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
