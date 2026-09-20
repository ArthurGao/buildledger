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
import { emails, exceptions, invoices, projects, budgetLines, chatQA, GST_RATE } from "../lib/mock-data";
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
check("6 canned answers", chatQA.length === 6, String(chatQA.length));
check("every suggested question matches itself", chatQA.every((qa) => matchQuestion(qa.question) === qa));
check("a paraphrase still matches", matchQuestion("which jobs are over budget?")?.question === "Which projects are over budget?");
check("nonsense falls through to the fallback", matchQuestion("what is the weather") === undefined);
check(
  "Riverside answer quotes the real line figures",
  chatQA[1].answer.includes("$72,300") && chatQA[1].answer.includes("$61,000") && chatQA[1].answer.includes("+$11,300")
);

console.log(`\n${failures === 0 ? "All data checks passed." : `${failures} check(s) FAILED.`}\n`);
process.exit(failures === 0 ? 0 : 1);
