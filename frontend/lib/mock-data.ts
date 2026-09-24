import type {
  ActivityItem,
  ApprovalStep,
  BudgetLine,
  ChatQA,
  Contract,
  CostCodeMapping,
  EmailItem,
  ExceptionItem,
  IntegrationStatus,
  Invoice,
  Opportunity,
  ProgressClaim,
  Project,
  PurchaseRequest,
  RetentionEntry,
  StatutoryClock,
  TrustAccount,
  Variation,
} from "./types";

/**
 * All demo data lives here. Nothing in this app talks to a live system.
 *
 * The narrative the data has to tell, at a glance:
 *   Riverside Office Fitout is tracking 6% over budget, driven by
 *   Electrical (+$11,300) and Structural steel (+$5,500).
 * Budget lines for each project sum exactly to that project's totals, so a
 * quantity surveyor adding up the reconciliation table finds it balances.
 */

export const GST_RATE = 0.15;

/** Invoice amounts are GST-inclusive; back out the GST component. */
function gstOf(inclusiveAmount: number): number {
  return Math.round(inclusiveAmount * (GST_RATE / (1 + GST_RATE)) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  {
    id: "RIV-01",
    name: "Riverside Office Fitout",
    client: "Meridian Property Group",
    status: "Over budget",
    budgetTotal: 742_000,
    committedTotal: 698_000,
    actualTotal: 610_000,
    forecastFinal: 786_000,
    budgetMarginPct: 12.0,
    forecastMarginPct: 6.4,
  },
  {
    id: "KAU-02",
    name: "Kauri Apartments Stage 2",
    client: "Kauri Living Ltd",
    status: "On track",
    budgetTotal: 3_150_000,
    committedTotal: 2_240_000,
    actualTotal: 1_980_000,
    forecastFinal: 3_120_000,
    budgetMarginPct: 9.5,
    forecastMarginPct: 10.1,
  },
  {
    id: "HOB-03",
    name: "Hobsonville Warehouse",
    client: "Southgate Logistics",
    status: "At risk",
    budgetTotal: 1_880_000,
    committedTotal: 1_510_000,
    actualTotal: 1_340_000,
    forecastFinal: 1_932_000,
    budgetMarginPct: 11.0,
    forecastMarginPct: 8.7,
  },
  {
    id: "NEW-04",
    name: "Newmarket Retail Refit",
    client: "Vantage Retail",
    status: "On track",
    budgetTotal: 465_000,
    committedTotal: 290_000,
    actualTotal: 205_000,
    forecastFinal: 458_000,
    budgetMarginPct: 14.0,
    forecastMarginPct: 14.6,
  },
];

// ---------------------------------------------------------------------------
// Budget lines — CostX budget vs Xero actual, line by line
// ---------------------------------------------------------------------------

const riversideLines: BudgetLine[] = [
  { code: "01-100", description: "Preliminaries & site", budgetAmount: 95_000, committedAmount: 92_000, actualAmount: 88_000 },
  { code: "02-100", description: "Demolition & strip-out", budgetAmount: 34_000, committedAmount: 33_500, actualAmount: 33_200 },
  { code: "03-100", description: "Concrete floor slab", budgetAmount: 17_000, committedAmount: 17_000, actualAmount: 17_400 },
  { code: "03-200", description: "Reinforcement steel", budgetAmount: 4_800, committedAmount: 5_000, actualAmount: 5_200 },
  { code: "04-100", description: "Blockwork", budgetAmount: 16_800, committedAmount: 16_000, actualAmount: 15_900 },
  { code: "05-100", description: "Structural steel", budgetAmount: 36_000, committedAmount: 40_000, actualAmount: 41_500 },
  { code: "06-100", description: "Carpentry & joinery", budgetAmount: 52_000, committedAmount: 51_000, actualAmount: 49_000 },
  { code: "07-100", description: "Insulation & fire-stopping", budgetAmount: 18_400, committedAmount: 17_000, actualAmount: 12_600 },
  { code: "08-100", description: "Windows & glazing", budgetAmount: 44_000, committedAmount: 43_500, actualAmount: 38_200 },
  { code: "09-100", description: "Plasterboard & painting", budgetAmount: 39_000, committedAmount: 38_000, actualAmount: 31_500 },
  { code: "10-100", description: "Partitions & ceilings", budgetAmount: 47_000, committedAmount: 44_000, actualAmount: 31_000 },
  { code: "12-100", description: "Floor coverings", budgetAmount: 41_000, committedAmount: 26_000, actualAmount: 9_800 },
  { code: "15-100", description: "Mechanical / HVAC", budgetAmount: 88_000, committedAmount: 84_000, actualAmount: 79_300 },
  { code: "15-200", description: "Plumbing", budgetAmount: 28_000, committedAmount: 27_000, actualAmount: 27_600 },
  { code: "16-100", description: "Electrical", budgetAmount: 61_000, committedAmount: 70_000, actualAmount: 72_300 },
  { code: "17-100", description: "Fit-out & fixtures", budgetAmount: 71_000, committedAmount: 68_000, actualAmount: 45_000 },
  { code: "26-100", description: "Data & security cabling", budgetAmount: 25_000, committedAmount: 12_000, actualAmount: 4_200 },
  { code: "31-100", description: "External works & landscaping", budgetAmount: 24_000, committedAmount: 14_000, actualAmount: 8_300 },
].map((l) => ({ ...l, projectId: "RIV-01" }));

const kauriLines: BudgetLine[] = [
  { code: "01-100", description: "Preliminaries & site establishment", budgetAmount: 320_000, committedAmount: 300_000, actualAmount: 288_000 },
  { code: "02-200", description: "Earthworks & piling", budgetAmount: 410_000, committedAmount: 405_000, actualAmount: 402_000 },
  { code: "03-100", description: "Concrete structure", budgetAmount: 680_000, committedAmount: 620_000, actualAmount: 585_000 },
  { code: "04-100", description: "Precast panels & blockwork", budgetAmount: 395_000, committedAmount: 330_000, actualAmount: 300_000 },
  { code: "06-100", description: "Carpentry & joinery", budgetAmount: 288_000, committedAmount: 190_000, actualAmount: 142_000 },
  { code: "08-100", description: "Windows & glazing", budgetAmount: 310_000, committedAmount: 205_000, actualAmount: 118_000 },
  { code: "15-100", description: "Mechanical & plumbing", budgetAmount: 402_000, committedAmount: 120_000, actualAmount: 95_000 },
  { code: "16-100", description: "Electrical", budgetAmount: 345_000, committedAmount: 70_000, actualAmount: 50_000 },
].map((l) => ({ ...l, projectId: "KAU-02" }));

const hobsonvilleLines: BudgetLine[] = [
  { code: "01-100", description: "Preliminaries & site", budgetAmount: 180_000, committedAmount: 178_000, actualAmount: 175_000 },
  { code: "02-200", description: "Earthworks & hardstand", budgetAmount: 245_000, committedAmount: 244_000, actualAmount: 243_000 },
  { code: "03-100", description: "Concrete slab & footings", budgetAmount: 324_000, committedAmount: 328_000, actualAmount: 326_500 },
  { code: "05-100", description: "Structural steel & portal frames", budgetAmount: 520_000, committedAmount: 515_000, actualAmount: 523_400 },
  { code: "07-200", description: "Roofing & cladding", budgetAmount: 295_000, committedAmount: 180_000, actualAmount: 62_000 },
  { code: "15-200", description: "Plumbing & drainage", budgetAmount: 96_000, committedAmount: 35_000, actualAmount: 8_600 },
  { code: "16-100", description: "Electrical", budgetAmount: 134_000, committedAmount: 24_000, actualAmount: 1_500 },
  { code: "31-100", description: "External works & yard", budgetAmount: 86_000, committedAmount: 6_000, actualAmount: 0 },
].map((l) => ({ ...l, projectId: "HOB-03" }));

const newmarketLines: BudgetLine[] = [
  { code: "01-100", description: "Preliminaries", budgetAmount: 42_000, committedAmount: 41_000, actualAmount: 40_000 },
  { code: "02-100", description: "Strip-out & demolition", budgetAmount: 38_000, committedAmount: 37_500, actualAmount: 37_200 },
  { code: "06-100", description: "Shopfittings & joinery", budgetAmount: 145_000, committedAmount: 92_000, actualAmount: 58_000 },
  { code: "09-100", description: "Plasterboard & painting", budgetAmount: 61_000, committedAmount: 40_000, actualAmount: 29_300 },
  { code: "12-100", description: "Floor coverings", budgetAmount: 54_000, committedAmount: 22_000, actualAmount: 11_500 },
  { code: "15-100", description: "Mechanical / HVAC", budgetAmount: 37_000, committedAmount: 16_500, actualAmount: 5_000 },
  { code: "16-100", description: "Electrical & lighting", budgetAmount: 88_000, committedAmount: 41_000, actualAmount: 24_000 },
].map((l) => ({ ...l, projectId: "NEW-04" }));

export const budgetLines: BudgetLine[] = [
  ...riversideLines,
  ...kauriLines,
  ...hobsonvilleLines,
  ...newmarketLines,
];

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

const invoiceSeed: Omit<Invoice, "gst">[] = [
  {
    id: "INV-001",
    invoiceNumber: "VLX-4471",
    supplier: "Voltix Electrical",
    projectId: "RIV-01",
    lineCode: "16-100",
    date: "2026-09-12",
    amount: 12_400,
    status: "Pending approval",
    source: "Email",
    hasPO: false,
    flags: ["No PO"],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-002",
    invoiceNumber: "NST-8890",
    supplier: "Northern Steel Supplies",
    projectId: "RIV-01",
    lineCode: "05-100",
    date: "2026-09-10",
    amount: 8_900,
    status: "Approved",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-003",
    invoiceNumber: "PAC-2231",
    supplier: "Pacific Concrete Ltd",
    projectId: "RIV-01",
    lineCode: "03-100",
    date: "2026-09-08",
    amount: 6_200,
    status: "Awaiting payment",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-004",
    invoiceNumber: "PAC-2231",
    supplier: "Pacific Concrete Ltd",
    projectId: "RIV-01",
    lineCode: "03-100",
    date: "2026-09-09",
    amount: 6_200,
    status: "Pending approval",
    source: "Email",
    hasPO: true,
    flags: ["Duplicate"],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-005",
    invoiceNumber: "TMB-1180",
    supplier: "TimberYard Co",
    projectId: "KAU-02",
    lineCode: "06-100",
    date: "2026-09-11",
    amount: 22_300,
    status: "Paid",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-006",
    invoiceNumber: "PLR-5567",
    supplier: "PlumbRight Ltd",
    projectId: "HOB-03",
    lineCode: "15-200",
    date: "2026-09-13",
    amount: 4_750,
    status: "Coded",
    source: "Upload",
    hasPO: true,
    flags: [],
    requestedBy: "Tom Baker",
  },
  {
    id: "INV-007",
    invoiceNumber: "GLZ-3020",
    supplier: "ClearView Glazing",
    projectId: "RIV-01",
    lineCode: "08-100",
    date: "2026-09-07",
    amount: 15_800,
    status: "Paid",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-008",
    invoiceNumber: "STL-7741",
    supplier: "Southern Steelworks",
    projectId: "HOB-03",
    lineCode: "05-100",
    date: "2026-09-15",
    amount: 18_600,
    status: "Captured",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-009",
    invoiceNumber: "ECO-9012",
    supplier: "EcoPaint Co",
    projectId: "NEW-04",
    lineCode: "09-100",
    date: "2026-09-14",
    amount: 3_280,
    status: "Captured",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-010",
    invoiceNumber: "PCS-4408",
    supplier: "Precast Solutions NZ",
    projectId: "KAU-02",
    lineCode: "04-100",
    date: "2026-09-05",
    amount: 46_500,
    status: "Paid",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-011",
    invoiceNumber: "HVC-3318",
    supplier: "AirStream Mechanical",
    projectId: "RIV-01",
    lineCode: "15-100",
    date: "2026-09-06",
    amount: 21_900,
    status: "Awaiting payment",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-012",
    invoiceNumber: "JNR-6650",
    supplier: "Woodgrain Joinery",
    projectId: "NEW-04",
    lineCode: "06-100",
    date: "2026-09-16",
    amount: 11_750,
    status: "Pending approval",
    source: "Upload",
    hasPO: true,
    flags: [],
    requestedBy: "Tom Baker",
  },
  {
    id: "INV-013",
    invoiceNumber: "EXC-1102",
    supplier: "Groundline Civil",
    projectId: "HOB-03",
    lineCode: "02-200",
    date: "2026-09-03",
    amount: 33_400,
    status: "Paid",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
  {
    id: "INV-014",
    invoiceNumber: "LGT-4490",
    supplier: "Lumina Lighting",
    projectId: "NEW-04",
    lineCode: "16-100",
    date: "2026-09-17",
    amount: 6_420,
    status: "Coded",
    source: "Email",
    hasPO: true,
    flags: [],
    requestedBy: "AP Automation",
  },
];

export const invoices: Invoice[] = invoiceSeed.map((i) => ({ ...i, gst: gstOf(i.amount) }));

// ---------------------------------------------------------------------------
// Approval chains
// ---------------------------------------------------------------------------

export const approvalSteps: ApprovalStep[] = [
  { invoiceId: "INV-001", approver: "Sarah Chen", role: "Project Manager", status: "Waiting" },
  { invoiceId: "INV-001", approver: "David Whitfield", role: "Commercial Manager", status: "Waiting" },

  { invoiceId: "INV-002", approver: "Sarah Chen", role: "Project Manager", status: "Approved", timestamp: "2026-09-10T14:22:00+12:00" },
  { invoiceId: "INV-002", approver: "David Whitfield", role: "Commercial Manager", status: "Approved", timestamp: "2026-09-11T09:05:00+12:00" },

  { invoiceId: "INV-003", approver: "Sarah Chen", role: "Project Manager", status: "Approved", timestamp: "2026-09-08T16:40:00+12:00" },

  { invoiceId: "INV-004", approver: "Sarah Chen", role: "Project Manager", status: "Waiting" },

  { invoiceId: "INV-005", approver: "Tom Baker", role: "Site Manager", status: "Approved", timestamp: "2026-09-11T11:12:00+12:00" },
  { invoiceId: "INV-005", approver: "Priya Raman", role: "Finance Manager", status: "Approved", timestamp: "2026-09-11T15:48:00+12:00" },

  { invoiceId: "INV-007", approver: "Sarah Chen", role: "Project Manager", status: "Approved", timestamp: "2026-09-07T10:31:00+12:00" },
  { invoiceId: "INV-007", approver: "David Whitfield", role: "Commercial Manager", status: "Approved", timestamp: "2026-09-07T13:02:00+12:00" },

  { invoiceId: "INV-010", approver: "Priya Raman", role: "Finance Manager", status: "Approved", timestamp: "2026-09-05T09:20:00+12:00" },

  { invoiceId: "INV-011", approver: "Sarah Chen", role: "Project Manager", status: "Approved", timestamp: "2026-09-06T08:55:00+12:00" },
  { invoiceId: "INV-011", approver: "David Whitfield", role: "Commercial Manager", status: "Approved", timestamp: "2026-09-06T16:10:00+12:00" },

  { invoiceId: "INV-012", approver: "Tom Baker", role: "Site Manager", status: "Waiting" },

  { invoiceId: "INV-013", approver: "Priya Raman", role: "Finance Manager", status: "Approved", timestamp: "2026-09-03T14:05:00+12:00" },
];

// ---------------------------------------------------------------------------
// Exceptions
// ---------------------------------------------------------------------------

export const exceptions: ExceptionItem[] = [
  {
    id: "EXC-01",
    type: "Duplicate invoice",
    severity: "High",
    projectId: "RIV-01",
    description: "PAC-2231 from Pacific Concrete appears twice, dated 8 and 9 Sep.",
    relatedInvoiceId: "INV-004",
    amount: 6_200,
  },
  {
    id: "EXC-02",
    type: "Over budget",
    severity: "High",
    projectId: "RIV-01",
    description: "Electrical (16-100) is $11,300 over budget — $72,300 actual against $61,000.",
    amount: 11_300,
  },
  {
    // High: this is the largest single exception by value and it sits on the
    // electrical line that is already the biggest overrun on the job.
    id: "EXC-03",
    type: "No PO spend",
    severity: "High",
    projectId: "RIV-01",
    description: "Voltix Electrical invoice received with no matching purchase order.",
    relatedInvoiceId: "INV-001",
    amount: 12_400,
  },
  {
    id: "EXC-04",
    type: "Over budget",
    severity: "Medium",
    projectId: "HOB-03",
    description: "Structural steel (05-100) is trending over — $523,400 actual against $520,000.",
    amount: 3_400,
  },
];

// ---------------------------------------------------------------------------
// Inbox — auto-classified and routed mail
// ---------------------------------------------------------------------------

export const emails: EmailItem[] = [
  {
    id: "EM-01",
    from: "accounts@voltix.co.nz",
    subject: "Invoice #4471 — Riverside electrical",
    receivedAt: "2026-09-12T08:14:00+12:00",
    classifiedAs: "Invoice",
    routedTo: "EzzyBills / AP",
    confidence: 0.98,
    reason:
      "A PDF attachment with an invoice number, GST total and a known supplier in the Xero contact list. Sent to EzzyBills for extraction, then into the AP workflow.",
  },
  {
    id: "EM-02",
    from: "tenders@newmarket-dev.com",
    subject: "RFQ: Newmarket retail refit — electrical package",
    receivedAt: "2026-09-11T16:42:00+12:00",
    classifiedAs: "RFQ",
    routedTo: "Estimating",
    confidence: 0.94,
    reason:
      "Request-for-quote language with a drawing set attached and a closing date. Routed to the estimating team so it can be priced in CostX.",
  },
  {
    id: "EM-03",
    from: "j.kauri@kauriliving.co.nz",
    subject: "Re: variation request — Kauri Apartments L3",
    receivedAt: "2026-09-11T11:05:00+12:00",
    classifiedAs: "Client query",
    routedTo: "PM (Sarah Chen)",
    confidence: 0.91,
    reason:
      "Sender matches the client contact on KAU-02 and the thread references a variation. Routed to the project manager for that job.",
  },
  {
    id: "EM-04",
    from: "sales@blocklayers.nz",
    subject: "Quote for blockwork — Hobsonville warehouse",
    receivedAt: "2026-09-10T09:28:00+12:00",
    classifiedAs: "Subbie quote",
    routedTo: "Estimating",
    confidence: 0.89,
    reason:
      "Priced schedule from a subcontractor, no invoice number or payment terms. Filed against HOB-03 for the estimator to compare.",
  },
  {
    id: "EM-05",
    from: "info@buildexpo2026.com",
    subject: "Last chance: BuildExpo early-bird tickets",
    receivedAt: "2026-09-09T06:03:00+12:00",
    classifiedAs: "Noise",
    routedTo: "Ignored",
    confidence: 0.99,
    reason: "Bulk marketing mail with an unsubscribe footer and no project reference. No action taken.",
  },
  {
    id: "EM-06",
    from: "accounts@northsteel.co.nz",
    subject: "Statement + invoice NST-8890",
    receivedAt: "2026-09-10T13:51:00+12:00",
    classifiedAs: "Invoice",
    routedTo: "EzzyBills / AP",
    confidence: 0.97,
    reason:
      "Two attachments — a statement and an invoice. The invoice was extracted and matched to the open purchase order on RIV-01 structural steel.",
  },
];

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export const integrations: IntegrationStatus[] = [
  {
    system: "Xero",
    connected: true,
    lastSync: "2 min ago",
    reads: "Actual costs, purchase orders, supplier bills, payment status",
  },
  {
    system: "CostX",
    connected: true,
    lastSync: "15 min ago",
    note: "OData API",
    reads: "Tender budgets by trade code, quantities, margin baseline",
  },
  {
    system: "EzzyBills",
    connected: true,
    lastSync: "1 min ago",
    reads: "Captured invoice fields — supplier, amount, GST, line coding",
  },
  {
    system: "ApprovalMax",
    connected: true,
    lastSync: "3 min ago",
    reads: "Approval chains, approver decisions and timestamps",
  },
  {
    system: "M365",
    connected: true,
    lastSync: "live",
    reads: "Incoming mail for classification and routing",
  },
];

// ---------------------------------------------------------------------------
// Recent activity (dashboard)
// ---------------------------------------------------------------------------

export const activity: ActivityItem[] = [
  { id: "ACT-01", kind: "exception", message: "Duplicate invoice flagged — PAC-2231, Riverside", at: "12 min ago", system: "EzzyBills" },
  { id: "ACT-02", kind: "email", message: "Invoice from Voltix Electrical routed to AP", at: "31 min ago", system: "M365" },
  { id: "ACT-03", kind: "approval", message: "NST-8890 approved by David Whitfield", at: "1 hr ago", system: "ApprovalMax" },
  { id: "ACT-04", kind: "sync", message: "CostX budgets re-synced for 4 projects", at: "2 hrs ago", system: "CostX" },
  { id: "ACT-05", kind: "invoice", message: "GLZ-3020 marked paid in Xero", at: "4 hrs ago", system: "Xero" },
  { id: "ACT-06", kind: "email", message: "RFQ for Newmarket electrical routed to estimating", at: "6 hrs ago", system: "M365" },
];

// ---------------------------------------------------------------------------
// Assistant — canned Q&A (read-only)
// ---------------------------------------------------------------------------

export const suggestedQuestions: string[] = [
  "Which projects are over budget?",
  "Why is Riverside over budget?",
  "What statutory deadlines are at risk?",
  "Are we holding enough retention money on trust?",
  "Any duplicate invoices this month?",
  "What spend has no PO?",
  "Which variations are not in the budget yet?",
  "Show me margin across all projects.",
];

export const chatQA: ChatQA[] = [
  {
    question: "Which projects are over budget?",
    keywords: ["over budget", "which project", "overrun", "losing money", "over"],
    answer:
      "**Riverside Office Fitout** is tracking **6% over** — forecast final $786,000 against a $742,000 budget. The overrun is driven by **Electrical (+$11,300)** and **Structural steel (+$5,500)**.\n\n**Hobsonville Warehouse** is *at risk* — forecast margin has slipped to 8.7% from 11.0%.\n\nKauri Apartments Stage 2 and Newmarket Retail Refit are both on track.",
  },
  {
    question: "Why is Riverside over budget?",
    keywords: ["why", "riverside", "driving", "cause", "reason"],
    answer:
      "Two trades account for most of it:\n\n- **Electrical (16-100)** — $72,300 actual against $61,000 budget, **+$11,300**\n- **Structural steel (05-100)** — $41,500 against $36,000, **+$5,500**\n\nA **$12,400 Voltix Electrical invoice with no matching PO** is still pending approval and would push electrical further over if released.",
  },
  {
    question: "What's committed vs budget on Kauri Apartments Stage 2?",
    keywords: ["committed", "kauri", "stage 2", "commitment"],
    answer:
      "Kauri Apartments Stage 2 — Budget **$3.15M** · Committed **$2.24M** · Actual **$1.98M**.\n\nForecast final is $3.12M, so the job is **on track** with a forecast margin of 10.1% — slightly above the 9.5% tender baseline.",
  },
  {
    question: "Any duplicate invoices this month?",
    keywords: ["duplicate", "twice", "double", "same invoice"],
    answer:
      "Yes — **Pacific Concrete PAC-2231** ($6,200, Riverside) appears twice, dated 8 and 9 Sep.\n\nThe 8 Sep copy is already *awaiting payment*; the 9 Sep duplicate is flagged and held before approval.",
  },
  {
    question: "What spend has no PO?",
    keywords: ["no po", "without po", "purchase order", "unmatched"],
    answer:
      "One item: **Voltix Electrical VLX-4471**, $12,400 on Riverside (Electrical, 16-100). Received by email, no matching purchase order in Xero.\n\nIt is flagged and sitting in pending approval.",
  },
  {
    question: "Show me margin across all projects.",
    keywords: ["margin", "all projects", "profitability", "gross margin"],
    answer:
      "| Project | Tender | Forecast |\n| --- | --- | --- |\n| Riverside Office Fitout | 12.0% | **6.4%** |\n| Kauri Apartments Stage 2 | 9.5% | 10.1% |\n| Hobsonville Warehouse | 11.0% | **8.7%** |\n| Newmarket Retail Refit | 14.0% | 14.6% |\n\nTwo jobs are eroding: **Riverside** and **Hobsonville**.",
  },
];

const statutoryQA: ChatQA[] = [
  {
    question: "What statutory deadlines are at risk?",
    keywords: ["deadline", "statutory", "at risk", "overdue", "working day", "clock", "due"],
    answer:
      "One deadline has already been missed and one is about to be.\n\n- **Missed** — no payment schedule was issued for **Voltix VLX-4471** ($12,400, Riverside). The 20 working days ran out on 10 Sep, six working days ago. The full claimed amount is now recoverable as a debt.\n- **One working day left** — the switchboard upgrade instructed by Meridian on 24 Aug has not been notified as a variation. Miss it and the right to claim is lost.\n\nSeparately, **Southgate Logistics** has left claim 5 on Hobsonville unanswered for 14 working days. That one is in our favour — the amount is recoverable as a debt or can go to adjudication.",
  },
  {
    question: "Are we holding enough retention money on trust?",
    keywords: ["retention", "trust", "held on trust", "shortfall", "trust account"],
    answer:
      "No. The retention ledger shows **$40,200** held across 5 subcontracts, but the trust account holds **$34,600** — a shortfall of **$5,600**.\n\nUnder the Construction Contracts (Retention Money) Amendment Act 2023 retention money must sit in a compliant trust account from the moment it is withheld. Holding less than the ledger is an offence: up to $200,000, and up to $50,000 for each director.\n\nThe next quarterly report to all 5 subcontractors is due 30 Sep.",
  },
  {
    question: "Which variations are not in the budget yet?",
    keywords: ["variation", "not in the budget", "written back", "baseline", "change"],
    answer:
      "One approved variation has not been written back to the budget baseline:\n\n- **09-100 Plasterboard & painting**, Riverside — additional acoustic lining, **$6,800** approved.\n\nUntil it is written back, the reconciliation table measures that trade against the original budget, so it can read as an overrun when it is not.\n\nTwo further variations are still unpriced: the Riverside switchboard upgrade and the Hobsonville roof panel spec change.",
  },
];

export const assistantFallback =
  "This is a demo — try one of the suggested questions above.";

/** The statutory answers live with the rest so matching sees one list. */
chatQA.push(...statutoryQA);

// ---------------------------------------------------------------------------
// Contracts
//
// Head contract values are derived from the tender margin: a project budgeted
// at cost C with margin m was won at C / (1 - m).
// ---------------------------------------------------------------------------

export const contracts: Contract[] = [
  {
    id: "HC-RIV-01",
    projectId: "RIV-01",
    side: "Principal",
    counterparty: "Meridian Property Group",
    value: 843_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 12,
  },
  {
    id: "HC-KAU-02",
    projectId: "KAU-02",
    side: "Principal",
    counterparty: "Kauri Living Ltd",
    value: 3_481_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 12,
  },
  {
    id: "HC-HOB-03",
    projectId: "HOB-03",
    side: "Principal",
    counterparty: "Southgate Logistics",
    value: 2_112_000,
    paymentScheduleWorkingDays: 15,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 6,
  },
  {
    id: "HC-NEW-04",
    projectId: "NEW-04",
    side: "Principal",
    counterparty: "Vantage Retail",
    value: 541_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 5,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 100,
    defectsLiabilityMonths: 12,
  },

  // Subcontracts we let. These are the ones that create a retention trust
  // obligation, and the ones whose payment claims start a 20-day clock on us.
  {
    id: "SC-RIV-VLX",
    projectId: "RIV-01",
    side: "Subcontractor",
    counterparty: "Voltix Electrical",
    value: 70_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 12,
  },
  {
    id: "SC-RIV-NST",
    projectId: "RIV-01",
    side: "Subcontractor",
    counterparty: "Northern Steel Supplies",
    value: 40_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 12,
  },
  {
    id: "SC-RIV-AIR",
    projectId: "RIV-01",
    side: "Subcontractor",
    counterparty: "AirStream Mechanical",
    value: 84_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 12,
  },
  {
    id: "SC-KAU-TMB",
    projectId: "KAU-02",
    side: "Subcontractor",
    counterparty: "TimberYard Co",
    value: 190_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 12,
  },
  {
    id: "SC-HOB-STL",
    projectId: "HOB-03",
    side: "Subcontractor",
    counterparty: "Southern Steelworks",
    value: 515_000,
    paymentScheduleWorkingDays: 20,
    paymentDueWorkingDays: 20,
    retentionPct: 10,
    retentionCapPct: 5,
    retentionReleaseAtPCPct: 50,
    defectsLiabilityMonths: 12,
  },
];

// ---------------------------------------------------------------------------
// cost code mapping — the key that joins CostX to Xero
// ---------------------------------------------------------------------------

export const costCodeMappings: CostCodeMapping[] = [
  { costCode: "01-100", description: "Preliminaries & site", xeroAccountCode: "310", xeroTrackingOption: "Preliminaries" },
  { costCode: "02-100", description: "Demolition & strip-out", xeroAccountCode: "312", xeroTrackingOption: "Demolition" },
  { costCode: "03-100", description: "Concrete floor slab", xeroAccountCode: "320", xeroTrackingOption: "Concrete" },
  { costCode: "03-200", description: "Reinforcement steel", xeroAccountCode: "320", xeroTrackingOption: "Concrete" },
  { costCode: "04-100", description: "Blockwork", xeroAccountCode: "325", xeroTrackingOption: "Masonry" },
  { costCode: "05-100", description: "Structural steel", xeroAccountCode: "330", xeroTrackingOption: "Structural steel" },
  { costCode: "06-100", description: "Carpentry & joinery", xeroAccountCode: "340", xeroTrackingOption: "Carpentry" },
  { costCode: "07-100", description: "Insulation & fire-stopping", xeroAccountCode: "345" },
  { costCode: "07-200", description: "Roofing & cladding", xeroAccountCode: "348", xeroTrackingOption: "Roofing" },
  { costCode: "08-100", description: "Windows & glazing", xeroAccountCode: "350", xeroTrackingOption: "Glazing" },
  { costCode: "09-100", description: "Plasterboard & painting", xeroAccountCode: "355", xeroTrackingOption: "Finishes" },
  { costCode: "10-100", description: "Partitions & ceilings", xeroAccountCode: "356", xeroTrackingOption: "Finishes" },
  { costCode: "12-100", description: "Floor coverings", xeroAccountCode: "358", xeroTrackingOption: "Finishes" },
  { costCode: "15-100", description: "Mechanical / HVAC", xeroAccountCode: "370", xeroTrackingOption: "Mechanical" },
  { costCode: "15-200", description: "Plumbing", xeroAccountCode: "372", xeroTrackingOption: "Mechanical" },
  { costCode: "16-100", description: "Electrical", xeroAccountCode: "380", xeroTrackingOption: "Electrical" },
  { costCode: "17-100", description: "Fit-out & fixtures", xeroAccountCode: "390" },
  { costCode: "26-100", description: "Data & security cabling", xeroAccountCode: "382", xeroTrackingOption: "Electrical" },
  { costCode: "31-100", description: "External works & landscaping", xeroAccountCode: "395" },
];

// ---------------------------------------------------------------------------
// Variations
//
// The one that matters: a Meridian instruction to upgrade the switchboard,
// spotted by the assistant in an email and not yet formally notified. It lands
// on 16-100 Electrical — the trade already driving the Riverside overrun.
// ---------------------------------------------------------------------------

export const variations: Variation[] = [
  {
    id: "VAR-001",
    projectId: "RIV-01",
    costCode: "16-100",
    description:
      "Principal instructed an upgrade to the main switchboard and additional sub-circuits to level 2.",
    origin: "Email",
    originRef: "EM-07",
    instructedOn: "2026-08-24",
    status: "Identified",
    costImpact: null,
    timeImpactDays: null,
    writtenBackToBudget: false,
    draftedByAi: true,
  },
  {
    id: "VAR-002",
    projectId: "RIV-01",
    costCode: "08-100",
    description: "Substitution to double-glazed units on the north elevation at the principal's request.",
    origin: "Site instruction",
    instructedOn: "2026-09-08",
    status: "Notified",
    costImpact: 9_400,
    timeImpactDays: 3,
    writtenBackToBudget: false,
  },
  {
    id: "VAR-003",
    projectId: "RIV-01",
    costCode: "09-100",
    description: "Additional acoustic lining to meeting rooms 3 and 4.",
    origin: "Meeting",
    instructedOn: "2026-08-11",
    status: "Approved",
    costImpact: 6_800,
    timeImpactDays: 0,
    // Approved but never written back — the reconciliation table is still
    // measuring this trade against the original budget.
    writtenBackToBudget: false,
  },
  {
    id: "VAR-004",
    projectId: "HOB-03",
    costCode: "07-200",
    description: "Upgrade to insulated roof panel following a revised thermal spec.",
    origin: "Email",
    originRef: "EM-08",
    instructedOn: "2026-09-14",
    status: "Identified",
    costImpact: null,
    timeImpactDays: null,
    writtenBackToBudget: false,
    draftedByAi: true,
  },
  {
    id: "VAR-005",
    projectId: "KAU-02",
    costCode: "06-100",
    description: "Revised balustrade detail to stairs, levels 2 to 5.",
    origin: "Site instruction",
    instructedOn: "2026-07-20",
    status: "Approved",
    costImpact: 18_200,
    timeImpactDays: 5,
    writtenBackToBudget: true,
  },
];

// ---------------------------------------------------------------------------
// Progress claims
// ---------------------------------------------------------------------------

export const progressClaims: ProgressClaim[] = [
  {
    id: "PC-RIV-07",
    projectId: "RIV-01",
    contractId: "HC-RIV-01",
    claimNumber: 7,
    periodEnd: "2026-08-31",
    servedOn: "2026-09-02",
    lines: [
      { costCode: "01-100", description: "Preliminaries & site", contractValue: 108_000, percentComplete: 92, previouslyClaimed: 92_200, thisClaim: 7_160 },
      { costCode: "05-100", description: "Structural steel", contractValue: 40_900, percentComplete: 100, previouslyClaimed: 38_900, thisClaim: 2_000 },
      { costCode: "15-100", description: "Mechanical / HVAC", contractValue: 100_000, percentComplete: 88, previouslyClaimed: 79_000, thisClaim: 9_000 },
      { costCode: "16-100", description: "Electrical", contractValue: 69_300, percentComplete: 96, previouslyClaimed: 62_100, thisClaim: 4_400 },
    ],
    grossClaimed: 22_560,
    retentionWithheld: 2_256,
    netClaimed: 20_304,
    status: "Paid",
  },
  {
    id: "PC-RIV-08",
    projectId: "RIV-01",
    contractId: "HC-RIV-01",
    claimNumber: 8,
    periodEnd: "2026-09-30",
    servedOn: null,
    lines: [
      { costCode: "09-100", description: "Plasterboard & painting", contractValue: 44_300, percentComplete: 74, previouslyClaimed: 26_100, thisClaim: 6_680 },
      { costCode: "10-100", description: "Partitions & ceilings", contractValue: 53_400, percentComplete: 62, previouslyClaimed: 25_900, thisClaim: 7_210 },
      { costCode: "12-100", description: "Floor coverings", contractValue: 46_600, percentComplete: 28, previouslyClaimed: 6_400, thisClaim: 6_650 },
      { costCode: "17-100", description: "Fit-out & fixtures", contractValue: 80_700, percentComplete: 55, previouslyClaimed: 33_400, thisClaim: 10_985 },
    ],
    grossClaimed: 31_525,
    retentionWithheld: 3_152,
    netClaimed: 28_373,
    status: "Draft",
  },
  {
    id: "PC-KAU-12",
    projectId: "KAU-02",
    contractId: "HC-KAU-02",
    claimNumber: 12,
    periodEnd: "2026-08-31",
    servedOn: "2026-09-01",
    lines: [
      { costCode: "03-100", description: "Concrete structure", contractValue: 751_000, percentComplete: 86, previouslyClaimed: 601_000, thisClaim: 44_860 },
      { costCode: "04-100", description: "Precast panels & blockwork", contractValue: 436_000, percentComplete: 76, previouslyClaimed: 296_000, thisClaim: 35_360 },
    ],
    grossClaimed: 80_220,
    retentionWithheld: 8_022,
    netClaimed: 72_198,
    status: "Scheduled",
    scheduledAmount: 78_400,
  },
  {
    id: "PC-HOB-05",
    projectId: "HOB-03",
    contractId: "HC-HOB-03",
    claimNumber: 5,
    periodEnd: "2026-08-31",
    // Served 3 Aug and the principal has still not responded. That gives us a
    // right, not a risk — the amount is recoverable as a debt.
    servedOn: "2026-08-03",
    lines: [
      { costCode: "05-100", description: "Structural steel & portal frames", contractValue: 587_000, percentComplete: 89, previouslyClaimed: 470_000, thisClaim: 52_430 },
      { costCode: "07-200", description: "Roofing & cladding", contractValue: 331_000, percentComplete: 19, previouslyClaimed: 41_000, thisClaim: 21_890 },
    ],
    grossClaimed: 74_320,
    retentionWithheld: 7_432,
    netClaimed: 66_888,
    status: "Served",
  },
];

// ---------------------------------------------------------------------------
// Retention ledger and the trust account
//
// The ledger totals more than the trust account holds. That gap is the point of
// the page: under the 2023 amendment it is a criminal exposure, not a tidy-up.
// ---------------------------------------------------------------------------

export const retentionEntries: RetentionEntry[] = [
  { id: "RET-01", contractId: "SC-RIV-VLX", projectId: "RIV-01", claimRef: "VLX claim 5", withheldOn: "2026-06-30", amount: 1_800, releasedOn: null, releaseTrigger: null },
  { id: "RET-02", contractId: "SC-RIV-VLX", projectId: "RIV-01", claimRef: "VLX claim 6", withheldOn: "2026-07-31", amount: 1_100, releasedOn: null, releaseTrigger: null },
  { id: "RET-03", contractId: "SC-RIV-VLX", projectId: "RIV-01", claimRef: "VLX claim 7", withheldOn: "2026-08-31", amount: 600, releasedOn: null, releaseTrigger: null },
  { id: "RET-04", contractId: "SC-RIV-NST", projectId: "RIV-01", claimRef: "NST claim 4", withheldOn: "2026-07-31", amount: 1_400, releasedOn: null, releaseTrigger: null },
  { id: "RET-05", contractId: "SC-RIV-NST", projectId: "RIV-01", claimRef: "NST claim 5", withheldOn: "2026-08-31", amount: 600, releasedOn: null, releaseTrigger: null },
  { id: "RET-06", contractId: "SC-RIV-AIR", projectId: "RIV-01", claimRef: "AIR claim 6", withheldOn: "2026-08-31", amount: 4_200, releasedOn: null, releaseTrigger: null },
  { id: "RET-07", contractId: "SC-KAU-TMB", projectId: "KAU-02", claimRef: "TMB claim 9", withheldOn: "2026-07-31", amount: 5_200, releasedOn: null, releaseTrigger: null },
  { id: "RET-08", contractId: "SC-KAU-TMB", projectId: "KAU-02", claimRef: "TMB claim 10", withheldOn: "2026-08-31", amount: 1_800, releasedOn: null, releaseTrigger: null },
  { id: "RET-09", contractId: "SC-HOB-STL", projectId: "HOB-03", claimRef: "STL claim 7", withheldOn: "2026-06-30", amount: 10_000, releasedOn: null, releaseTrigger: null },
  { id: "RET-10", contractId: "SC-HOB-STL", projectId: "HOB-03", claimRef: "STL claim 8", withheldOn: "2026-07-31", amount: 8_000, releasedOn: null, releaseTrigger: null },
  { id: "RET-11", contractId: "SC-HOB-STL", projectId: "HOB-03", claimRef: "STL claim 9", withheldOn: "2026-08-31", amount: 5_500, releasedOn: null, releaseTrigger: null },
  // Already released — kept so the ledger shows movement both ways.
  { id: "RET-12", contractId: "SC-KAU-TMB", projectId: "KAU-02", claimRef: "TMB claim 6", withheldOn: "2026-04-30", amount: 6_400, releasedOn: "2026-08-15", releaseTrigger: "Practical completion" },
];

export const trustAccount: TrustAccount = {
  bank: "ANZ New Zealand",
  accountName: "Retention money on trust — Construction Contracts Act 2002",
  accountNumber: "01-0242-••••••-00",
  balance: 34_600,
  lastReconciled: "2026-09-17",
  bankNotified: true,
};

// ---------------------------------------------------------------------------
// Purchase requests — the execution hub's feed into the payables stack
// ---------------------------------------------------------------------------

export const purchaseRequests: PurchaseRequest[] = [
  { id: "PR-001", projectId: "RIV-01", costCode: "12-100", supplier: "Ashfield Flooring", amount: 15_200, requestedBy: "Tom Baker", requestedOn: "2026-09-15", status: "Pending approval", poNumber: null },
  { id: "PR-002", projectId: "RIV-01", costCode: "17-100", supplier: "Meridian Fitout Supply", amount: 23_000, requestedBy: "Sarah Chen", requestedOn: "2026-09-12", status: "Approved", poNumber: null },
  { id: "PR-003", projectId: "RIV-01", costCode: "26-100", supplier: "Netlink Cabling", amount: 8_800, requestedBy: "Tom Baker", requestedOn: "2026-09-08", status: "PO raised", poNumber: "PO-4471" },
  { id: "PR-004", projectId: "HOB-03", costCode: "07-200", supplier: "Roofline Systems", amount: 96_000, requestedBy: "Tom Baker", requestedOn: "2026-09-16", status: "Draft", poNumber: null },
  { id: "PR-005", projectId: "NEW-04", costCode: "06-100", supplier: "Woodgrain Joinery", amount: 11_750, requestedBy: "Tom Baker", requestedOn: "2026-09-04", status: "PO raised", poNumber: "PO-4468" },
  { id: "PR-006", projectId: "KAU-02", costCode: "16-100", supplier: "Voltix Electrical", amount: 64_000, requestedBy: "Sarah Chen", requestedOn: "2026-09-17", status: "Pending approval", poNumber: null },
];

// ---------------------------------------------------------------------------
// Opportunities — extracted from unstructured messages, confirmed by a person
// ---------------------------------------------------------------------------

export const opportunities: Opportunity[] = [
  {
    id: "OPP-001",
    principal: "Newmarket Developments",
    name: "Newmarket retail refit — electrical package",
    location: "Newmarket, Auckland",
    estimatedValue: 240_000,
    closesOn: "2026-10-02",
    extractedFrom: "Email",
    sourceRef: "EM-02",
    confidence: 0.94,
    confirmed: true,
    status: "Bid",
  },
  {
    id: "OPP-002",
    principal: "Harbour Point Trust",
    name: "Devonport community hall refurbishment",
    location: "Devonport, Auckland",
    estimatedValue: 610_000,
    closesOn: "2026-10-16",
    extractedFrom: "Meeting minutes",
    confidence: 0.81,
    confirmed: false,
    status: "Opportunity",
  },
  {
    id: "OPP-003",
    principal: "Southgate Logistics",
    name: "Hobsonville warehouse — stage 2 extension",
    location: "Hobsonville, Auckland",
    estimatedValue: 1_450_000,
    closesOn: "2026-11-06",
    extractedFrom: "Meeting minutes",
    confidence: 0.88,
    confirmed: true,
    status: "Opportunity",
  },
  {
    id: "OPP-004",
    principal: "Vantage Retail",
    name: "Botany store fitout",
    location: "Botany, Auckland",
    estimatedValue: null,
    closesOn: null,
    extractedFrom: "Email",
    confidence: 0.63,
    confirmed: false,
    status: "Lead",
  },
  {
    id: "OPP-005",
    principal: "Meridian Property Group",
    name: "Albany office tower — level 4 to 6 fitout",
    location: "Albany, Auckland",
    estimatedValue: 980_000,
    closesOn: "2026-09-25",
    extractedFrom: "Email",
    confidence: 0.91,
    confirmed: true,
    status: "Submitted",
  },
  {
    id: "OPP-006",
    principal: "Kauri Living Ltd",
    name: "Kauri Apartments stage 3",
    location: "Mt Eden, Auckland",
    estimatedValue: 3_800_000,
    closesOn: null,
    extractedFrom: "Chat",
    confidence: 0.72,
    confirmed: false,
    status: "Lead",
  },
];

// ---------------------------------------------------------------------------
// Statutory clocks
//
// Three kinds, one mechanism. Dates are chosen against DEMO_TODAY (18 Sep 2026)
// so the board shows one overdue, one about to expire, and several comfortable.
// ---------------------------------------------------------------------------

export const statutoryClocks: StatutoryClock[] = [
  {
    // Overdue. Voltix served on 13 Aug; the 20 working days ran out on 10 Sep.
    id: "CLK-001",
    kind: "Payment schedule due",
    sourceId: "INV-001",
    sourceLabel: "Voltix Electrical — payment claim VLX-4471",
    projectId: "RIV-01",
    contractId: "SC-RIV-VLX",
    triggeredOn: "2026-08-13",
    workingDays: 20,
    consequence: "The full claimed amount becomes recoverable as a debt.",
  },
  {
    // Two working days left when the demo opens.
    id: "CLK-002",
    kind: "Variation notice due",
    sourceId: "VAR-001",
    sourceLabel: "Switchboard upgrade instruction — Meridian",
    projectId: "RIV-01",
    contractId: "HC-RIV-01",
    triggeredOn: "2026-08-24",
    workingDays: 20,
    consequence: "The right to claim this variation is lost.",
  },
  {
    id: "CLK-003",
    kind: "Payment schedule due",
    sourceId: "INV-004",
    sourceLabel: "Pacific Concrete — payment claim PAC-2231",
    projectId: "RIV-01",
    contractId: "SC-RIV-NST",
    triggeredOn: "2026-09-09",
    workingDays: 20,
    consequence: "The full claimed amount becomes recoverable as a debt.",
  },
  {
    // Ours to enforce: Southgate never responded, so the amount is now a debt.
    id: "CLK-004",
    kind: "Payment due",
    sourceId: "PC-HOB-05",
    sourceLabel: "Claim 5 to Southgate Logistics",
    projectId: "HOB-03",
    contractId: "HC-HOB-03",
    triggeredOn: "2026-08-03",
    workingDays: 20,
    consequence: "We may recover the amount as a debt or refer it to adjudication.",
  },
  {
    id: "CLK-005",
    kind: "Variation notice due",
    sourceId: "VAR-004",
    sourceLabel: "Roof panel thermal spec change — Southgate",
    projectId: "HOB-03",
    contractId: "HC-HOB-03",
    triggeredOn: "2026-09-14",
    workingDays: 20,
    consequence: "The right to claim this variation is lost.",
  },
  {
    id: "CLK-006",
    kind: "Payment due",
    sourceId: "PC-KAU-12",
    sourceLabel: "Claim 12 to Kauri Living",
    projectId: "KAU-02",
    contractId: "HC-KAU-02",
    triggeredOn: "2026-09-01",
    workingDays: 20,
    consequence: "We may recover the amount as a debt or refer it to adjudication.",
    satisfiedOn: "2026-09-16",
  },
  {
    id: "CLK-007",
    kind: "Payment schedule due",
    sourceId: "INV-006",
    sourceLabel: "PlumbRight Ltd — payment claim PLR-5567",
    projectId: "HOB-03",
    contractId: "SC-HOB-STL",
    triggeredOn: "2026-09-14",
    workingDays: 20,
    consequence: "The full claimed amount becomes recoverable as a debt.",
  },
];

/** Two more emails, referenced by the AI-drafted variations above. */
export const variationSourceEmails: EmailItem[] = [
  {
    id: "EM-07",
    from: "p.mcleod@meridianproperty.co.nz",
    subject: "Re: Riverside level 2 — switchboard",
    receivedAt: "2026-08-24T15:32:00+12:00",
    classifiedAs: "Client query",
    routedTo: "PM (Sarah Chen)",
    confidence: 0.86,
    reason:
      "The message instructs a change to the switchboard and additional sub-circuits. That is an instruction from the principal, not a query — it was drafted as a variation and a notification clock was started.",
  },
  {
    id: "EM-08",
    from: "ops@southgatelogistics.co.nz",
    subject: "Revised thermal spec — roof panels",
    receivedAt: "2026-09-14T09:12:00+12:00",
    classifiedAs: "Client query",
    routedTo: "PM (Sarah Chen)",
    confidence: 0.79,
    reason:
      "A revised specification attached to an otherwise routine message. Treated as a possible variation and flagged for confirmation.",
  },
];

/** Statutory exceptions, appended to the three the demo already had. */
export const statutoryExceptions: ExceptionItem[] = [
  {
    id: "EXC-05",
    type: "Payment schedule overdue",
    severity: "High",
    projectId: "RIV-01",
    description:
      "No payment schedule was issued for Voltix VLX-4471 within 20 working days. The claimed amount is now recoverable as a debt.",
    relatedInvoiceId: "INV-001",
    amount: 12_400,
  },
  {
    id: "EXC-06",
    type: "Variation notice overdue",
    severity: "High",
    projectId: "RIV-01",
    description:
      "The switchboard upgrade instruction of 24 Aug has not been notified as a variation. Two working days remain before the right to claim is lost.",
  },
  {
    id: "EXC-07",
    type: "Retention shortfall",
    severity: "High",
    projectId: "RIV-01",
    description:
      "Retention money held on trust is short of the ledger balance. Holding less than the retention liability is an offence under the 2023 amendment.",
  },
];
