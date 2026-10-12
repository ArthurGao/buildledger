---
version: 1
slug: "frontend-app-shell-projects-id-page-tsx"
primary_target: "frontend/app/(shell)/projects/[id]/page.tsx"
related_targets: ["frontend/app/(shell)/layout.tsx"]
---

# Surface: project detail (`/projects/[id]`) + app shell

Mode: Operate. Build path: code-led (Operate surface).
Audience: mixed room — director (where is the money going), finance (where did each number come from), QS (cost-code fidelity, records behind a line). Presented live on a projector, then self-served on laptop and phone.
Job: understand in seconds that Riverside forecasts +$44,000 (+5.9%) over budget, driven by Electrical and Structural steel, and that every figure traces back to CostX / ApprovalMax / Xero records.
Constraints: demo banner, source badges on every key number, Riverside narrative, `npm run check` green. Light first, dark kept.

## Direction contract

THESIS: The page is a reconciliation sheet, not a dashboard. It refuses the KPI-card row plus chart-card plus table-card stack; one 12-column hairline grid carries a budget-to-forecast bridge and a dense, expandable cost-code table, and red means only what the product spec gives it — over budget and exceptions.

OWN-WORLD: Swiss international grid crossed with a dense finance ledger. Warm-neutral paper ground, near-black ink, 1px rules as the main structural element, zero shadows, 2px corners. One red (overrun and exceptions) owns emphasis; amber for pending and approaching clocks; green only for approved or connected states; source systems as low-chroma outlined tags. Neo-grotesk sans for everything, tabular figures, mono only for codes and record numbers.

STORY: Visitor sees the forecast overrun and which trades step it up, scans the line table where only overrun figures are red, opens Electrical and sees the CostX line, the POs and the Xero bills behind it, then the exceptions and clocks on the same project.

FIRST VIEWPORT: Title band (mono code, name, client, status, Ask action right). Below, 8 columns: bridge from Budget $742,000 down steps to Forecast $786,000, with +$44,000 · +5.9% set large in red; 4 columns: committed, actual, margin stacked as ruled figures with source tags. The table header and first rows start above the fold.

FORM: User-pinned direction, in the user's words: "新方向是 方向十「高信息密度」做主体，方向六「瑞士网格」管结构和字体" (handbook direction 10 high density as body, direction 6 Swiss grid for structure and type). No concept-seed roll and so no seed key — a pinned direction beats the roll. Signature move: the budget→forecast bridge.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
