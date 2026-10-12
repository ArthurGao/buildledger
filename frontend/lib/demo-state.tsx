"use client";

import * as React from "react";
import {
  activity as seedActivity,
  approvalSteps as seedApprovalSteps,
  emails as seedEmails,
  invoices as seedInvoices,
} from "./mock-data";
import {
  PIPELINE,
  approve,
  decisionProgress,
  describeDecision,
  nextStatus,
  reject,
  restore,
  snapshot,
  type DecisionSnapshot,
} from "./approvals";
import type { ActivityItem, ApprovalStep, EmailItem, Invoice } from "./types";

/**
 * All "actions" in this demo — approve, reject, advance, re-route — mutate
 * this React state and nothing else. No backend, no persistence: a refresh
 * puts the demo back to its opening position, which is what you want when
 * showing it to a room.
 */

interface DemoState {
  invoices: Invoice[];
  approvalSteps: ApprovalStep[];
  emails: EmailItem[];
  activity: ActivityItem[];
  /** Ids touched this session — used to highlight what the viewer just did. */
  touched: string[];
  /** Invoices a payment schedule has been issued against, meeting the deadline. */
  schedulesIssued: string[];
  /** Approval decisions taken this session, newest first, each one undoable. */
  decisions: Decision[];
  /** `reason` is required by the UI when the invoice carries flags; it is kept in the activity log. */
  approveInvoice: (invoiceId: string, reason?: string) => void;
  rejectInvoice: (invoiceId: string) => void;
  /** Undo the latest decision on this invoice, restoring it and its chain exactly. */
  undoDecision: (invoiceId: string) => void;
  advanceInvoice: (invoiceId: string) => void;
  routeEmail: (emailId: string, routedTo: string) => void;
  issuePaymentSchedule: (invoiceId: string) => void;
  reset: () => void;
}

export interface Decision {
  invoiceId: string;
  invoiceNumber: string;
  outcome: "Approved" | "Rejected";
  decidedBy?: string;
  reason?: string;
  /** "step 1 of 2, now with …" when the chain has more than one approver. */
  progress?: string;
  /** The activity entry this decision wrote, removed again on undo. */
  activityId: string;
  before: DecisionSnapshot;
}

const DemoStateContext = React.createContext<DemoState | null>(null);

let activityCounter = 0;
function makeActivity(item: Omit<ActivityItem, "id" | "at">): ActivityItem {
  activityCounter += 1;
  return { ...item, id: `ACT-LIVE-${activityCounter}`, at: "just now" };
}

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = React.useState<Invoice[]>(seedInvoices);
  const [approvalSteps, setApprovalSteps] = React.useState<ApprovalStep[]>(seedApprovalSteps);
  const [emails, setEmails] = React.useState<EmailItem[]>(seedEmails);
  const [activity, setActivity] = React.useState<ActivityItem[]>(seedActivity);
  const [touched, setTouched] = React.useState<string[]>([]);
  const [schedulesIssued, setSchedulesIssued] = React.useState<string[]>([]);
  const [decisions, setDecisions] = React.useState<Decision[]>([]);

  const markTouched = React.useCallback((id: string) => {
    setTouched((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const decide = React.useCallback(
    (invoiceId: string, outcome: Decision["outcome"], reason?: string) => {
      const invoice = invoices.find((i) => i.id === invoiceId);
      const before = snapshot(invoices, approvalSteps, invoiceId);
      if (!invoice || !before) return;

      const at = new Date().toISOString();
      const result =
        outcome === "Approved"
          ? approve(invoices, approvalSteps, invoiceId, at)
          : reject(invoices, approvalSteps, invoiceId, at);
      const entry = makeActivity({
        kind: "approval",
        system: "ApprovalMax",
        message: describeDecision(invoice, outcome, result, reason),
      });

      setInvoices(result.invoices);
      setApprovalSteps(result.steps);
      markTouched(invoiceId);
      setActivity((prev) => [entry, ...prev]);
      setDecisions((prev) => [
        {
          invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          outcome,
          decidedBy: result.decidedBy,
          reason,
          progress: outcome === "Approved" ? decisionProgress(result) || undefined : undefined,
          activityId: entry.id,
          before,
        },
        ...prev,
      ]);
    },
    [invoices, approvalSteps, markTouched]
  );

  const approveInvoice = React.useCallback(
    (invoiceId: string, reason?: string) => decide(invoiceId, "Approved", reason),
    [decide]
  );
  const rejectInvoice = React.useCallback((invoiceId: string) => decide(invoiceId, "Rejected"), [decide]);

  const undoDecision = React.useCallback(
    (invoiceId: string) => {
      const latest = decisions.find((d) => d.invoiceId === invoiceId);
      if (!latest) return;
      const restored = restore(invoices, approvalSteps, latest.before);
      setInvoices(restored.invoices);
      setApprovalSteps(restored.steps);
      setActivity((prev) => prev.filter((a) => a.id !== latest.activityId));
      setDecisions((prev) => prev.filter((d) => d !== latest));
    },
    [decisions, invoices, approvalSteps]
  );

  const advanceInvoice = React.useCallback(
    (invoiceId: string) => {
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (!invoice || invoice.status === "Paid") return;
      const to = nextStatus(invoice.status);

      setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status: to } : i)));
      markTouched(invoiceId);
      setActivity((prev) => [
        makeActivity({
          kind: "invoice",
          system: to === "Paid" || to === "Awaiting payment" ? "Xero" : "EzzyBills",
          message: `${invoice.invoiceNumber} moved to ${to.toLowerCase()}`,
        }),
        ...prev,
      ]);
    },
    [invoices, markTouched]
  );

  const routeEmail = React.useCallback(
    (emailId: string, routedTo: string) => {
      const email = emails.find((e) => e.id === emailId);
      if (!email || email.routedTo === routedTo) return;

      setEmails((prev) => prev.map((e) => (e.id === emailId ? { ...e, routedTo } : e)));
      markTouched(emailId);
      setActivity((prev) => [
        makeActivity({
          kind: "email",
          system: "M365",
          message: `"${email.subject}" re-routed to ${routedTo}`,
        }),
        ...prev,
      ]);
    },
    [emails, markTouched]
  );

  const issuePaymentSchedule = React.useCallback(
    (invoiceId: string) => {
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (!invoice) return;
      setSchedulesIssued((prev) => (prev.includes(invoiceId) ? prev : [...prev, invoiceId]));
      markTouched(invoiceId);
      setActivity((prev) => [
        makeActivity({
          kind: "approval",
          system: "ApprovalMax",
          message: `Payment schedule issued for ${invoice.invoiceNumber} — statutory deadline met`,
        }),
        ...prev,
      ]);
    },
    [invoices, markTouched]
  );

  const reset = React.useCallback(() => {
    setInvoices(seedInvoices);
    setApprovalSteps(seedApprovalSteps);
    setEmails(seedEmails);
    setActivity(seedActivity);
    setTouched([]);
    setSchedulesIssued([]);
    setDecisions([]);
  }, []);

  const value = React.useMemo(
    () => ({
      invoices,
      approvalSteps,
      emails,
      activity,
      touched,
      schedulesIssued,
      decisions,
      approveInvoice,
      rejectInvoice,
      undoDecision,
      advanceInvoice,
      routeEmail,
      issuePaymentSchedule,
      reset,
    }),
    [
      invoices,
      approvalSteps,
      emails,
      activity,
      touched,
      schedulesIssued,
      decisions,
      approveInvoice,
      rejectInvoice,
      undoDecision,
      advanceInvoice,
      routeEmail,
      issuePaymentSchedule,
      reset,
    ]
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState(): DemoState {
  const ctx = React.useContext(DemoStateContext);
  if (!ctx) throw new Error("useDemoState must be used inside DemoStateProvider");
  return ctx;
}

/** The approval chain for one invoice, in order. */
export function useApprovalChain(invoiceId: string): ApprovalStep[] {
  const { approvalSteps } = useDemoState();
  return approvalSteps.filter((s) => s.invoiceId === invoiceId);
}

export { PIPELINE };
