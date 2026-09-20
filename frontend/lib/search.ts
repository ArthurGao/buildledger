import { budgetLines, emails, exceptions, invoices, projects } from "./mock-data";
import { getProjectName } from "./derive";
import { formatCurrency } from "./format";

/** A single hit in the global search, already shaped for rendering. */
export interface SearchResult {
  id: string;
  group: "Projects" | "Invoices" | "Trades" | "Exceptions" | "Mail";
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

  return results.slice(0, limit);
}
