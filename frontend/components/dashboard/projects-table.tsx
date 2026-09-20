import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectStatusBadge } from "@/components/status-badge";
import { SourceBadge } from "@/components/source-badge";
import { projects } from "@/lib/mock-data";
import { formatCurrency, formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjectsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[200px]">Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1.5">
              Budget <SourceBadge system="CostX" short />
            </span>
          </TableHead>
          <TableHead className="text-right">
            <span className="inline-flex items-center gap-1.5">
              Actual <SourceBadge system="Xero" short />
            </span>
          </TableHead>
          <TableHead className="w-40">Spend to date</TableHead>
          <TableHead className="text-right">Forecast margin</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((p) => {
          const spend = Math.min(100, (p.actualTotal / p.budgetTotal) * 100);
          const overBudget = p.status === "Over budget";
          const marginDown = p.forecastMarginPct < p.budgetMarginPct;

          return (
            <TableRow key={p.id} className={cn("group", overBudget && "bg-over-soft/40")}>
              <TableCell className="py-3">
                <Link href={`/projects/${p.id}`} className="block">
                  <span className="font-medium group-hover:text-primary">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.client}</span>
                </Link>
              </TableCell>
              <TableCell>
                <ProjectStatusBadge status={p.status} />
              </TableCell>
              <TableCell className="tabular text-right">{formatCurrency(p.budgetTotal)}</TableCell>
              <TableCell className="tabular text-right">{formatCurrency(p.actualTotal)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", overBudget ? "bg-over" : "bg-primary")}
                      style={{ width: `${spend}%` }}
                    />
                  </div>
                  <span className="tabular w-9 text-right text-xs text-muted-foreground">
                    {Math.round(spend)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="tabular text-right">
                <span className={cn("font-medium", marginDown ? "text-over" : "text-ok")}>
                  {formatPct(p.forecastMarginPct)}
                </span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  from {formatPct(p.budgetMarginPct)}
                </span>
              </TableCell>
              <TableCell>
                <Link href={`/projects/${p.id}`} aria-label={`Open ${p.name}`}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
