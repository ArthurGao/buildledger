import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/status-badge";
import { ProjectSummary } from "@/components/projects/project-summary";
import { ReconciliationTable } from "@/components/projects/reconciliation-table";
import { VarianceChart } from "@/components/projects/variance-chart";
import { ExceptionIcon } from "@/components/exception-icon";
import { SourceBadge } from "@/components/source-badge";
import {
  getLinesByVariance,
  getOverBudgetLines,
  getProject,
  getProjectExceptions,
} from "@/lib/derive";
import { projects } from "@/lib/mock-data";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = getProject(params.id);
  if (!project) notFound();

  const linesByVariance = getLinesByVariance(project.id);
  const overLines = getOverBudgetLines(project.id);
  const projectExceptions = getProjectExceptions(project.id);
  const totalOverrun = overLines.reduce((sum, l) => sum + l.variance, 0);

  const askQuestion =
    project.id === "RIV-01" ? "Why is Riverside over budget?" : `What's committed vs budget on ${project.name}?`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All projects
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
              <Badge variant="outline" className="font-mono text-[11px]">
                {project.id}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{project.client}</p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/assistant?q=${encodeURIComponent(askQuestion)}`}>
              <MessageSquareText className="h-4 w-4" />
              Ask about this project
            </Link>
          </Button>
        </div>
      </div>

      <ProjectSummary project={project} />

      {overLines.length > 0 ? (
        <Card className="border-over-border bg-over-soft/40">
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-over-soft text-over">
                <ExceptionIcon type="Over budget" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-over">
                  {overLines.length} {overLines.length === 1 ? "trade is" : "trades are"} over budget —{" "}
                  {formatSignedCurrency(totalOverrun)} in total
                </p>
                <p className="text-xs text-muted-foreground">
                  {overLines
                    .slice(0, 3)
                    .map((l) => `${l.description} ${formatSignedCurrency(l.variance)}`)
                    .join(" · ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Budget vs actual — line by line</CardTitle>
              <CardDescription>
                Joined on trade code. Budgets come from CostX, commitments from ApprovalMax, actuals from Xero.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <SourceBadge system="CostX" />
              <SourceBadge system="ApprovalMax" />
              <SourceBadge system="Xero" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-1">
          <ReconciliationTable projectId={project.id} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Variance by trade</CardTitle>
            <CardDescription>
              Worst overrun first. Red is over budget; the muted green below the line is mostly work not
              yet invoiced rather than a saving.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VarianceChart lines={linesByVariance} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Exceptions on this project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {projectExceptions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing flagged on this project.
              </p>
            ) : (
              projectExceptions.map((e) => (
                <Link
                  key={e.id}
                  href="/exceptions"
                  className="flex gap-3 rounded-md border border-border p-3 transition-colors hover:border-foreground/20 hover:bg-accent/50"
                >
                  <span
                    className={
                      e.severity === "High"
                        ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-over-soft text-over"
                        : "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-warn-soft text-warn"
                    }
                  >
                    <ExceptionIcon type={e.type} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{e.type}</span>
                      <Badge variant={e.severity === "High" ? "over" : "warn"}>{e.severity}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{e.description}</p>
                    {e.amount ? (
                      <p className="tabular mt-1 text-xs font-medium">{formatCurrency(e.amount)}</p>
                    ) : null}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
