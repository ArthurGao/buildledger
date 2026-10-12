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
  lineRecords,
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
import { approvalSteps } from "../lib/mock-data";
import { approve, describeDecision, reject, restore, snapshot } from "../lib/approvals";
import {
  draftPaymentSchedule,
  getClockForSource,
  getLiveClocks,
  getRetentionPosition,
  getStatutoryExceptions,
  getVariationClockCounts,
} from "../lib/derive";
import { formatDateShort, formatDateLong, formatDateTimeLong } from "../lib/format";
import {
  BRIDGE_INTERVALS,
  getBridgeAxis,
  getExceptionExposure,
  getPortfolioLedger,
  getExceptionGroups,
  getForecastBridge,
  getLineTotals,
  getOverBudgetLines,
  getProjectLines,
  matchQuestion,
} from "../lib/derive";

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

console.log("\nLine forecasts reconcile to the project forecast");
for (const p of projects) {
  const lines = getProjectLines(p.id);
  const forecast = lines.reduce((sum, l) => sum + l.forecastAmount, 0);
  check(`${p.id} line forecasts sum to forecast final`, forecast === p.forecastFinal, `${forecast} vs ${p.forecastFinal}`);
  const belowActual = lines.filter((l) => l.forecastAmount < l.actualAmount);
  check(
    `${p.id} no line forecasts below what is already spent`,
    belowActual.length === 0,
    belowActual.map((l) => l.code).join(", ")
  );
}
const rivByForecast = getProjectLines("RIV-01").sort((a, b) => b.forecastVariance - a.forecastVariance);
check(
  "Electrical and Steel are the two largest forecast overruns on Riverside",
  rivByForecast[0]?.code === "16-100" && rivByForecast[1]?.code === "05-100",
  rivByForecast.slice(0, 2).map((l) => l.code).join(", ")
);
check(
  "together they carry most of Riverside's forecast overrun",
  rivByForecast[0].forecastVariance + rivByForecast[1].forecastVariance > (riv.forecastFinal - riv.budgetTotal) / 2
);
check(
  "both forecast worse than their overrun to date",
  rivByForecast[0].forecastVariance > rivByForecast[0].variance &&
    rivByForecast[1].forecastVariance > rivByForecast[1].variance
);

console.log("\nSource records behind every line");
const cents = (n: number) => Math.round(n * 100);
for (const l of budgetLines) {
  const records = lineRecords.filter((r) => r.projectId === l.projectId && r.costCode === l.code);
  const posted = records.filter((r) => r.kind === "Bill" && r.inActual).reduce((s, r) => s + cents(r.amount), 0);
  const ordered = records.filter((r) => r.kind === "Purchase order").reduce((s, r) => s + cents(r.amount), 0);
  if (posted !== cents(l.actualAmount) || ordered !== cents(l.committedAmount)) {
    check(
      `${l.projectId} ${l.code} records sum to the line`,
      false,
      `bills ${posted / 100} vs actual ${l.actualAmount}, POs ${ordered / 100} vs committed ${l.committedAmount}`
    );
  }
}
check(
  "every line's posted bills and POs sum to its actual and committed",
  budgetLines.every((l) => {
    const records = lineRecords.filter((r) => r.projectId === l.projectId && r.costCode === l.code);
    const posted = records.filter((r) => r.kind === "Bill" && r.inActual).reduce((s, r) => s + cents(r.amount), 0);
    const ordered = records.filter((r) => r.kind === "Purchase order").reduce((s, r) => s + cents(r.amount), 0);
    return posted === cents(l.actualAmount) && ordered === cents(l.committedAmount);
  })
);
check(
  "every invoice in the pipeline appears exactly once as a source record",
  invoices.every((i) => lineRecords.filter((r) => r.invoiceId === i.id).length === 1)
);
check(
  "only approved bills count toward actual — pending, duplicate and captured ones do not",
  lineRecords
    .filter((r) => r.invoiceId)
    .every((r) => {
      const inv = invoices.find((i) => i.id === r.invoiceId)!;
      const shouldCount =
        ["Approved", "Awaiting payment", "Paid"].includes(inv.status) && !inv.flags?.includes("Duplicate");
      return r.inActual === shouldCount;
    })
);
check(
  "Electrical's forecast covers what is spent plus the Voltix bill awaiting approval",
  (() => {
    const e = getProjectLines("RIV-01").find((l) => l.code === "16-100")!;
    const pending = lineRecords
      .filter((r) => r.projectId === "RIV-01" && r.costCode === "16-100" && r.kind === "Bill" && !r.inActual)
      .reduce((s, r) => s + r.amount, 0);
    return pending > 0 && e.forecastAmount >= e.actualAmount + pending;
  })()
);
check(
  "bills are carried net of GST",
  lineRecords
    .filter((r) => r.invoiceId)
    .every((r) => {
      const inv = invoices.find((i) => i.id === r.invoiceId)!;
      return cents(r.amount) === cents(inv.amount - inv.gst);
    })
);
check("record ids are unique", new Set(lineRecords.map((r) => r.id)).size === lineRecords.length);

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

console.log("\nDrafting a payment schedule");
const voltix = invoices.find((i) => i.id === "INV-001")!;
const voltixDraft = draftPaymentSchedule(voltix);
check(
  "the Voltix draft withholds against an uncertified variation",
  voltixDraft.reasons.some((r) => r.kind === "Uncertified variation")
);
check(
  "and cites the variation record as evidence",
  voltixDraft.reasons.some((r) => r.evidence.includes("VAR-001"))
);
check(
  "scheduled plus withheld equals claimed",
  voltixDraft.scheduledAmount + voltixDraft.reasons.reduce((s, r) => s + r.amount, 0) ===
    voltixDraft.claimedAmount
);
const dupDraft = draftPaymentSchedule(invoices.find((i) => i.id === "INV-004")!);
check("a duplicate claim is scheduled at nil", dupDraft.scheduledAmount === 0);
check(
  "a clean claim needs no statement of difference",
  draftPaymentSchedule(invoices.find((i) => i.id === "INV-012")!).reasons.length === 0
);
check(
  "every reason names the systems it was read from",
  voltixDraft.reasons.every((r) => r.sources.length > 0)
);

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

// The variation exception is worded from its clock, so the list, the clock and
// the badge can never disagree about how long is left.
{
  const clock = getClockForSource("VAR-001")!;
  const exc = getStatutoryExceptions().find((e) => e.id === "EXC-06")!;
  const days = `${clock.remaining} working day${clock.remaining === 1 ? "" : "s"}`;
  check(
    "EXC-06 is 'Variation notice due' while its clock is still running",
    !clock.overdue && exc.type === "Variation notice due" && exc.severity === "Medium",
    `${exc.type} · ${exc.severity} · clock remaining ${clock.remaining}`
  );
  check(
    `EXC-06 states the clock's own count (${days})`,
    exc.description.includes(days) && !/two working days/i.test(exc.description),
    exc.description
  );
  const counts = getVariationClockCounts();
  const expected = getLiveClocks().filter((c) => c.kind === "Variation notice due" && !c.satisfied);
  check(
    "Variations badge counts variation clocks only: 0 missed, 1 due within 3 working days",
    counts.missed === expected.filter((c) => c.overdue).length &&
      counts.dueSoon === expected.filter((c) => !c.overdue && c.remaining <= 3).length &&
      counts.missed === 0 &&
      counts.dueSoon === 1,
    JSON.stringify(counts)
  );
}

console.log("\nPortfolio ledger");
{
  const ledger = getPortfolioLedger();
  check("ledger has every project once", ledger.length === projects.length);
  check("Riverside leads (largest overrun by percentage)", ledger[0]?.id === "RIV-01", ledger.map((r) => r.id).join(","));
  check("Hobsonville is second and also over", ledger[1]?.id === "HOB-03" && ledger[1].over);
  check("exactly 2 of 4 projects forecast over budget", ledger.filter((r) => r.over).length === 2);
  // A project forecast to finish over budget is labelled Over budget, so the
  // status badge never contradicts the variance beside it.
  const mislabelled = projects.filter((p) => (p.forecastFinal > p.budgetTotal) !== (p.status === "Over budget"));
  check(
    "status is Over budget exactly when the forecast is over budget",
    mislabelled.length === 0,
    mislabelled.map((p) => `${p.id}: ${p.status}`).join(", ")
  );
  check(
    "variance is forecast at completion against budget",
    ledger.every((r) => r.variance === r.forecastFinal - r.budgetTotal)
  );
}

console.log("\nException exposure");
// INV-001 is both "No PO spend" and "Payment schedule overdue"; the money at
// stake is one invoice, so the page total must count it once.
check(
  "exposure counts each invoice once ($33,300, not $45,700)",
  getExceptionExposure() === 33_300,
  String(getExceptionExposure())
);
{
  const groups = getExceptionGroups();
  const all = [...exceptions, ...statutoryExceptions];
  check(
    "every exception lands in exactly one group",
    groups.spend.length + groups.statutory.length === all.length &&
      all.every((e) => [...groups.spend, ...groups.statutory].filter((g) => g.id === e.id).length === 1)
  );
  check(
    "the statutory group is exactly the clock-raised exceptions",
    groups.statutory.length === statutoryExceptions.length &&
      groups.statutory.every((e) => statutoryExceptions.some((s) => s.id === e.id))
  );
  const ordered = (list: typeof all) =>
    list.every(
      (e, i) =>
        i === 0 ||
        (list[i - 1].severity === "High" && e.severity === "Medium") ||
        (list[i - 1].severity === e.severity && (list[i - 1].amount ?? 0) >= (e.amount ?? 0))
    );
  check("each group runs High first, then largest amount", ordered(groups.spend) && ordered(groups.statutory));
}

console.log("\nBridge axis");
// The bridge's tick lines are drawn on the sheet's 12-column grid: the bar track
// spans four columns, so the axis must always split into exactly four intervals.
for (const p of projects) {
  const axis = getBridgeAxis(p.id);
  const ends = [p.budgetTotal, p.forecastFinal];
  let running = p.budgetTotal;
  for (const s of getForecastBridge(p.id)) ends.push((running += s.delta));
  check(
    `${p.id}: axis has ${BRIDGE_INTERVALS + 1} ticks on one step`,
    axis.ticks.length === BRIDGE_INTERVALS + 1 &&
      axis.ticks.every((t, i) => t === axis.min + i * axis.step) &&
      axis.ticks[BRIDGE_INTERVALS] === axis.max,
    JSON.stringify(axis)
  );
  check(
    `${p.id}: every bar end falls inside the axis`,
    ends.every((v) => v > axis.min && v < axis.max),
    `${axis.min}..${axis.max} vs ${Math.min(...ends)}..${Math.max(...ends)}`
  );
}

// ---------------------------------------------------------------------------
console.log("\nApproval decisions");
{
  const at = "2026-10-12T09:00:00.000Z";
  const chain = (steps: typeof approvalSteps, id: string) =>
    steps.filter((s) => s.invoiceId === id).map((s) => `${s.approver}:${s.status}`).join(", ");
  const statusOf = (list: typeof invoices, id: string) => list.find((i) => i.id === id)?.status;

  // INV-001 needs two signatures: Sarah Chen, then David Whitfield.
  const first = approve(invoices, approvalSteps, "INV-001", at);
  check(
    "INV-001: first approval stamps Sarah Chen only",
    first.decidedBy === "Sarah Chen" && chain(first.steps, "INV-001") === "Sarah Chen:Approved, David Whitfield:Waiting",
    chain(first.steps, "INV-001")
  );
  check(
    "INV-001: stays Pending approval while David Whitfield has not signed",
    statusOf(first.invoices, "INV-001") === "Pending approval",
    String(statusOf(first.invoices, "INV-001"))
  );
  const second = approve(first.invoices, first.steps, "INV-001", at);
  check(
    "INV-001: moves to Approved once the whole chain has signed",
    second.decidedBy === "David Whitfield" && statusOf(second.invoices, "INV-001") === "Approved",
    `${second.decidedBy} → ${statusOf(second.invoices, "INV-001")}`
  );

  // The log names the step, so a first signature never reads as a final approval.
  const inv001 = invoices.find((i) => i.id === "INV-001")!;
  check(
    "INV-001: first approval is logged as step 1 of 2, now with David Whitfield",
    describeDecision(inv001, "Approved", first) === "VLX-4471 approved by Sarah Chen (step 1 of 2, now with David Whitfield)",
    describeDecision(inv001, "Approved", first)
  );
  check(
    "INV-001: second approval is logged as step 2 of 2, fully approved",
    describeDecision(inv001, "Approved", second) === "VLX-4471 approved by David Whitfield (step 2 of 2, fully approved)",
    describeDecision(inv001, "Approved", second)
  );
  check(
    "a flagged approval keeps the flags and the reason in the log",
    describeDecision(inv001, "Approved", first, "Site instruction on file") ===
      "VLX-4471 approved by Sarah Chen despite No PO — “Site instruction on file” (step 1 of 2, now with David Whitfield)",
    describeDecision(inv001, "Approved", first, "Site instruction on file")
  );

  const rejected = reject(invoices, approvalSteps, "INV-004", at);
  check(
    "INV-004: a rejection drops it back to Coded and stamps the waiting step",
    statusOf(rejected.invoices, "INV-004") === "Coded" && chain(rejected.steps, "INV-004").includes("Sarah Chen:Rejected"),
    `${statusOf(rejected.invoices, "INV-004")} · ${chain(rejected.steps, "INV-004")}`
  );

  // Undo puts back exactly one invoice, even after another invoice was decided in between.
  const snap = snapshot(invoices, approvalSteps, "INV-004")!;
  const other = approve(rejected.invoices, rejected.steps, "INV-012", at);
  const undone = restore(other.invoices, other.steps, snap);
  check(
    "Undo restores INV-004 and its chain exactly",
    statusOf(undone.invoices, "INV-004") === statusOf(invoices, "INV-004") &&
      chain(undone.steps, "INV-004") === chain(approvalSteps, "INV-004"),
    `${statusOf(undone.invoices, "INV-004")} · ${chain(undone.steps, "INV-004")}`
  );
  check(
    "Undo leaves the decision on INV-012 in place",
    chain(undone.steps, "INV-012") === chain(other.steps, "INV-012") && undone.steps.length === approvalSteps.length,
    chain(undone.steps, "INV-012")
  );
}

console.log(`\n${failures === 0 ? "All data checks passed." : `${failures} check(s) FAILED.`}\n`);
process.exit(failures === 0 ? 0 : 1);
