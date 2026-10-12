---
target: 全站 对照 DESIGN.md
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/arthurgao/Code/project/buildledger/frontend/app/(shell)"
timestamp: 2026-10-11T20-15-27Z
slug: frontend-app-shell
---
# Critique: whole site vs DESIGN.md (2026-10-12)
Method: dual-agent (A: design review · B: detector + browser)

## Heuristics — 28/40
1 Status 3 (fake "Last sync 2 min ago") · 2 Real world 4 · 3 Control 2 (one-click Approve/Reject, no undo per row) · 4 Consistency 2 (two design systems: h1 24 vs 30, KpiCard vs RuledFigure) · 5 Error prevention 2 (solid green Approve on Duplicate/No PO invoices) · 6 Recognition 3 (INV-001 internal ids on Exceptions) · 7 Efficiency 3 · 8 Aesthetic 3 · 9 Error recovery 3 (EXC-06 day-count contradiction) · 10 Help 3

## Specificity
Migrated 6 routes (/, /projects, /projects/[id], /exceptions, /claims, /assistant) are authored and on the scale; 8 routes (pipeline, variations, purchases, invoices, approvals, retentions, inbox, integrations) are generic shadcn: PageHeader h1 24px, KpiCard figures 30px, text-sm 14px, gradient cards, kanban, rounded-full pills. Detector CLI: 0 findings. Browser overlay: 10px source tags + 11.5px demo banner flagged undersized on every page (intentional per DESIGN, below 11px floor).

## Priority issues
- [P1] Eight routes still on the legacy system (PageHeader/KpiCard/Card; 140 off-scale text classes, 19 rounded-full, 7 plain rounded=4px, input shadow-sm). Fix: migrate like Claims. Cmd: distill/layout then polish.
- [P1] Integrations "Connected · Last sync 2 min ago" + animate-ping + sidebar "5 systems connected" contradict the demo banner (system-card.tsx:54-56). Fix: "Sample export loaded" / "Awaiting read-only access". Cmd: clarify.
- [P1] Approve is solid green variant="success" on flagged invoices, applies instantly (approval-queue.tsx:140). Fix: outline + app dialog listing flags for flagged rows; per-row undo. Cmd: harden.
- [P2] One Red Rule: "Awaiting confirmation" (pipeline/page.tsx:84) and "Not written back" (variations/page.tsx:147) red via tone="over"; green confidence bars (class-badge.tsx:25). EXC-06 copy "Two working days remain" (mock-data.ts:1216) vs live clock "1 working day left". Cmd: colorize/clarify.
- [P2] Mobile: Retentions content 572px in a 358px container (grid without min-w-0, retentions/page.tsx:29,85) hides balance and the generate button; Approvals' Approve needs horizontal scroll. Cmd: adapt.
- [P2] Narrative: Hobsonville +$52,000 > Riverside +$44,000; percent ranking is invisible below md (percent column hidden). Cmd: clarify.

## Personas
Director: "Also over: Hobsonville +$52,000" invites "why isn't that the headline?". Finance: Last sync claim; approve a duplicate; INV-001 vs VLX-4471; "$6k" vs "$5,600". QS: EXC-06 2 days/1 day/overdue; "Not written back" in red reads as overrun. First-timer on phone: Retentions cropped; Approvals hidden behind 4 KPI cards + sideways scroll.

## Minor
loading.tsx skeleton still card layout; AiBadge 4px filled; uppercase tracked labels in page-guide, global-search, system-card READS, dialogs; variance-bar.tsx bg-ok dead code; KpiCard trend text-ok dead path; Assistant 8 chips, 896px container misaligned with sheet edge.
