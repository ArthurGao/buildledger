import type { ApprovalStep, Invoice, InvoiceStatus } from "./types";

/**
 * Approval decisions as pure functions over the demo's invoice and approval
 * state. Kept out of the React provider so the rules can be checked by
 * `npm run check` and so a decision can be undone exactly.
 */

export const PIPELINE: InvoiceStatus[] = ["Captured", "Coded", "Pending approval", "Approved", "Awaiting payment", "Paid"];

export function nextStatus(status: InvoiceStatus): InvoiceStatus {
  const i = PIPELINE.indexOf(status);
  return i >= 0 && i < PIPELINE.length - 1 ? PIPELINE[i + 1] : status;
}

export interface DecisionResult {
  invoices: Invoice[];
  steps: ApprovalStep[];
  /** The approver whose step was stamped, if any was waiting. */
  decidedBy?: string;
  /** Position of the stamped step in its chain, 1-based. */
  step?: number;
  /** Length of the invoice's approval chain. */
  of?: number;
  /** Who holds the invoice next, when the chain is not yet complete. */
  nextApprover?: string;
}

/** Stamp the first waiting step in this invoice's chain with an outcome. */
function stampNext(steps: ApprovalStep[], invoiceId: string, status: "Approved" | "Rejected", at: string) {
  let decidedBy: string | undefined;
  let step: number | undefined;
  let position = 0;
  const next = steps.map((s) => {
    if (s.invoiceId !== invoiceId) return s;
    position++;
    if (decidedBy !== undefined || s.status !== "Waiting") return s;
    decidedBy = s.approver;
    step = position;
    return { ...s, status, timestamp: at };
  });
  const nextApprover =
    status === "Approved" ? next.find((s) => s.invoiceId === invoiceId && s.status === "Waiting")?.approver : undefined;
  return { steps: next, decidedBy, step, of: position, nextApprover };
}

/**
 * Approve on behalf of the next waiting approver. The invoice only moves on
 * once every approver in its chain has signed; until then it stays pending.
 */
export function approve(invoices: Invoice[], steps: ApprovalStep[], invoiceId: string, at: string): DecisionResult {
  const stamped = stampNext(steps, invoiceId, "Approved", at);
  const stillWaiting = stamped.steps.some((s) => s.invoiceId === invoiceId && s.status === "Waiting");
  return {
    invoices: stillWaiting
      ? invoices
      : invoices.map((i) => (i.id === invoiceId ? { ...i, status: nextStatus(i.status) } : i)),
    steps: stamped.steps,
    decidedBy: stamped.decidedBy,
    step: stamped.step,
    of: stamped.of,
    nextApprover: stamped.nextApprover,
  };
}

/** Reject at the next waiting step. A rejected invoice drops back to coding rather than leaving the pipeline. */
export function reject(invoices: Invoice[], steps: ApprovalStep[], invoiceId: string, at: string): DecisionResult {
  const stamped = stampNext(steps, invoiceId, "Rejected", at);
  return {
    invoices: invoices.map((i) => (i.id === invoiceId ? { ...i, status: "Coded" as const } : i)),
    steps: stamped.steps,
    decidedBy: stamped.decidedBy,
  };
}

/** What an invoice and its chain looked like before a decision, so the decision can be undone exactly. */
export interface DecisionSnapshot {
  invoiceId: string;
  invoice: Invoice;
  steps: ApprovalStep[];
}

export function snapshot(invoices: Invoice[], steps: ApprovalStep[], invoiceId: string): DecisionSnapshot | null {
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;
  return { invoiceId, invoice, steps: steps.filter((s) => s.invoiceId === invoiceId) };
}

/** Put one invoice and its chain back as they were, leaving every other invoice untouched. */
export function restore(invoices: Invoice[], steps: ApprovalStep[], snap: DecisionSnapshot) {
  const pending = [...snap.steps];
  return {
    invoices: invoices.map((i) => (i.id === snap.invoiceId ? snap.invoice : i)),
    // Chains keep their order, so each of this invoice's steps is replaced in place.
    steps: steps.map((s) => (s.invoiceId === snap.invoiceId ? (pending.shift() ?? s) : s)),
  };
}

/**
 * The activity-log line for a decision. A multi-step chain names the step, so
 * a first signature never reads as the invoice being approved for payment.
 */
export function describeDecision(
  invoice: Invoice,
  outcome: "Approved" | "Rejected",
  result: DecisionResult,
  reason?: string
): string {
  if (outcome === "Rejected") return `${invoice.invoiceNumber} rejected — returned for re-coding`;
  const by = result.decidedBy ? ` by ${result.decidedBy}` : "";
  const despite = reason ? ` despite ${invoice.flags?.join(" and ") ?? "its flags"} — “${reason}”` : "";
  const progress = decisionProgress(result);
  return `${invoice.invoiceNumber} approved${by}${despite}${progress ? ` (${progress})` : ""}`;
}

/** "step 1 of 2, now with …" for a multi-step chain; empty for a single approver. */
export function decisionProgress(result: DecisionResult): string {
  if (!result.step || !result.of || result.of < 2) return "";
  return `step ${result.step} of ${result.of}, ${result.nextApprover ? `now with ${result.nextApprover}` : "fully approved"}`;
}
