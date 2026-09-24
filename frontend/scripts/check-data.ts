/**
 * Data integrity check for the demo dataset.
 *
 * The demo only works if the numbers hold up to a quantity surveyor adding
 * them up on screen. This asserts the narrative and the arithmetic:
 *   - every project's budget lines sum exactly to its project-level totals
 *   - Riverside is ~6% over on forecast, driven by Electrical and Steel
 *   - flags, exceptions and the assistant's canned answers agree with the data
 *
 * Run with: npm run check:data
 */
import {
  budgetLines,
  chatQA,
  contracts,
  costCodeMappings,
  emails,
  exceptions,
  GST_RATE,
  invoices,
  opportunities,
  progressClaims,
  projects,
  purchaseRequests,
  retentionEntries,
  statutoryClocks,
  statutoryExceptions,
  suggestedQuestions,
  trustAccount,
  variations,
} from "../lib/mock-data";
import { getLiveClocks, getRetentionPosition } from "../lib/derive";
import { formatDateShort, formatDateLong, formatDateTimeLong } from "../lib/format";
import { getLineTotals, getOverBudgetLines, getProjectLines, matchQuestion } from "../lib/derive";

let failures = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log("\nBudget lines reconcile to project totals");
for (const p of projects) {
  const t = getLineTotals(p.id);
  check(
    `${p.id} budget lines sum to project totals`,
    t.budget === p.budgetTotal && t.committed === p.committedTotal && t.actual === p.actualTotal,
    `lines: ${t.budget}/${t.committed}/${t.actual} vs project: ${p.budgetTotal}/${p.committedTotal}/${p.actualTotal}`
  );
}

console.log("\nRiverside narrative");
const riv = projects.find((p) => p.id === "RIV-01")!;
const rivOverPct = ((riv.forecastFinal - riv.budgetTotal) / riv.budgetTotal) * 100;
check(
  "Riverside forecast is ~6% over budget",
  Math.round(rivOverPct) === 6,
  `${rivOverPct.toFixed(2)}%`
);
check("Riverside status is Over budget", riv.status === "Over budget");

const rivOver = getOverBudgetLines("RIV-01");
const electrical = rivOver.find((l) => l.code === "16-100");
const steel = rivOver.find((l) => l.code === "05-100");
check("Electrical (16-100) is +$11,300 over", electrical?.variance === 11_300, String(electrical?.variance));
check("Structural steel (05-100) is +$5,500 over", steel?.variance === 5_500, String(steel?.variance));
check(
  "Electrical and Steel are the two largest overruns",
  rivOver[0]?.code === "16-100" && rivOver[1]?.code === "05-100",
  rivOver.slice(0, 2).map((l) => l.code).join(", ")
);

console.log("\nOther projects behave as their status claims");
const kau = projects.find((p) => p.id === "KAU-02")!;
check("Kauri has no over-budget lines", getOverBudgetLines("KAU-02").length === 0);
check("Kauri forecast margin beats tender", kau.forecastMarginPct > kau.budgetMarginPct);
const hobOver = getOverBudgetLines("HOB-03");
check("Hobsonville has 1-2 lines slightly over", hobOver.length >= 1 && hobOver.length <= 2, `${hobOver.length}`);
check(
  "Hobsonville steel overrun matches its exception ($3,400)",
  hobOver.find((l) => l.code === "05-100")?.variance === 3_400
);
check("Newmarket has no over-budget lines", getOverBudgetLines("NEW-04").length === 0);

console.log("\nInvoices");
check("14 invoices", invoices.length === 14, String(invoices.length));
check(
  "every invoice codes to a real budget line on its project",
  invoices.every((i) => budgetLines.some((l) => l.projectId === i.projectId && l.code === i.lineCode)),
  invoices
    .filter((i) => !budgetLines.some((l) => l.projectId === i.projectId && l.code === i.lineCode))
    .map((i) => `${i.invoiceNumber}/${i.lineCode}`)
    .join(", ")
);
check(
  "GST is 15% of the exclusive amount on every invoice",
  invoices.every((i) => Math.abs(i.gst - i.amount * (GST_RATE / (1 + GST_RATE))) < 0.01)
);
check("every status column has at least one invoice", [
  "Captured",
  "Coded",
  "Pending approval",
  "Approved",
  "Awaiting payment",
  "Paid",
].every((s) => invoices.some((i) => i.status === s)));

const noPO = invoices.filter((i) => !i.hasPO);
check("exactly one no-PO invoice, and it is Voltix VLX-4471", noPO.length === 1 && noPO[0].invoiceNumber === "VLX-4471");
check("no-PO invoice carries the No PO flag", noPO[0]?.flags?.includes("No PO") === true);

const pac = invoices.filter((i) => i.invoiceNumber === "PAC-2231");
check("PAC-2231 appears twice", pac.length === 2);
check("exactly one of them is flagged Duplicate", pac.filter((i) => i.flags?.includes("Duplicate")).length === 1);

console.log("\nExceptions");
check("4 exceptions", exceptions.length === 4, String(exceptions.length));
check(
  "severity split is 3 High / 1 Medium, matching the spec's stated subtotal",
  exceptions.filter((e) => e.severity === "High").length === 3 &&
    exceptions.filter((e) => e.severity === "Medium").length === 1
);
check(
  "every exception points at a real project",
  exceptions.every((e) => projects.some((p) => p.id === e.projectId))
);
check(
  "every linked invoice id resolves",
  exceptions.every((e) => !e.relatedInvoiceId || invoices.some((i) => i.id === e.relatedInvoiceId))
);
check(
  "the Electrical over-budget exception matches the line variance",
  exceptions.find((e) => e.id === "EXC-02")?.amount === electrical?.variance
);
check(
  "the no-PO exception amount matches the Voltix invoice",
  exceptions.find((e) => e.id === "EXC-03")?.amount === noPO[0]?.amount
);

console.log("\nDates render the same in every timezone");
// Server-side rendering runs in UTC while the browser runs in the viewer's own
// zone. If a date is converted rather than read off the ISO string, the two
// disagree, React discards the server HTML, and the demo's NZ dates shift a day.
check(
  "a +12:00 timestamp keeps its written calendar day",
  formatDateShort("2026-09-12T08:14:00+12:00") === "12 Sep",
  formatDateShort("2026-09-12T08:14:00+12:00")
);
check(
  "an early-morning NZ timestamp does not roll back to the previous day",
  formatDateTimeLong("2026-09-10T13:51:00+12:00") === "10 Sep 2026, 1:51 pm",
  formatDateTimeLong("2026-09-10T13:51:00+12:00")
);
check("a plain date renders as written", formatDateLong("2026-09-12") === "12 Sep 2026", formatDateLong("2026-09-12"));
check(
  "every invoice date renders to its own written day",
  invoices.every((i) => formatDateShort(i.date) === `${Number(i.date.slice(8, 10))} Sep`)
);
check(
  "every email timestamp renders to its own written day",
  emails.every((e) => formatDateShort(e.receivedAt) === `${Number(e.receivedAt.slice(8, 10))} Sep`)
);

console.log("\nAssistant");
check("every suggested question has an answer", suggestedQuestions.every((q) => matchQuestion(q)),
  suggestedQuestions.filter((q) => !matchQuestion(q)).join(" | "));
check(
  "the statutory topics are answerable, not just the budget ones",
  ["deadline", "retention", "variation"].every((topic) =>
    chatQA.some((qa) => qa.keywords.some((k) => k.includes(topic)))
  )
);
check("every suggested question matches itself", chatQA.every((qa) => matchQuestion(qa.question) === qa));
check("a paraphrase still matches", matchQuestion("which jobs are over budget?")?.question === "Which projects are over budget?");
check("nonsense falls through to the fallback", matchQuestion("what is the weather") === undefined);
check(
  "Riverside answer quotes the real line figures",
  chatQA[1].answer.includes("$72,300") && chatQA[1].answer.includes("$61,000") && chatQA[1].answer.includes("+$11,300")
);

console.log("\nContracts");
check(
  "every project has a head contract",
  projects.every((p) => contracts.some((c) => c.projectId === p.id && c.side === "Principal"))
);
check(
  "every contract sits on a real project",
  contracts.every((c) => projects.some((p) => p.id === c.projectId))
);
check(
  "head contract value is consistent with the tender margin",
  projects.every((p) => {
    const hc = contracts.find((c) => c.projectId === p.id && c.side === "Principal")!;
    const implied = p.budgetTotal / (1 - p.budgetMarginPct / 100);
    return Math.abs(hc.value - implied) / implied < 0.01;
  })
);
check("retention is capped, never unlimited", contracts.every((c) => c.retentionCapPct > 0));

console.log("\ncost code mapping");
check(
  "every Riverside budget line has a cost code mapping",
  budgetLines
    .filter((l) => l.projectId === "RIV-01")
    .every((l) => costCodeMappings.some((m) => m.costCode === l.code))
);
check(
  "every purchase request codes to a mapped cost code",
  purchaseRequests.every((r) => costCodeMappings.some((m) => m.costCode === r.costCode))
);

console.log("\nStatutory clocks");
const live = getLiveClocks();
check("7 clocks", live.length === 7, String(live.length));
check(
  "every clock points at a real project and contract",
  live.every(
    (c) =>
      projects.some((p) => p.id === c.projectId) && contracts.some((k) => k.id === c.contractId)
  )
);
const oursOverdue = live.filter((c) => c.overdue && c.exposure === "Ours");
check("exactly one of our own deadlines is missed", oursOverdue.length === 1, String(oursOverdue.length));
check(
  "and it is the Voltix payment schedule",
  oursOverdue[0]?.sourceId === "INV-001",
  oursOverdue[0]?.sourceId
);
check(
  "a claim the other side left unanswered is counted as our entitlement, not our failure",
  live.some((c) => c.overdue && c.exposure === "Theirs" && c.kind === "Payment due")
);
check(
  "at least one clock is inside three working days",
  live.some((c) => !c.overdue && !c.satisfied && c.remaining <= 3)
);
check(
  "every clock states what happens if it is missed",
  live.every((c) => c.consequence.length > 10)
);
check(
  "no clock falls outside the holiday calendar",
  live.every((c) => !c.uncertain)
);

check(
  "the worst of our own overdue clocks is the Voltix one, not the unanswered claim",
  live.filter((c) => c.exposure === "Ours" && c.overdue).sort((a, b) => a.remaining - b.remaining)[0]
    ?.sourceId === "INV-001"
);

console.log("\nRetentions");
const ret = getRetentionPosition();
check(
  "every retention entry belongs to a subcontract we let",
  retentionEntries.every((e) =>
    contracts.some((c) => c.id === e.contractId && c.side === "Subcontractor")
  )
);
check("the ledger is short of the trust account — that is the point of the page", !ret.compliant);
check(
  "the shortfall equals ledger balance minus the account balance",
  ret.shortfall === ret.liability - trustAccount.balance
);
check(
  "no subcontract holds more retention than its contractual cap",
  ret.positions.every((p) => p.balance <= p.cap),
  ret.positions.filter((p) => p.balance > p.cap).map((p) => p.contract.counterparty).join(", ")
);
check("the bank has been told the account holds money on trust", trustAccount.bankNotified);

console.log("\nVariations");
check(
  "every variation codes to a real budget line on its project",
  variations.every((v) =>
    budgetLines.some((l) => l.projectId === v.projectId && l.code === v.costCode)
  )
);
check(
  "an approved variation exists that has not been written back",
  variations.some((v) => v.status === "Approved" && !v.writtenBackToBudget)
);
check(
  "unpriced variations have no cost and no time determination",
  variations
    .filter((v) => v.status === "Identified")
    .every((v) => v.costImpact === null && v.timeImpactDays === null)
);
check(
  "AI-drafted variations cite the message they came from",
  variations.filter((v) => v.draftedByAi).every((v) => Boolean(v.originRef))
);

console.log("\nProgress claims");
check(
  "claim lines sum to the gross claimed",
  progressClaims.every(
    (c) => Math.abs(c.lines.reduce((s, l) => s + l.thisClaim, 0) - c.grossClaimed) < 1
  ),
  progressClaims
    .filter((c) => Math.abs(c.lines.reduce((s, l) => s + l.thisClaim, 0) - c.grossClaimed) >= 1)
    .map((c) => c.id)
    .join(", ")
);
check(
  "net equals gross less retention",
  progressClaims.every((c) => Math.abs(c.grossClaimed - c.retentionWithheld - c.netClaimed) < 1)
);
check(
  "retention withheld matches the contract rate",
  progressClaims.every((c) => {
    const k = contracts.find((x) => x.id === c.contractId)!;
    return Math.abs(c.retentionWithheld - (c.grossClaimed * k.retentionPct) / 100) < 2;
  })
);
check(
  "no line claims more than its contract value",
  progressClaims.every((c) =>
    c.lines.every((l) => l.previouslyClaimed + l.thisClaim <= l.contractValue)
  )
);
check(
  "percent complete never exceeds 100",
  progressClaims.every((c) => c.lines.every((l) => l.percentComplete <= 100))
);

console.log("\nPipeline");
check(
  "low-confidence opportunities are not silently confirmed",
  opportunities.filter((o) => o.confidence < 0.8).every((o) => !o.confirmed)
);
check("every opportunity records where it was extracted from", opportunities.every((o) => o.extractedFrom));

console.log("\nStatutory exceptions");
check("3 statutory exceptions", statutoryExceptions.length === 3, String(statutoryExceptions.length));
check(
  "each one corresponds to a real condition",
  statutoryExceptions.every((e) => projects.some((p) => p.id === e.projectId))
);
check(
  "the overdue payment schedule exception matches our overdue clock",
  statutoryExceptions.find((e) => e.type === "Payment schedule overdue")?.relatedInvoiceId ===
    oursOverdue[0]?.sourceId
);

console.log(`\n${failures === 0 ? "All data checks passed." : `${failures} check(s) FAILED.`}\n`);
process.exit(failures === 0 ? 0 : 1);
