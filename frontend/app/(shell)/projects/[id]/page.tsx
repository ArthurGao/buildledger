import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/components/status-badge";
import { ProjectLedger } from "@/components/projects/project-ledger";
import { ClockBadge } from "@/components/statutory-clock";
import { getProject, getProjectClocks, getProjectExceptions, getVariations } from "@/lib/derive";
import { projects } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = getProject(params.id);
  if (!project) notFound();

  const projectExceptions = getProjectExceptions(project.id);
  const projectClocks = getProjectClocks(project.id).filter((c) => !c.satisfied);
  const projectVariations = getVariations(project.id);

  const askQuestion =
    project.id === "RIV-01" ? "Why is Riverside over budget?" : `What's committed vs budget on ${project.name}?`;

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-1">
        <div className="min-w-0 space-y-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Link href="/projects" className="hover:text-foreground hover:underline">
              Projects
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="font-mono text-[11.5px] text-foreground">{project.id}</span>
          </nav>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted-foreground">
            <span>{project.client}</span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <ProjectStatusBadge status={project.status} />
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <span>
              {projectVariations.length} variation{projectVariations.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href={`/assistant?q=${encodeURIComponent(askQuestion)}`}>
            <MessageSquareText />
            Ask about this project
          </Link>
        </Button>
      </header>

      {/* One ruled sheet: the bridge, the cost codes and the project's exceptions
          and clocks are sections of the same page, not separate cards. */}
      <div className="divide-y divide-border border border-border bg-card">
        <ProjectLedger project={project} />

        {/* Same 12-column lines as the bridge and the table: the split at 8 runs
            down from the bridge | figures division and the table's spend-to-date
            | at-completion edge. */}
        <div className="grid lg:grid-cols-12">
          <section aria-labelledby="exceptions-title" className="min-w-0 lg:col-span-8">
            <header className="flex items-baseline justify-between border-b border-foreground px-4 pb-2.5 pt-4 md:px-5">
              <h2 id="exceptions-title" className="text-[15px] font-semibold tracking-[-0.01em]">
                Exceptions
              </h2>
              <Link href="/exceptions" className="text-[12px] text-muted-foreground hover:text-foreground hover:underline">
                All exceptions
              </Link>
            </header>
            {projectExceptions.length === 0 ? (
              <p className="px-5 py-6 text-[13px] text-muted-foreground">Nothing flagged on this project.</p>
            ) : (
              <ul className="divide-y divide-border">
                {projectExceptions.map((e) => (
                  <li key={e.id}>
                    <Link
                      href="/exceptions"
                      className="grid grid-cols-[1rem_minmax(0,1fr)_auto] gap-x-3 px-4 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] md:px-5"
                    >
                      <span
                        aria-hidden="true"
                        className={cn("mt-[5px] h-2 w-2", e.severity === "High" ? "bg-over" : "bg-warn")}
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-[13px] font-medium">
                          {e.type}
                          {e.severity === "High" ? <span className="sr-only">(high severity)</span> : null}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{e.description}</span>
                      </span>
                      <span className="tabular text-right text-[13px] font-medium">
                        {e.amount ? formatCurrency(e.amount) : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="deadlines-title"
            className="min-w-0 border-t border-border lg:col-span-4 lg:border-l lg:border-t-0"
          >
            <header className="flex items-baseline justify-between border-b border-foreground px-4 pb-2.5 pt-4 md:px-5">
              <h2 id="deadlines-title" className="text-[15px] font-semibold tracking-[-0.01em]">
                Statutory deadlines
              </h2>
              <span className="text-[12px] text-muted-foreground">NZ working days</span>
            </header>
            {projectClocks.length === 0 ? (
              <p className="px-5 py-6 text-[13px] text-muted-foreground">Nothing running against a statutory clock.</p>
            ) : (
              <ul className="divide-y divide-border">
                {projectClocks.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={c.kind === "Variation notice due" ? "/variations" : "/approvals"}
                      className="block px-4 py-2.5 transition-colors duration-150 hover:bg-foreground/[0.03] md:px-5"
                    >
                      <span className="block text-[13px] font-medium leading-snug">{c.sourceLabel}</span>
                      {/* A four-column measure: the clock sits beside its kind and wraps under it when narrow. */}
                      <span className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <span className="text-[12.5px] text-muted-foreground">{c.kind}</span>
                        <ClockBadge clock={c} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
