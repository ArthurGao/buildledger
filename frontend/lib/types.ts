/**
 * Domain types for the BuildLedger demo.
 *
 * Every figure in this product originates in one of five upstream systems.
 * `System` is what the source badges render, and it is the reason the demo
 * exists: showing which system a number came from is the whole selling point.
 */
export type System = "CostX" | "Xero" | "EzzyBills" | "ApprovalMax" | "M365";

export type ProjectStatus = "On track" | "At risk" | "Over budget";

export interface Project {
  /** Also the join key across systems, e.g. "RIV-01". */
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  /** From CostX. */
  budgetTotal: number;
  /** Purchase orders raised — Xero / ApprovalMax. */
  committedTotal: number;
  /** Costs incurred to date — Xero. */
  actualTotal: number;
  /** Forecast cost at completion. */
  forecastFinal: number;
  /** Margin % at tender. */
  budgetMarginPct: number;
  /** Margin % on current forecast. */
  forecastMarginPct: number;
}

export interface BudgetLine {
  projectId: string;
  /** Trade code, e.g. "05-100". */
  code: string;
  description: string;
  /** CostX. */
  budgetAmount: number;
  /** ApprovalMax / Xero PO. */
  committedAmount: number;
  /** Xero. */
  actualAmount: number;
}

export type InvoiceStatus =
  | "Captured"
  | "Coded"
  | "Pending approval"
  | "Approved"
  | "Awaiting payment"
  | "Paid";

export type InvoiceFlag = "Duplicate" | "No PO" | "Over budget";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  projectId: string;
  /** Matches BudgetLine.code. */
  lineCode: string;
  /** ISO date. */
  date: string;
  /** GST-inclusive. */
  amount: number;
  gst: number;
  status: InvoiceStatus;
  source: "Email" | "Upload";
  hasPO: boolean;
  flags?: InvoiceFlag[];
  /** Who sent it into the approval workflow — shown on the Approvals queue. */
  requestedBy?: string;
}

export interface ApprovalStep {
  invoiceId: string;
  approver: string;
  /** e.g. "Project Manager". */
  role: string;
  status: "Waiting" | "Approved" | "Rejected";
  /** ISO timestamp, present once actioned. */
  timestamp?: string;
}

export type ExceptionType = "Duplicate invoice" | "No PO spend" | "Over budget";

export interface ExceptionItem {
  id: string;
  type: ExceptionType;
  severity: "High" | "Medium";
  projectId: string;
  description: string;
  relatedInvoiceId?: string;
  amount?: number;
}

export type EmailClass = "Invoice" | "RFQ" | "Client query" | "Subbie quote" | "Noise";

export interface EmailItem {
  id: string;
  from: string;
  subject: string;
  /** ISO timestamp. */
  receivedAt: string;
  classifiedAs: EmailClass;
  /** e.g. "EzzyBills / AP", "Estimating", "PM (Sarah Chen)". */
  routedTo: string;
  /** 0-1, rendered as the classifier's confidence. */
  confidence: number;
  /** Plain-English rationale shown when the email is opened. */
  reason: string;
}

export interface IntegrationStatus {
  system: System;
  connected: boolean;
  /** Relative, e.g. "2 min ago". */
  lastSync: string;
  note?: string;
  /** What this platform reads out of the system. */
  reads: string;
}

export interface ChatQA {
  question: string;
  /** May contain light markdown and a small table. */
  answer: string;
  /** Keywords used to match a free-text question to this answer. */
  keywords: string[];
}

export type ActivityKind = "invoice" | "approval" | "email" | "sync" | "exception";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  message: string;
  /** Relative, e.g. "12 min ago". */
  at: string;
  system: System;
}

/** A budget line with its derived variance figures. */
export interface BudgetLineWithVariance extends BudgetLine {
  variance: number;
  variancePct: number;
  isOver: boolean;
}
