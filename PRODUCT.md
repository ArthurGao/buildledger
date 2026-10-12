# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A mixed room at a New Zealand construction contracting / QS firm. All three must be served by the same screens:

- **Director / owner** — makes the go / no-go call. Non-technical; wants to see at a glance which job is losing money and where.
- **Finance / accounts lead** — lives in Xero and ApprovalMax. Judges whether the reconciliation, exceptions and payment flow look real.
- **QS / commercial manager** — lives in CostX. Judges cost-code fidelity, variations, payment claims and retentions.

The demo is seen two ways: presented live (screen-share or meeting-room display, someone driving), then the Vercel link is left with the client to click through alone afterwards, including on phones. The self-serve viewing is why the 30-second comprehension test exists.

## Product Purpose

BuildLedger is a **client demo** of an integrated finance + estimating platform. It shows what the firm's operation looks like once its five disconnected systems — CostX (estimating), Xero (accounting), EzzyBills (invoice capture), ApprovalMax (approvals), Microsoft 365 (mail/docs) — are joined into one interface on the **cost code**.

Today nobody automatically compares the CostX budget with Xero actuals; whether a job is over budget or what margin is left is answered by exporting to Excel.

Success, in order:

1. The client hands over the data samples and read-only access listed in `system-design.md` §8, so the inferred interface contracts can be validated.
2. That leads to commissioning the real build (backend + real connectors).

Within ~30 seconds a first-time viewer must understand: which project is losing money and on which trade; that the system caught duplicate invoices and no-PO spend; that they can ask questions in plain English; and that the numbers come from their existing Xero / CostX, joined together.

## Positioning

Not another accounting or estimating tool — it replaces neither. It **joins the systems the firm already runs** by cost code, and adds the layer none of them has: line-by-line budget vs actual, exception detection, and the New Zealand statutory layer (Construction Contracts Act working-day deadlines, retention money held on trust, NZS 3910:2023 variation notification). The reconciliation becomes evidence for legally meaningful documents (e.g. a drafted payment schedule with reasons for the scheduled amount), not just a nicer table.

## Operating Context

- Construction contracting in New Zealand; currency NZD, GST 15%.
- Domain vocabulary the users already speak: cost codes / trades, budget, committed (POs), actual, forecast final cost, margin, variations, payment claims, payment schedules, retentions, working days.
- The firm's daily tools are CostX, Xero, EzzyBills, ApprovalMax and Outlook; the demo must read as those systems' data, recognisably joined.

## Capabilities and Constraints

- **Frontend-only demo**: Next.js App Router + TypeScript + Tailwind + shadcn/ui + recharts + lucide-react + date-fns, in `frontend/`. All data is mock (`frontend/lib/mock-data.ts`, types in `frontend/lib/types.ts`). No backend, no real API calls, no auth. Actions (approve, reject, route) mutate local React state only. `backend/` is reserved and out of scope.
- Surfaces: welcome / fake "Sign in with Microsoft", Dashboard, Projects (list + **detail reconciliation — the centrepiece**), Invoices pipeline, Purchases, Approvals, Exceptions, Inbox triage, Variations, Claims, Retentions, Pipeline, Assistant (read-only AI with canned answers), Integrations.
- AI only appears where input is unstructured, and only reads or drafts. Routing, approvals, pricing, final exception judgements and progress sign-off stay deterministic or human. The assistant never moves money.
- A **demo banner** is always visible: `DEMO — sample data, no live systems connected.`
- **Source badges** (`CostX` / `Xero` / `EzzyBills` / `ApprovalMax` / `M365`) on every key number — the core selling point; must stay consistent everywhere.
- Semantic colour meanings are fixed by the spec: red = over budget / exception, amber = near / pending, green = on track / approved.
- UI text in English. Statutory content is based on public legislation and is **not legal advice**.
- Verification: `npm run build`, `npm run lint`, `npm run check` (working-day calendar tests + data integrity + import checks).
- Undecided (system-design §8.2): whether CostX exports by cost code, which Xero dimension carries actual cost, head contractor vs subcontractor role, how retentions are managed today, per-contract vs global terms. Interface contracts in system-design §2 are inferred, not confirmed.

## Brand Commitments

- Product name **BuildLedger** — app title, sidebar logo, browser tab, sign-in page.
- No real company or brand logos; all suppliers and clients are fictional.
- **Fixed demo narrative**: *Riverside Office Fitout is forecast 6% over budget (+$44,000 at completion), driven by Electrical (+$23,000 at completion; +$11,300 already spent past budget) and Structural steel (+$10,500; +$5,500 so far).* Data and visuals must make this obvious at a glance. Variance leads with forecast at completion against budget, never actual-to-date alone.

## Evidence on Hand

- Mock data and three mocked source exports (CostX / Xero / ApprovalMax shapes) with checks in `frontend/scripts/`.
- No real client data, testimonials, customers, metrics or pricing exist. Do not fabricate any; the client is not to be named.

## Product Principles

1. **The join is the product.** Every number shows where it came from; provenance is never decoration.
2. **Losing money must be obvious in seconds.** The director's question — which job, which trade, how much — is answered before anything else.
3. **Credible to the specialist.** Finance and QS must recognise their own systems' data and vocabulary; nothing that would make an expert doubt the reconciliation.
4. **AI reads and drafts; people decide.** Never imply the system approves, prices or pays.
5. **Honest demo.** Clearly sample data, no claims of live connections, no invented proof.

## Accessibility & Inclusion

Must work both on a large shared display (presented live) and on a phone (link left behind). No other product-specific standard established.
