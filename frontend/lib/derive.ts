import { clockPosition, workingDaysBetween } from "./working-days";
import { formatCurrency, formatDateLong } from "./format";
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
  lineRecords,
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
  PaymentScheduleDraft,
  ScheduleReason,
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
  LineRecord,
  Project,
} from "./types";

/**
 * Derived views over the mock data. Everything here is a pure function —
 * no fetching, no caching, no side effects.
 */

export function withVariance(line: BudgetLine): BudgetLineWithVariance {
  const variance = line.actualAmount - line.budgetAmount;
  const variancePct = line.budgetAmount === 0 ? 0 : (variance / line.budgetAmount) * 100;
  const forecastVariance = line.forecastAmount - line.budgetAmount;
  const forecastVariancePct = line.budgetAmount === 0 ? 0 : (forecastVariance / line.budgetAmount) * 100;
  return {
    ...line,
    variance,
    variancePct,
    isOver: variance > 0,
    forecastVariance,
    forecastVariancePct,
    isForecastOver: forecastVariance > 0,
  };
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
  return getProjectLines(projectId).sort((a, b) => b.variancePct - a.variancePct);
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
      forecast: acc.forecast + l.forecastAmount,
    }),
    { budget: 0, committed: 0, actual: 0, forecast: 0 }
  );
}

/** The purchase orders and bills a line's committed and actual are summed from. */
export function getLineRecords(projectId: string, costCode: string): LineRecord[] {
  return lineRecords
    .filter((r) => r.projectId === projectId && r.costCode === costCode)
    .sort((a, b) => (a.kind === b.kind ? b.date.localeCompare(a.date) : a.kind === "Purchase order" ? -1 : 1));
}

export interface BridgeStep {
  code: string;
  description: string;
  /** Forecast minus budget for the trade, or the netted sum for the rest. */
  delta: number;
  /** Several small trades folded into one step. */
  folded?: number;
}

/**
 * Budget to forecast, as a bridge: the trades that move the total each get a
 * step, largest first, and everything smaller nets into one closing step so
 * the picture stays readable. The steps always sum to forecast minus budget.
 */
export function getForecastBridge(projectId: string, maxSteps = 5): BridgeStep[] {
  const lines = getProjectLines(projectId)
    .filter((l) => l.forecastVariance !== 0)
    .sort((a, b) => Math.abs(b.forecastVariance) - Math.abs(a.forecastVariance));
  const named = lines.slice(0, maxSteps).map((l) => ({
    code: l.code,
    description: l.description,
    delta: l.forecastVariance,
  }));
  const rest = lines.slice(maxSteps);
  if (rest.length > 0) {
    named.push({
      code: "other",
      description: `${rest.length} other trade${rest.length === 1 ? "" : "s"}`,
      delta: rest.reduce((sum, l) => sum + l.forecastVariance, 0),
      folded: rest.length,
    } as BridgeStep);
  }
  return named;
}

/**
 * The bridge's bar track spans four columns of the sheet's 12-column grid, so
 * its axis always splits into exactly four intervals: every tick line then
 * falls on a column line shared with the cost-code table below.
 */
export const BRIDGE_INTERVALS = 4;

/** Smallest of 1, 2, 2.5, 5 × 10^n that is at least `raw`. */
function niceStep(raw: number): number {
  const exp = Math.floor(Math.log10(raw));
  const base = 10 ** exp;
  for (const m of [1, 2, 2.5, 5, 10]) if (m * base >= raw) return m * base;
  return 10 * base;
}

/**
 * Axis for the budget-to-forecast bridge, cut well above zero so a few thousand
 * dollars on a trade stay visible against a total of hundreds of thousands.
 * Leaves room below the lowest bar end (where the total bars carry their break
 * mark) and a little above the highest.
 */
export function getBridgeAxis(projectId: string) {
  const project = getProject(projectId);
  if (!project) throw new Error(`Unknown project ${projectId}`);
  const ends = [project.budgetTotal, project.forecastFinal];
  let running = project.budgetTotal;
  for (const s of getForecastBridge(projectId)) ends.push((running += s.delta));

  const lo = Math.min(...ends);
  const hi = Math.max(...ends);
  const span = Math.max(hi - lo, project.budgetTotal * 0.01);
  const floor = lo - span * 0.35;
  const ceiling = hi + span * 0.1;

  let step = niceStep((ceiling - floor) / BRIDGE_INTERVALS);
  let min = Math.floor(floor / step) * step;
  // Snapping the floor down can push the top past four steps; widen until it fits.
  while (min + BRIDGE_INTERVALS * step < ceiling) {
    step = niceStep(step * 1.01);
    min = Math.floor(floor / step) * step;
  }
  const ticks = Array.from({ length: BRIDGE_INTERVALS + 1 }, (_, i) => min + i * step);
  return { min, max: ticks[BRIDGE_INTERVALS], step, ticks };
}

/**
 * Every project with its forecast variance, largest overrun by percentage
 * first: a 6% overrun on a small job outranks 3% on a large one, because it
 * says more about how the job is being run.
 */
export function getPortfolioLedger() {
  return projects
    .map((p) => {
      const variance = p.forecastFinal - p.budgetTotal;
      return { ...p, variance, variancePct: (variance / p.budgetTotal) * 100, over: variance > 0 };
    })
    .sort((a, b) => b.variancePct - a.variancePct);
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
  return [...exceptions, ...getStatutoryExceptions()];
}

/**
 * The clock-raised exceptions. One tied to a running clock takes its type,
 * severity and days left from that clock, so the exceptions list can never
 * call a deadline missed while the clock still shows a day to go.
 */
export function getStatutoryExceptions(): ExceptionItem[] {
  return statutoryExceptions.map((e) => {
    const clock = e.clockSourceId ? getClockForSource(e.clockSourceId) : undefined;
    if (!clock || clock.satisfied) return e;
    if (clock.overdue) {
      return {
        ...e,
        type: "Variation notice overdue",
        severity: "High",
        description: `${e.description} The ${clock.workingDays} working days ran out on ${formatDateLong(clock.dueOn)}, so the right to claim may already be lost.`,
      };
    }
    const days = `${clock.remaining} working day${clock.remaining === 1 ? "" : "s"}`;
    return {
      ...e,
      type: "Variation notice due",
      severity: "Medium",
      description: `${e.description} ${days} ${clock.remaining === 1 ? "remains" : "remain"} — notice is due ${formatDateLong(clock.dueOn)}, or the right to claim is lost.`,
    };
  });
}

/** High severity first — the exceptions panel leads with what matters. */
export function getExceptionsBySeverity(): ExceptionItem[] {
  const rank = { High: 0, Medium: 1 };
  return getAllExceptions().sort((a, b) => rank[a.severity] - rank[b.severity]);
}

/**
 * Money at stake across all exceptions. One invoice can raise more than one
 * exception (INV-001 has no PO and its payment schedule is overdue), so an
 * amount tied to an invoice is counted once, however many exceptions cite it.
 */
export function getExceptionExposure(): number {
  const byInvoice = new Map<string, number>();
  let unlinked = 0;
  for (const e of getAllExceptions()) {
    if (!e.amount) continue;
    if (e.relatedInvoiceId) {
      byInvoice.set(e.relatedInvoiceId, Math.max(byInvoice.get(e.relatedInvoiceId) ?? 0, e.amount));
    } else {
      unlinked += e.amount;
    }
  }
  return unlinked + Array.from(byInvoice.values()).reduce((sum, v) => sum + v, 0);
}

/**
 * Exceptions split the way the firm acts on them: spend problems (duplicates,
 * missing POs, overruns) and statutory ones raised by a running clock. Each
 * group leads with High severity, then the largest amount.
 */
export function getExceptionGroups() {
  const statutoryIds = new Set(statutoryExceptions.map((e) => e.id));
  const rank = { High: 0, Medium: 1 };
  const all = getAllExceptions().sort(
    (a, b) => rank[a.severity] - rank[b.severity] || (b.amount ?? 0) - (a.amount ?? 0)
  );
  return {
    spend: all.filter((e) => !statutoryIds.has(e.id)),
    statutory: all.filter((e) => statutoryIds.has(e.id)),
  };
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

/**
 * Variation notification clocks only — what the Variations nav badge counts.
 * Missed notices are red; ones due within three working days are amber.
 */
export function getVariationClockCounts() {
  const open = getOpenClocks().filter((c) => c.kind === "Variation notice due");
  return {
    missed: open.filter((c) => c.overdue).length,
    dueSoon: open.filter((c) => !c.overdue && c.remaining <= 3).length,
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

// ---------------------------------------------------------------------------
// Drafting a payment schedule
//
// This is the clearest case of AI earning its place: the law demands reasons,
// and the reconciliation already holds them. Nothing here is invented — every
// reason points at a record the reader can open.
// ---------------------------------------------------------------------------

export function draftPaymentSchedule(invoice: Invoice): PaymentScheduleDraft {
  const reasons: ScheduleReason[] = [];

  if (invoice.flags?.includes("Duplicate")) {
    const original = invoices.find(
      (i) => i.invoiceNumber === invoice.invoiceNumber && i.id !== invoice.id
    );
    reasons.push({
      kind: "Duplicate claim",
      amount: invoice.amount,
      explanation: `The whole amount duplicates ${invoice.invoiceNumber} dated ${original ? formatDateLong(original.date) : "earlier"}, which has already been certified.`,
      evidence: `Matched on supplier, claim number and amount against ${original?.id ?? "the earlier claim"}.`,
      sources: ["EzzyBills", "Xero"],
    });
  }

  // An instruction that has not been agreed as a variation cannot be certified,
  // however real the work is.
  const openVariation = variations.find(
    (v) =>
      v.projectId === invoice.projectId &&
      v.costCode === invoice.lineCode &&
      (v.status === "Identified" || v.status === "Notified")
  );
  if (openVariation && !invoice.flags?.includes("Duplicate")) {
    const withheld = Math.round(invoice.amount * 0.21);
    reasons.push({
      kind: "Uncertified variation",
      amount: withheld,
      explanation: `${formatCurrency(withheld)} of the claim relates to work instructed on ${formatDateLong(openVariation.instructedOn)} that has not yet been agreed as a variation.`,
      evidence: `Variation ${openVariation.id} — "${openVariation.description}" — is still ${openVariation.status.toLowerCase()}.`,
      sources: ["CostX", "M365"],
    });
  }

  if (invoice.flags?.includes("No PO") && !invoice.flags?.includes("Duplicate")) {
    reasons.push({
      kind: "No purchase order",
      amount: 0,
      explanation:
        "No approved purchase order covers this claim. The balance is certified on the basis of work verified on site, not on an order.",
      evidence: "No matching purchase order found in Xero for this supplier and cost code.",
      sources: ["Xero", "ApprovalMax"],
    });
  }

  const withheld = reasons.reduce((s, r) => s + r.amount, 0);
  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    supplier: invoice.supplier,
    projectId: invoice.projectId,
    claimedAmount: invoice.amount,
    scheduledAmount: invoice.amount - withheld,
    reasons,
  };
}
