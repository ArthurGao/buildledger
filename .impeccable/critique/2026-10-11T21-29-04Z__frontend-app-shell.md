---
target: 全站 对照 DESIGN.md (迁移后)
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/arthurgao/Code/project/buildledger/frontend/app/(shell)"
timestamp: 2026-10-11T21-29-04Z
slug: frontend-app-shell
---
# Critique: whole site vs DESIGN.md, after the migration (2026-10-12, run 2)
Method: dual-agent (A: design review · B: detector + browser)

## Heuristics: 27/40
1 Status 3 (step 1 of 2 approval not stated) · 2 Real world 3 (INV-001 ids) · 3 Control 3 (undo works) · 4 Consistency 2 (two approve guards, red Variations nav count, provenance flips, two neutral badge styles, assistant frame) · 5 Error prevention 2 (invoice dialog Approve bypasses the reason) · 6 Recognition 3 (k-rounding) · 7 Efficiency 2 (no sort/filter outside cost-code table) · 8 Aesthetic 3 (same four-figure strip on 12 pages) · 9 Recovery 3 · 10 Help 3

## Specificity
All 14 routes on the sheet: h1 30/26, radius <=3 except avatar, no page shadows, no 390 overflow, 0 legacy imports. Detector CLI 0; overlay mostly 10px tags / 11.5px captions (spec-intended), real: 10.5px axis ticks on / (DESIGN says 11px), 2 line-length on /retentions.

## Priority issues
- [P1] Statutory contradictions: EXC-06 overdue / "two working days remain" / badge "1 working day left" (mock-data.ts:1212-1216); sidebar Variations red count is getClockCounts().overdue (sidebar.tsx:21, nav-items.ts:22) i.e. a payment-schedule clock while Variations shows 0 missed. clarify.
- [P1] Approve guard bypass: invoice-dialog.tsx:135 green one-click Approve on flagged invoices; log does not say "step 1 of 2". harden.
- [P1] Provenance mislabels: statutory deadline column tagged ApprovalMax (computed), PO tagged Xero vs copy ApprovalMax, Pipeline value CostX, assistant footer omits ApprovalMax. Proposal: a derived "BuildLedger" tag. audit.
- [P2] Credibility details: View INV-001 links (exception-row.tsx:104), "across 4 projects" hardcoded (claims/page.tsx:198, actually 3), "Messages today" with 9-12 Sep dates, k-rounding where figures reconcile ($40k-$35k vs $5,600), "ANZ New Zealand" real brand (mock-data.ts:980), Hobsonville "At risk" amber while +$52k over. clarify.
- [P3] Library leftovers: uppercase labels (invoice-dialog 66,120; email-dialog 55; payment-schedule-dialog 93; page-guide 82; global-search 109; dropdown-menu 75), disc bullets, mono trade names on Purchases, 14px buttons, two neutral badge styles, assistant frame x=384, inverted primary on Retentions, Chinese labels in page-guide 142/148, 10.5px axis ticks. polish.

## Dead code
page-header, kpi-card, ui/card, variance-bar, projects/variance-chart, ui/progress, ui/scroll-area, ui/tabs: no importers.
