import {
  activity,
  approvalSteps,
  budgetLines,
  chatQA,
  emails,
  exceptions,
  integrations,
  invoices,
  projects,
} from "./mock-data";
import type {
  ApprovalStep,
  BudgetLine,
  BudgetLineWithVariance,
  ChatQA,
  ExceptionItem,
  Invoice,
  Project,
} from "./types";

/**
 * Derived views over the mock data. Everything here is a pure function —
 * no fetching, no caching, no side effects.
 */

export function withVariance(line: BudgetLine): BudgetLineWithVariance {
  const variance = line.actualAmount - line.budgetAmount;
  const variancePct = line.budgetAmount === 0 ? 0 : (variance / line.budgetAmount) * 100;
  return { ...line, variance, variancePct, isOver: variance > 0 };
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getProjectName(id: string): string {
  return getProject(id)?.name ?? id;
}

/** Budget lines for a project, in trade-code order, with variance derived. */
export function getProjectLines(projectId: string): BudgetLineWithVariance[] {
  return budgetLines
    .filter((l) => l.projectId === projectId)
    .map(withVariance)
    .sort((a, b) => a.code.localeCompare(b.code));
}

/** Same lines, worst overrun first — this is what makes the story obvious. */
export function getLinesByVariance(projectId: string): BudgetLineWithVariance[] {
  return getProjectLines(projectId).sort((a, b) => b.variance - a.variance);
}

/** The trades actually driving an overrun. */
export function getOverBudgetLines(projectId: string): BudgetLineWithVariance[] {
  return getLinesByVariance(projectId).filter((l) => l.isOver);
}

export function getLineTotals(projectId: string) {
  const lines = getProjectLines(projectId);
  return lines.reduce(
    (acc, l) => ({
      budget: acc.budget + l.budgetAmount,
      committed: acc.committed + l.committedAmount,
      actual: acc.actual + l.actualAmount,
    }),
    { budget: 0, committed: 0, actual: 0 }
  );
}

/** Portfolio roll-up for the dashboard KPI row. */
export function getPortfolioTotals() {
  const totals = projects.reduce(
    (acc, p) => ({
      budget: acc.budget + p.budgetTotal,
      committed: acc.committed + p.committedTotal,
      actual: acc.actual + p.actualTotal,
      forecast: acc.forecast + p.forecastFinal,
    }),
    { budget: 0, committed: 0, actual: 0, forecast: 0 }
  );

  // Weight each project's margin by its budget so one small job cannot skew the number.
  const weighted = (key: "budgetMarginPct" | "forecastMarginPct") =>
    projects.reduce((sum, p) => sum + p[key] * p.budgetTotal, 0) / totals.budget;

  return {
    ...totals,
    budgetMarginPct: weighted("budgetMarginPct"),
    forecastMarginPct: weighted("forecastMarginPct"),
    openExceptions: exceptions.length,
  };
}

export function getProjectInvoices(projectId: string): Invoice[] {
  return invoices.filter((i) => i.projectId === projectId);
}

export function getInvoice(id: string): Invoice | undefined {
  return invoices.find((i) => i.id === id);
}

export function getApprovalChain(invoiceId: string): ApprovalStep[] {
  return approvalSteps.filter((s) => s.invoiceId === invoiceId);
}

/** The approver currently holding an invoice, if any. */
export function getCurrentApprover(invoiceId: string): ApprovalStep | undefined {
  return getApprovalChain(invoiceId).find((s) => s.status === "Waiting");
}

export function getProjectExceptions(projectId: string): ExceptionItem[] {
  return exceptions.filter((e) => e.projectId === projectId);
}

/** High severity first — the exceptions panel leads with what matters. */
export function getExceptionsBySeverity(): ExceptionItem[] {
  const rank = { High: 0, Medium: 1 };
  return [...exceptions].sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function getExceptionCounts() {
  return {
    high: exceptions.filter((e) => e.severity === "High").length,
    medium: exceptions.filter((e) => e.severity === "Medium").length,
    total: exceptions.length,
  };
}

/** Days since an invoice was dated, as of the demo's "today". */
export const DEMO_TODAY = new Date("2026-09-18T09:00:00+12:00");

export function ageInDays(isoDate: string): number {
  const ms = DEMO_TODAY.getTime() - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/**
 * Match a free-text question to a canned answer. Keyword overlap only —
 * deliberately simple, since the assistant is a scripted demo.
 */
export function matchQuestion(input: string): ChatQA | undefined {
  const q = input.toLowerCase().trim();
  if (!q) return undefined;

  const exact = chatQA.find((c) => c.question.toLowerCase() === q);
  if (exact) return exact;

  let best: { qa: ChatQA; score: number } | undefined;
  for (const qa of chatQA) {
    const score = qa.keywords.reduce((s, k) => (q.includes(k) ? s + k.length : s), 0);
    if (score > 0 && (!best || score > best.score)) best = { qa, score };
  }
  return best?.qa;
}

export { activity, budgetLines, chatQA, emails, exceptions, integrations, invoices, projects };
