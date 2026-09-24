"use client";

import * as React from "react";
import {
  activity as seedActivity,
  approvalSteps as seedApprovalSteps,
  emails as seedEmails,
  invoices as seedInvoices,
} from "./mock-data";
import type { ActivityItem, ApprovalStep, EmailItem, Invoice, InvoiceStatus } from "./types";

/**
 * All "actions" in this demo — approve, reject, advance, re-route — mutate
 * this React state and nothing else. No backend, no persistence: a refresh
 * puts the demo back to its opening position, which is what you want when
 * showing it to a room.
 */

const PIPELINE: InvoiceStatus[] = [
  "Captured",
  "Coded",
  "Pending approval",
  "Approved",
  "Awaiting payment",
  "Paid",
];

interface DemoState {
  invoices: Invoice[];
  approvalSteps: ApprovalStep[];
  emails: EmailItem[];
  activity: ActivityItem[];
  /** Ids touched this session — used to highlight what the viewer just did. */
  touched: string[];
  /** Invoices a payment schedule has been issued against, meeting the deadline. */
  schedulesIssued: string[];
  approveInvoice: (invoiceId: string) => void;
  rejectInvoice: (invoiceId: string) => void;
  advanceInvoice: (invoiceId: string) => void;
  routeEmail: (emailId: string, routedTo: string) => void;
  issuePaymentSchedule: (invoiceId: string) => void;
  reset: () => void;
}

const DemoStateContext = React.createContext<DemoState | null>(null);

function nextStatus(status: InvoiceStatus): InvoiceStatus {
  const i = PIPELINE.indexOf(status);
  return i >= 0 && i < PIPELINE.length - 1 ? PIPELINE[i + 1] : status;
}

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

  const markTouched = React.useCallback((id: string) => {
    setTouched((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const approveInvoice = React.useCallback(
    (invoiceId: string) => {
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (!invoice) return;

      // Stamp the next waiting approver in this invoice's chain.
      let approvedBy: string | undefined;
      let stillWaiting = false;
      setApprovalSteps((prev) => {
        let stamped = false;
        const next = prev.map((s) => {
          if (s.invoiceId !== invoiceId) return s;
          if (!stamped && s.status === "Waiting") {
            stamped = true;
            approvedBy = s.approver;
            return { ...s, status: "Approved" as const, timestamp: new Date().toISOString() };
          }
          return s;
        });
        stillWaiting = next.some((s) => s.invoiceId === invoiceId && s.status === "Waiting");
        return next;
      });

      // The invoice only moves on once every approver in the chain has signed.
      if (!stillWaiting) {
        setInvoices((prev) =>
          prev.map((i) => (i.id === invoiceId ? { ...i, status: nextStatus(i.status) } : i))
        );
      }

      markTouched(invoiceId);
      setActivity((prev) => [
        makeActivity({
          kind: "approval",
          system: "ApprovalMax",
          message: `${invoice.invoiceNumber} approved${approvedBy ? ` by ${approvedBy}` : ""}`,
        }),
        ...prev,
      ]);
    },
    [invoices, markTouched]
  );

  const rejectInvoice = React.useCallback(
    (invoiceId: string) => {
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (!invoice) return;

      setApprovalSteps((prev) => {
        let stamped = false;
        return prev.map((s) => {
          if (s.invoiceId !== invoiceId) return s;
          if (!stamped && s.status === "Waiting") {
            stamped = true;
            return { ...s, status: "Rejected" as const, timestamp: new Date().toISOString() };
          }
          return s;
        });
      });

      // A rejected invoice drops back to coding rather than leaving the pipeline.
      setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status: "Coded" } : i)));

      markTouched(invoiceId);
      setActivity((prev) => [
        makeActivity({
          kind: "approval",
          system: "ApprovalMax",
          message: `${invoice.invoiceNumber} rejected — returned for re-coding`,
        }),
        ...prev,
      ]);
    },
    [invoices, markTouched]
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
  }, []);

  const value = React.useMemo(
    () => ({
      invoices,
      approvalSteps,
      emails,
      activity,
      touched,
      schedulesIssued,
      approveInvoice,
      rejectInvoice,
      advanceInvoice,
      routeEmail,
      issuePaymentSchedule,
      reset,
    }),
    [invoices, approvalSteps, emails, activity, touched, schedulesIssued, approveInvoice, rejectInvoice, advanceInvoice, routeEmail, issuePaymentSchedule, reset]
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
