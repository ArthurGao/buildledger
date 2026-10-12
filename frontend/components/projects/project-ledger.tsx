"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ForecastBridge } from "@/components/projects/forecast-bridge";
import { ForecastHeadline, ProjectFigures } from "@/components/projects/project-summary";
import { ReconciliationTable } from "@/components/projects/reconciliation-table";
import type { Project } from "@/lib/types";

/**
 * The bridge, the headline figures and the cost-code table share one piece of
 * state: which lines are open. Choosing a trade in the bridge opens its line
 * in the table and brings it into view, so the picture and the records are
 * one move apart.
 */
export function ProjectLedger({ project }: { project: Project }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = useCallback((code: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const reveal = useCallback((code: string) => {
    setOpen((prev) => (prev.has(code) ? prev : new Set(prev).add(code)));
    setHighlighted(code);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHighlighted(null), 900);
    requestAnimationFrame(() => {
      const row = document.getElementById(`line-${code}`);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      row?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    });
  }, []);

  return (
    <>
      <section aria-label="Budget to forecast" className="grid lg:grid-cols-12">
        {/* From xl the bridge rows run edge to edge so their columns land on the
            sheet's grid lines; the heading and headline keep the page margin. */}
        <div className="min-w-0 px-4 pb-4 pt-4 md:px-5 lg:col-span-8 xl:px-0">
          <h2 className="text-[12px] font-medium text-muted-foreground xl:px-5">Forecast at completion against budget</h2>
          <div className="mt-2 xl:px-5">
            <ForecastHeadline project={project} />
          </div>
          <div className="mt-5">
            <ForecastBridge project={project} onSelect={reveal} />
          </div>
        </div>
        <div className="min-w-0 border-t border-border lg:col-span-4 lg:border-l lg:border-t-0">
          <ProjectFigures project={project} />
        </div>
      </section>

      <ReconciliationTable projectId={project.id} open={open} onToggle={toggle} highlighted={highlighted} />
    </>
  );
}
