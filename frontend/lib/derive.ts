import { clockPosition, workingDaysBetween } from "./working-days";
import {
  activity,
  approvalSteps,
  budgetLines,
  chatQA,
  contracts,
  costCodeMappings,
  emails,
  exceptions,
  integrations,
  invoices,
  opportunities,
  progressClaims,
  projects,
  purchaseRequests,
  retentionEntries,
  statutoryClocks,
  statutoryExceptions,
  trustAccount,
  variations,
} from "./mock-data";
import type {
  ApprovalStep,
  ClockExposure,
  Contract,
  CostCodeMapping,
  Opportunity,
  ProgressClaim,
  PurchaseRequest,
  RetentionEntry,
  StatutoryClock,
  Variation,
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
  return getAllExceptions().filter((e) => e.projectId === projectId);
}

/** Every exception, including the statutory ones raised by the clocks. */
export function getAllExceptions(): ExceptionItem[] {
  return [...exceptions, ...statutoryExceptions];
}

/** High severity first — the exceptions panel leads with what matters. */
export function getExceptionsBySeverity(): ExceptionItem[] {
  const rank = { High: 0, Medium: 1 };
  return getAllExceptions().sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function getExceptionCounts() {
  const all = getAllExceptions();
  return {
    high: all.filter((e) => e.severity === "High").length,
    medium: all.filter((e) => e.severity === "Medium").length,
    total: all.length,
  };
}

/**
 * The demo's "today", as a plain calendar date. Statutory deadlines are counted
 * in working days from a calendar date, so no time or timezone is involved.
 */
export const DEMO_TODAY = "2026-09-18";

/**
 * Working days elapsed since a document was dated.
 *
 * This used to count calendar days. Every deadline that matters here is
 * measured in working days under the Construction Contracts Act, and those
 * exclude weekends, public holidays, the region's anniversary day, and the
 * whole 24 December to 5 January period — so a calendar count is simply wrong.
 */
export function ageInWorkingDays(isoDate: string): number {
  return workingDaysBetween(isoDate, DEMO_TODAY);
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

// ---------------------------------------------------------------------------
// Statutory clocks
// ---------------------------------------------------------------------------

/** Payment falling due is the other side's obligation; the rest are ours. */
export function clockExposure(kind: StatutoryClock["kind"]): ClockExposure {
  return kind === "Payment due" ? "Theirs" : "Ours";
}

export interface LiveClock extends StatutoryClock {
  exposure: ClockExposure;
  dueOn: string;
  elapsed: number;
  remaining: number;
  overdue: boolean;
  uncertain: boolean;
  satisfied: boolean;
  /** Ordering key: overdue first, then fewest days remaining. */
  urgency: number;
}

/** Resolve a clock against the demo's today. */
export function resolveClock(clock: StatutoryClock): LiveClock {
  const pos = clockPosition(clock.triggeredOn, clock.workingDays, DEMO_TODAY);
  const satisfied = Boolean(clock.satisfiedOn);
  return {
    ...clock,
    ...pos,
    exposure: clockExposure(clock.kind),
    overdue: pos.overdue && !satisfied,
    satisfied,
    urgency: satisfied ? 1000 : pos.remaining,
  };
}

export function getLiveClocks(): LiveClock[] {
  return statutoryClocks.map(resolveClock).sort((a, b) => a.urgency - b.urgency);
}

export function getOpenClocks(): LiveClock[] {
  return getLiveClocks().filter((c) => !c.satisfied);
}

export function getProjectClocks(projectId: string): LiveClock[] {
  return getLiveClocks().filter((c) => c.projectId === projectId);
}

/** The clock attached to a given source document, if there is one. */
export function getClockForSource(sourceId: string): LiveClock | undefined {
  return getLiveClocks().find((c) => c.sourceId === sourceId);
}

export function getClockCounts() {
  const open = getOpenClocks();
  const ours = open.filter((c) => c.exposure === "Ours");
  return {
    total: open.length,
    /** Deadlines we have missed. Excludes the other side failing to pay us. */
    overdue: ours.filter((c) => c.overdue).length,
    /** Three working days or fewer left on one of our obligations. */
    dueSoon: ours.filter((c) => !c.overdue && c.remaining <= 3).length,
    /** Claims the other side has left unanswered — recoverable as a debt. */
    recoverable: open.filter((c) => c.exposure === "Theirs" && c.overdue).length,
  };
}

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------

export function getContract(id: string): Contract | undefined {
  return contracts.find((c) => c.id === id);
}

export function getHeadContract(projectId: string): Contract | undefined {
  return contracts.find((c) => c.projectId === projectId && c.side === "Principal");
}

export function getSubcontracts(projectId?: string): Contract[] {
  return contracts.filter((c) => c.side === "Subcontractor" && (!projectId || c.projectId === projectId));
}

// ---------------------------------------------------------------------------
// Retention ledger
// ---------------------------------------------------------------------------

export interface RetentionPosition {
  contract: Contract;
  withheld: number;
  released: number;
  balance: number;
  /** Cap expressed in dollars, from the contract. */
  cap: number;
  entries: RetentionEntry[];
}

export function getRetentionByContract(): RetentionPosition[] {
  return getSubcontracts()
    .map((contract) => {
      const entries = retentionEntries.filter((e) => e.contractId === contract.id);
      const withheld = entries.reduce((s, e) => s + e.amount, 0);
      const released = entries.filter((e) => e.releasedOn).reduce((s, e) => s + e.amount, 0);
      return {
        contract,
        entries,
        withheld,
        released,
        balance: withheld - released,
        cap: (contract.value * contract.retentionCapPct) / 100,
      };
    })
    .filter((p) => p.entries.length > 0)
    .sort((a, b) => b.balance - a.balance);
}

/**
 * The number that carries criminal exposure: what the ledger says is held on
 * trust, against what the trust account actually contains.
 */
export function getRetentionPosition() {
  const positions = getRetentionByContract();
  const liability = positions.reduce((s, p) => s + p.balance, 0);
  const shortfall = liability - trustAccount.balance;
  return {
    positions,
    liability,
    held: trustAccount.balance,
    shortfall,
    compliant: shortfall <= 0,
    subcontractorCount: positions.length,
  };
}

/** Quarterly reporting is due every three months for each subcontractor. */
export function getRetentionReportDue(): { quarterEnd: string; subcontractors: number } {
  return { quarterEnd: "2026-09-30", subcontractors: getRetentionByContract().length };
}

// ---------------------------------------------------------------------------
// Variations
// ---------------------------------------------------------------------------

export function getVariations(projectId?: string): Variation[] {
  return variations.filter((v) => !projectId || v.projectId === projectId);
}

/** Approved but not yet written back — the reconciliation table is stale for these. */
export function getUnwrittenVariations(projectId?: string): Variation[] {
  return getVariations(projectId).filter((v) => v.status === "Approved" && !v.writtenBackToBudget);
}

export function getVariationValue(projectId?: string) {
  const list = getVariations(projectId);
  return {
    approved: list.filter((v) => v.status === "Approved").reduce((s, v) => s + (v.costImpact ?? 0), 0),
    pending: list
      .filter((v) => v.status === "Notified" || v.status === "Priced")
      .reduce((s, v) => s + (v.costImpact ?? 0), 0),
    unpriced: list.filter((v) => v.costImpact === null).length,
  };
}

// ---------------------------------------------------------------------------
// Progress claims
// ---------------------------------------------------------------------------

export function getProgressClaims(projectId?: string): ProgressClaim[] {
  return progressClaims
    .filter((c) => !projectId || c.projectId === projectId)
    .sort((a, b) => (a.periodEnd < b.periodEnd ? 1 : -1));
}

export function getClaimTotals() {
  const list = getProgressClaims();
  const outstanding = list.filter((c) => c.status === "Served" || c.status === "Scheduled");
  return {
    outstandingCount: outstanding.length,
    outstandingValue: outstanding.reduce((s, c) => s + c.netClaimed, 0),
    draftValue: list.filter((c) => c.status === "Draft").reduce((s, c) => s + c.netClaimed, 0),
    retentionThisRound: list.reduce((s, c) => s + c.retentionWithheld, 0),
  };
}

// ---------------------------------------------------------------------------
// Purchase requests and opportunities
// ---------------------------------------------------------------------------

export function getPurchaseRequests(projectId?: string): PurchaseRequest[] {
  return purchaseRequests.filter((r) => !projectId || r.projectId === projectId);
}

export function getOpportunities(): Opportunity[] {
  return opportunities;
}

export function getPipelineValue() {
  const live = opportunities.filter((o) => o.status !== "Lost" && o.status !== "No bid");
  return {
    count: live.length,
    value: live.reduce((s, o) => s + (o.estimatedValue ?? 0), 0),
    unconfirmed: opportunities.filter((o) => !o.confirmed).length,
  };
}

export function getCostCodeMapping(costCode: string): CostCodeMapping | undefined {
  return costCodeMappings.find((m) => m.costCode === costCode);
}

export {
  contracts,
  costCodeMappings,
  opportunities,
  progressClaims,
  purchaseRequests,
  retentionEntries,
  statutoryClocks,
  trustAccount,
  variations,
};
