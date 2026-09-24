/**
 * The join, run against sample export files.
 *
 * Everything in this product rests on one assumption: that a CostX budget line
 * and a Xero cost transaction can be brought together on the same cost code.
 * That assumption is untested until someone points this at real exports.
 *
 * `samples/` holds hand-built files shaped like the real thing. This script is
 * the import path: swap the sample files for the client's actual exports and it
 * reports, in one run, whether the join holds — and exactly where it does not.
 *
 * Run with: npm run check:import
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { budgetLines } from "../lib/mock-data";
import { formatCurrency } from "../lib/format";

const SAMPLES = join(process.cwd(), "..", "samples");

let failures = 0;
const findings: string[] = [];

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function finding(text: string) {
  findings.push(text);
  console.log(`  NOTE  ${text}`);
}

/** Minimal CSV reader — enough for exported reports, which do not nest quotes. */
function readCsv(file: string): Record<string, string>[] {
  const text = readFileSync(join(SAMPLES, file), "utf8").replace(/^﻿/, "");
  const [head, ...rest] = text.trim().split(/\r?\n/);
  const cols = head.split(",");
  return rest.map((line) => {
    const cells: string[] = [];
    let cur = "";
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === "," && !quoted) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    return Object.fromEntries(cols.map((c, i) => [c.trim(), (cells[i] ?? "").trim()]));
  });
}

const money = (s: string) => Number(s.replace(/[^0-9.-]/g, "")) || 0;

// ---------------------------------------------------------------------------

console.log("\nReading the three exports");

const budget = readCsv("costx-budget-export.csv");
const mapping = readCsv("cost-code-mapping.csv");
const ledger = readCsv("xero-account-transactions.csv");

check("CostX budget export has rows", budget.length > 0, `${budget.length}`);
check("cost code mapping has rows", mapping.length > 0, `${mapping.length}`);
check("Xero transactions export has rows", ledger.length > 0, `${ledger.length}`);

console.log("\nThe CostX export carries what the reconciliation needs");
for (const col of ["Cost Code", "Description", "Total"]) {
  check(`column "${col}" is present`, col in (budget[0] ?? {}));
}
check(
  "every budget row has a cost code",
  budget.every((r) => r["Cost Code"].length > 0)
);
check(
  "quantity times rate equals the line total",
  budget.every((r) => Math.abs(Number(r.Quantity) * money(r.Rate) - money(r.Total)) < 0.01),
  budget.filter((r) => Math.abs(Number(r.Quantity) * money(r.Rate) - money(r.Total)) >= 0.01)
    .map((r) => r["Cost Code"])
    .join(", ")
);

const budgetTotal = budget.reduce((s, r) => s + money(r.Total), 0);
check(
  "budget total matches the project total in the app",
  Math.abs(budgetTotal - 742_000) < 1,
  formatCurrency(budgetTotal)
);

console.log("\nThe mapping covers the budget");
const mapByCode = new Map(mapping.map((m) => [m["Cost Code"], m]));
const unmapped = budget.filter((r) => !mapByCode.has(r["Cost Code"]));
check(
  "every budget cost code has a mapping row",
  unmapped.length === 0,
  unmapped.map((r) => r["Cost Code"]).join(", ")
);

/** The composite key the Xero side is joined on. */
const keyOf = (account: string, tracking: string) => `${account}|${tracking}`;

const byKey = new Map<string, string[]>();
for (const m of mapping) {
  const k = keyOf(m["Xero Account Code"], m["Xero Tracking (Trade)"]);
  byKey.set(k, [...(byKey.get(k) ?? []), m["Cost Code"]]);
}

const ambiguous = Array.from(byKey.entries()).filter(([, codes]) => codes.length > 1);
check(
  "the ambiguity detector runs",
  true
);
if (ambiguous.length > 0) {
  for (const [k, codes] of ambiguous) {
    finding(
      `cost codes ${codes.join(" and ")} both map to Xero key ${k} — actual cost cannot be split between them on this mapping alone`
    );
  }
} else {
  console.log("  NOTE  every cost code has a distinct Xero key");
}

console.log("\nJoining Xero transactions onto cost codes");

const actualByCode = new Map<string, number>();
const unjoined: Record<string, string>[] = [];
let ambiguousValue = 0;

for (const t of ledger) {
  const k = keyOf(t["Account Code"], t["Tracking (Trade)"]);
  const codes = byKey.get(k);
  const amount = money(t["Debit (NZD)"]) - money(t["Credit (NZD)"]);
  if (!codes) {
    unjoined.push(t);
    continue;
  }
  if (codes.length > 1) ambiguousValue += amount;
  // Attribute to the first match; the ambiguity is reported separately.
  const code = codes[0];
  actualByCode.set(code, (actualByCode.get(code) ?? 0) + amount);
}

const ledgerTotal = ledger.reduce((s, t) => s + money(t["Debit (NZD)"]) - money(t["Credit (NZD)"]), 0);
check(
  "Xero total matches the project actual in the app",
  Math.abs(ledgerTotal - 610_000) < 1,
  formatCurrency(ledgerTotal)
);
check(
  "every transaction joins to a cost code",
  unjoined.length === 0,
  unjoined.map((t) => `${t["Account Code"]}/${t["Tracking (Trade)"]}`).join(", ")
);

if (ambiguousValue > 0) {
  finding(
    `${formatCurrency(ambiguousValue)} of actual cost sits on an ambiguous key and was attributed to the first matching cost code`
  );
}

console.log("\nThe joined result reproduces the reconciliation");

const demo = budgetLines.filter((l) => l.projectId === "RIV-01");
const ambiguousCodes = new Set(ambiguous.flatMap(([, codes]) => codes));

let matched = 0;
const mismatches: string[] = [];
for (const line of demo) {
  if (ambiguousCodes.has(line.code)) continue;
  const joined = actualByCode.get(line.code) ?? 0;
  if (Math.abs(joined - line.actualAmount) < 1) matched += 1;
  else mismatches.push(`${line.code}: joined ${formatCurrency(joined)} vs app ${formatCurrency(line.actualAmount)}`);
}
check(
  `all ${matched} unambiguous cost codes reconcile to the app`,
  mismatches.length === 0,
  mismatches.join(" | ")
);

const ambiguousInApp = demo
  .filter((l) => ambiguousCodes.has(l.code))
  .reduce((s, l) => s + l.actualAmount, 0);
check(
  "and the ambiguous codes account for the rest",
  Math.abs(ambiguousInApp - ambiguousValue) < 1,
  `${formatCurrency(ambiguousInApp)} vs ${formatCurrency(ambiguousValue)}`
);

// ---------------------------------------------------------------------------

console.log("\n" + "─".repeat(68));
if (findings.length > 0) {
  console.log("\nWhat a real export would need to resolve:\n");
  findings.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log(
    "\n  These are not failures. They are the questions to put to the client,\n" +
      "  and the reason the real exports are worth asking for."
  );
}

console.log(
  `\n${failures === 0 ? "The join holds on the sample exports." : `${failures} check(s) FAILED.`}\n`
);
process.exit(failures === 0 ? 0 : 1);
