import {
  budgetLines,
  emails,
  exceptions,
  invoices,
  opportunities,
  projects,
  purchaseRequests,
  retentionEntries,
  variations,
} from "./mock-data";
import { getContract, getProjectName } from "./derive";
import { formatCurrency } from "./format";

/** A single hit in the global search, already shaped for rendering. */
export interface SearchResult {
  id: string;
  group:
    | "Projects"
    | "Invoices"
    | "Trades"
    | "Exceptions"
    | "Mail"
    | "Variations"
    | "Retentions"
    | "Purchases"
    | "Pipeline";
  title: string;
  subtitle: string;
  href: string;
}

/**
 * Searches the demo dataset across projects, suppliers, invoices, trade lines,
 * exceptions and mail. Plain substring matching — the dataset is small and the
 * point is to show that one search reaches data from every connected system.
 */
export function search(query: string, limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const results: SearchResult[] = [];
  const hit = (text: string) => text.toLowerCase().includes(q);

  for (const p of projects) {
    if (hit(p.name) || hit(p.client) || hit(p.id)) {
      results.push({
        id: `project-${p.id}`,
        group: "Projects",
        title: p.name,
        subtitle: `${p.client} · ${p.status} · ${formatCurrency(p.budgetTotal)} budget`,
        href: `/projects/${p.id}`,
      });
    }
  }

  for (const i of invoices) {
    if (hit(i.supplier) || hit(i.invoiceNumber)) {
      results.push({
        id: `invoice-${i.id}`,
        group: "Invoices",
        title: `${i.supplier} · ${i.invoiceNumber}`,
        subtitle: `${formatCurrency(i.amount)} · ${i.status} · ${getProjectName(i.projectId)}`,
        href: "/invoices",
      });
    }
  }

  for (const l of budgetLines) {
    if (hit(l.description) || hit(l.code)) {
      const variance = l.actualAmount - l.budgetAmount;
      results.push({
        id: `line-${l.projectId}-${l.code}`,
        group: "Trades",
        title: `${l.description} (${l.code})`,
        subtitle: `${getProjectName(l.projectId)} · ${variance > 0 ? "+" : ""}${formatCurrency(variance)} vs budget`,
        href: `/projects/${l.projectId}`,
      });
    }
  }

  for (const e of exceptions) {
    if (hit(e.type) || hit(e.description)) {
      results.push({
        id: `exception-${e.id}`,
        group: "Exceptions",
        title: e.type,
        subtitle: `${e.severity} · ${getProjectName(e.projectId)}`,
        href: "/exceptions",
      });
    }
  }

  for (const m of emails) {
    if (hit(m.subject) || hit(m.from)) {
      results.push({
        id: `email-${m.id}`,
        group: "Mail",
        title: m.subject,
        subtitle: `${m.from} · routed to ${m.routedTo}`,
        href: "/inbox",
      });
    }
  }

  for (const v of variations) {
    if (hit(v.description) || hit(v.costCode)) {
      results.push({
        id: `variation-${v.id}`,
        group: "Variations",
        title: v.description,
        subtitle: `${v.status} · ${getProjectName(v.projectId)} · ${v.costCode}`,
        href: "/variations",
      });
    }
  }

  for (const r of retentionEntries) {
    const contract = getContract(r.contractId);
    if (contract && (hit(contract.counterparty) || hit(r.claimRef))) {
      results.push({
        id: `retention-${r.id}`,
        group: "Retentions",
        title: `${contract.counterparty} — ${formatCurrency(r.amount)} retained`,
        subtitle: `${r.claimRef} · ${getProjectName(r.projectId)}`,
        href: "/retentions",
      });
    }
  }

  for (const r of purchaseRequests) {
    if (hit(r.supplier) || hit(r.costCode) || (r.poNumber && hit(r.poNumber))) {
      results.push({
        id: `purchase-${r.id}`,
        group: "Purchases",
        title: `${r.supplier} · ${formatCurrency(r.amount)}`,
        subtitle: `${r.status} · ${getProjectName(r.projectId)} · ${r.costCode}`,
        href: "/purchases",
      });
    }
  }

  for (const o of opportunities) {
    if (hit(o.name) || hit(o.principal)) {
      results.push({
        id: `opportunity-${o.id}`,
        group: "Pipeline",
        title: o.name,
        subtitle: `${o.status} · ${o.principal}`,
        href: "/pipeline",
      });
    }
  }

  return results.slice(0, limit);
}
