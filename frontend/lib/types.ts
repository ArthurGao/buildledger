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

export type ExceptionType =
  | "Duplicate invoice"
  | "No PO spend"
  | "Over budget"
  | "Payment schedule overdue"
  | "Variation notice overdue"
  | "Retention shortfall";

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

// ---------------------------------------------------------------------------
// Contracts, statutory clocks, variations, claims and retentions
//
// Everything below exists because of the New Zealand statutory regime: the
// Construction Contracts Act 2002 payment rules, the 2023 retention money
// amendment, and the variation procedure in NZS 3910:2023.
// ---------------------------------------------------------------------------

/**
 * A contract. Every statutory clock and every retention calculation reads its
 * parameters from here — they differ contract by contract, so none of this can
 * be a global setting.
 */
export interface Contract {
  id: string;
  projectId: string;
  /** Head contract with the principal, or a subcontract we let. */
  side: "Principal" | "Subcontractor";
  counterparty: string;
  value: number;
  /** Working days to respond to a payment claim. The Act's default is 20. */
  paymentScheduleWorkingDays: number;
  /** Working days until payment falls due. */
  paymentDueWorkingDays: number;
  retentionPct: number;
  /** Retention is capped at this share of the contract value. */
  retentionCapPct: number;
  /** Share released at practical completion; the rest at defects liability end. */
  retentionReleaseAtPCPct: number;
  defectsLiabilityMonths: number;
}

/**
 * Whose obligation the deadline is.
 *
 * A missed "Payment due" is not our failure — it means the other side did not
 * pay, which gives us a right to recover. Counting it alongside our own missed
 * obligations would overstate the risk and understate the entitlement.
 */
export type ClockExposure = "Ours" | "Theirs";

export type ClockKind =
  /** We received a payment claim and must issue a payment schedule. */
  | "Payment schedule due"
  /** We served a payment claim and payment falls due. */
  | "Payment due"
  /** We received an instruction and must notify a variation. */
  | "Variation notice due";

/**
 * A statutory deadline. The three kinds share one mechanism: working-day
 * calendar, countdown, escalation, audit trail.
 *
 * `dueOn` is a computed aid, never an authoritative determination — the screen
 * always shows the contract clause it came from so a person can check it.
 */
export interface StatutoryClock {
  id: string;
  kind: ClockKind;
  /** The document or event that started the clock. */
  sourceId: string;
  sourceLabel: string;
  projectId: string;
  contractId: string;
  /** Trigger date, stored as a plain calendar date. */
  triggeredOn: string;
  workingDays: number;
  /** What happens if the deadline passes. Shown on screen, not buried. */
  consequence: string;
  /** Set once the obligation has been met. */
  satisfiedOn?: string;
}

export type VariationStatus = "Identified" | "Notified" | "Priced" | "Approved" | "Rejected";

/**
 * A variation. Cost and time are separate determinations under NZS 3910:2023,
 * so they are tracked separately and either may still be open.
 */
export interface Variation {
  id: string;
  projectId: string;
  costCode: string;
  description: string;
  /** Where it was first spotted — usually an unstructured message. */
  origin: "Email" | "Meeting" | "Site instruction" | "Chat";
  originRef?: string;
  /** The date of the instruction, which starts the notification clock. */
  instructedOn: string;
  status: VariationStatus;
  costImpact: number | null;
  timeImpactDays: number | null;
  /** Whether the approved amount has been written back to the budget baseline. */
  writtenBackToBudget: boolean;
  /** Set when the AI drafted this from a message rather than a person raising it. */
  draftedByAi?: boolean;
}

export type ClaimStatus = "Draft" | "Served" | "Scheduled" | "Paid" | "Disputed";

export interface ProgressClaimLine {
  costCode: string;
  description: string;
  /** From the CostX schedule of values — the same data as BudgetLine. */
  contractValue: number;
  /** Certified by a person, not computed by the system. */
  percentComplete: number;
  previouslyClaimed: number;
  thisClaim: number;
}

export interface ProgressClaim {
  id: string;
  projectId: string;
  contractId: string;
  claimNumber: number;
  periodEnd: string;
  servedOn: string | null;
  lines: ProgressClaimLine[];
  grossClaimed: number;
  retentionWithheld: number;
  netClaimed: number;
  status: ClaimStatus;
  /** Set when the other side responded with a payment schedule. */
  scheduledAmount?: number;
}

/** One movement in the retention ledger — money withheld, or later released. */
export interface RetentionEntry {
  id: string;
  contractId: string;
  projectId: string;
  /** The claim the retention was withheld from. */
  claimRef: string;
  withheldOn: string;
  amount: number;
  releasedOn: string | null;
  releaseTrigger: "Practical completion" | "Defects liability period" | null;
}

/** The trust account the retention money is required to sit in. */
export interface TrustAccount {
  bank: string;
  accountName: string;
  accountNumber: string;
  balance: number;
  lastReconciled: string;
  /** Whether the bank has been told the account holds retention money on trust. */
  bankNotified: boolean;
}

export type PurchaseRequestStatus = "Draft" | "Pending approval" | "Approved" | "PO raised";

/** Output of the execution hub, input to the payables stack. */
export interface PurchaseRequest {
  id: string;
  projectId: string;
  costCode: string;
  supplier: string;
  amount: number;
  requestedBy: string;
  requestedOn: string;
  status: PurchaseRequestStatus;
  poNumber: string | null;
}

export type OpportunityStatus =
  | "Lead"
  | "Opportunity"
  | "Bid"
  | "No bid"
  | "Submitted"
  | "Won"
  | "Lost";

/** A tender opportunity, usually extracted from an unstructured message. */
export interface Opportunity {
  id: string;
  principal: string;
  name: string;
  location: string;
  estimatedValue: number | null;
  closesOn: string | null;
  extractedFrom: "Email" | "Meeting minutes" | "Chat";
  /** The message it came from, so the extraction can be checked. */
  sourceRef?: string;
  confidence: number;
  /** Nothing enters the pipeline until a person confirms the extracted fields. */
  confirmed: boolean;
  status: OpportunityStatus;
}

/** The key that joins the two black boxes. */
export interface CostCodeMapping {
  costCode: string;
  description: string;
  xeroAccountCode?: string;
  xeroTrackingOption?: string;
}
