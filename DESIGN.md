---
name: BuildLedger
description: Construction finance, joined up. A ruled reconciliation sheet where every figure carries its source.
colors:
  ink: "hsl(30 8% 9%)"
  paper: "hsl(40 12% 96%)"
  sheet: "hsl(40 25% 99%)"
  chrome: "hsl(40 9% 93%)"
  quiet-fill: "hsl(40 9% 92%)"
  accent-wash: "hsl(40 10% 91%)"
  graphite: "hsl(30 5% 38%)"
  rule: "hsl(35 8% 84%)"
  rule-strong: "hsl(35 8% 78%)"
  over: "hsl(352 85% 44%)"
  over-soft: "hsl(352 70% 96%)"
  over-border: "hsl(352 60% 84%)"
  warn: "hsl(30 90% 33%)"
  warn-soft: "hsl(40 85% 93%)"
  warn-border: "hsl(38 70% 76%)"
  ok: "hsl(152 55% 28%)"
  ok-soft: "hsl(145 35% 93%)"
  ok-border: "hsl(148 30% 76%)"
  src-costx: "hsl(230 38% 42%)"
  src-xero: "hsl(196 60% 31%)"
  src-ezzybills: "hsl(280 28% 43%)"
  src-approvalmax: "hsl(248 22% 46%)"
  src-m365: "hsl(210 12% 36%)"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "42px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
    fontFeature: "\"tnum\""
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"tnum\""
  body-sm:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
    lineHeight: 1.25
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.4
  tag:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: "15px"
    letterSpacing: "0.01em"
rounded:
  sm: "1px"
  md: "2px"
  lg: "3px"
spacing:
  row-y: "7px"
  item-y: "10px"
  gap: "12px"
  gutter: "16px"
  gutter-md: "20px"
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "hsl(30 8% 9% / 0.85)"
  button-outline:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "32px"
  button-outline-hover:
    backgroundColor: "{colors.accent-wash}"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    size: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.accent-wash}"
  source-tag-costx:
    textColor: "{colors.src-costx}"
    typography: "{typography.tag}"
    rounded: "{rounded.sm}"
    padding: "0 4px"
  source-tag-xero:
    textColor: "{colors.src-xero}"
    typography: "{typography.tag}"
    rounded: "{rounded.sm}"
    padding: "0 4px"
  source-tag-approvalmax:
    textColor: "{colors.src-approvalmax}"
    typography: "{typography.tag}"
    rounded: "{rounded.sm}"
    padding: "0 4px"
  status-badge-over:
    backgroundColor: "{colors.over-soft}"
    textColor: "{colors.over}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  status-badge-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  status-badge-ok:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "1px 6px"
  clock-badge-over:
    backgroundColor: "{colors.over-soft}"
    textColor: "{colors.over}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  clock-badge-warn:
    backgroundColor: "{colors.warn-soft}"
    textColor: "{colors.warn}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  clock-badge-neutral:
    backgroundColor: "{colors.quiet-fill}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  nav-item:
    textColor: "{colors.graphite}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
  nav-item-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
  filter-segment-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  ledger-row:
    typography: "{typography.body}"
    padding: "7px 12px"
  ledger-sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "0"
---

# Design System: BuildLedger

## Overview

**Creative North Star: "The Reconciliation Sheet"**

BuildLedger is drawn as a single ruled sheet of a finance ledger laid on a Swiss grid, not as a dashboard of cards. Warm paper ground, near-black ink, and 1px rules do the structural work; there are no tinted panels, no card stacks and no shadows on the page. Density is high on purpose: a QS reads eighteen cost codes and nine columns at once, a director reads one large red figure. Both are served by the same sheet because emphasis is rationed, not because content is thinned.

Colour is semantic before it is anything else. One red owns overrun and exceptions; amber owns anything waiting on someone or approaching a statutory clock; green appears only when something is approved, met or compliant — never for a live connection, because the demo has none, and never for model confidence. Everything else is ink and graphite. The five source systems each get a quiet, low-chroma hue used only as an outlined tag, so provenance is always present and never louder than status.

Type is one neo-grotesque (Archivo) in tight, small steps with tabular figures everywhere money appears, and one monospace (JetBrains Mono) reserved for identifiers: cost codes, project codes, PO and bill references. The signature component is the budget-to-forecast bridge, which steps from the CostX budget to the forecast at completion one trade at a time. Every page in the shell is recomposed on the sheet. Boards that used to be kanban columns (invoices, the tender pipeline) are one ledger with a section per stage: a light head band naming the stage, the owning system as a 6px square, the count and the total, then ruled rows. Pages build from `components/ledger/` (title band, section head, ruled figure) and the portfolio ledger (`ProjectsTable`, `compact` and `full`).

**Key Characteristics:**
- One bordered sheet per page, divided by hairline rules; section heads sit on a 1px ink rule.
- Red appears only on overrun figures, exception markers and overdue-on-us clocks.
- Every key figure has an outlined source tag beside it or in its column header.
- Tabular figures throughout; mono only for identifiers.
- Near-square corners (1-3px); flat on the page, one shadow for floating layers only.
- Light first, with a full warm-dark counterpart driven by the same token names.

## Colors

A warm achromatic ledger with three fixed status hues and five muted provenance hues; no brand accent.

### Primary
- **Ledger Ink** (`ink`): Text, primary buttons, the active nav item and active filter segment (inverted to ink ground, paper text), section-head rules, total rules, bridge total bars when on budget. In dark mode it flips to warm off-white (`hsl(40 14% 91%)`).

### Secondary
- **Overrun Red** (`over`): Over-budget figures, the headline overrun, overrun bridge steps and the forecast bar when over, the square marker beside an over-forecast cost code, high-severity exception markers, exception tags (Duplicate bill, No PO), overdue clocks that are ours to meet. Soft (`over-soft`) and border (`over-border`) tints carry it in badges.
- **Pending Amber** (`warn`): Pending approval, Variation not in budget, statutory clocks within three working days, medium-severity exception markers. Same soft/border pairing (`warn-soft`, `warn-border`).
- **Cleared Green** (`ok`): Approved, paid, on track, Met clocks, the "systems connected" square. Never used for a favourable variance.

### Tertiary
- **CostX Slate Blue** (`src-costx`), **Xero Teal** (`src-xero`), **EzzyBills Plum** (`src-ezzybills`), **ApprovalMax Lavender Grey** (`src-approvalmax`), **Microsoft 365 Steel** (`src-m365`): provenance only. Each appears as tag text with a 45%-opacity border of the same hue, or as a small square in legends. Hues are deliberately held clear of red, amber and green. Matching `-soft` fills remain in the stylesheet but no page uses them; source tags and the inbox class tags are outline only.

### Neutral
- **Paper** (`paper`): Page ground behind the sheet.
- **Sheet White** (`sheet`): The ledger sheet itself, popovers, outline buttons.
- **Chrome Stone** (`chrome`): Sidebar, and the opened records panel under a cost-code row (at 70%); one step darker than the work area.
- **Quiet Fill** (`quiet-fill`): Secondary buttons, neutral clock badges, track behind progress.
- **Accent Wash** (`accent-wash`): Hover ground for outline and ghost buttons.
- **Graphite** (`graphite`): Secondary text, column headers, labels, under-budget and zero variances.
- **Hairline** (`rule`): Every row divider, sheet border and column split.
- **Strong Hairline** (`rule-strong`): Input strokes and scrollbar thumbs.

### Named Rules
**The One Red Rule.** Red means over budget or exception, and nothing else. A favourable or zero variance stays graphite (rendered as an em dash when zero), never green.

**The Provenance Recedes Rule.** Source tags are outlined in the system's own hue and never filled, never bolder than the figure they annotate; a red overrun must always read before its tag.

**The Ink Is the Accent Rule.** There is no brand colour. Primary actions and active states are an ink inversion of the ground.

## Typography

**Display Font:** Archivo (with ui-sans-serif, system-ui)
**Body Font:** Archivo
**Label/Mono Font:** JetBrains Mono (with ui-monospace), identifiers only

**Character:** A plain, slightly wide grotesque set small and tight, carrying a ledger's worth of numbers without decoration; the mono is a clerical voice for references, never for prose or amounts.

### Hierarchy
- **Display** (600, 42px, 34px below `sm`, line-height 1, -0.02em, tabular): The forecast overrun figure only. It is deliberately the largest type on the page.
- **Headline** (600, 30px, 26px below `sm`, -0.02em): The page title (project name).
- **Figure** (600, 22px, -0.01em, tabular): Ruled figures in the column beside the bridge (committed, actual, margin, variations).
- **Title** (600, 15px, -0.01em): Section heads on the sheet (Cost codes, Exceptions, Statutory deadlines) and the sidebar wordmark.
- **Body** (400/500, 13px): Table cells, list item titles, nav items. Trade names in the table are 500.
- **Body small** (400, 12.5px, line-height 1.375): Section descriptions, exception descriptions, bridge rows.
- **Label** (500, 12px): Figure labels, breadcrumbs, records-panel headings (600), status badges.
- **Caption** (500, 11.5px): Column headers, footnotes, meta lines under records.
- **Code** (JetBrains Mono 400, 11.5px; 11px inside records): Cost codes, project codes, PO and bill references.
- **Tag** (600, 10px, 15px line, 0.01em): Source tags. Exception and variation inline tags use 10.5px 500.

### Named Rules
**The Tabular Rule.** Every money figure, percentage and count is set with tabular numerals (the whole table inherits it) so columns align digit for digit.

**The Mono Is for Identifiers Rule.** Mono marks something you could look up in a source system: a code or a reference number. Amounts, labels and headings never use it.

**The Size of the Question Rule.** The answer to "how much is this job losing" is set larger than the job's name.

## Layout

The page is one bordered sheet at a max width of 1440px, centred in a main area padded 16px (24px from `lg`). Above it, a title band without a container: mono breadcrumb code, headline, a meta line split by short vertical hairlines (client, status badge, variation count) and the single outline action aligned right.

Inside the sheet, sections are stacked and divided by hairlines. The first section is a 12-column grid at `lg`: the bridge spans 8 columns, the ruled figures span 4 with a hairline left border; below `lg` the figures drop under the bridge as a 2-up grid (`sm`) or a single column. The cost-code table runs full width. The foot of the sheet splits 8 | 4 (Exceptions | Statutory deadlines) at `lg`, stacked below. An opened cost code shows its records in a 3 / 4 / 5 column split (budget line, purchase orders, bills) from `md`.

Spacing rhythm is small and fixed: section padding 16px (20px from `md`) horizontally and 16px on top; list items 10px vertically; table rows 7px vertically with 12px cell gutters; title band and sheet separated by 16px. The table progressively drops columns: phones keep code, trade, variance and the drill-down; `sm` adds forecast; `md` adds budget, committed, actual and percent; `lg` adds the spent-of-forecast bar. The sidebar (224px) appears at `lg`; below it navigation moves to a header menu.

**The One Sheet Rule.** Sections of a page are ruled divisions of one sheet, not separate cards with gaps between them.

**The Ruled Head Rule.** A section head sits on a 1px ink rule; rows within it are divided by hairlines; a total sits under a 1px ink rule and closes with an accountant's double rule.

**The Shared Lines Rule.** From `xl` the whole sheet sits on one set of 12 zero-gutter column lines measured edge to edge of the sheet (gutters live inside cells: 12px, 20px at the sheet edge and on the 8 line). The bridge rows go full-bleed: labels over columns 1-3, bar track over 4-7, amount in 8. The axis always splits into exactly four intervals (`getBridgeAxis`, asserted in `npm run check`), so the tick lines are column lines 3-7. The table is fixed-layout with a 12-column `colgroup`: code and trade 1-4, budget 5, committed 6, actual 7, spent 8, forecast 9-10, variance 11, percent 12; the spent meter sits under its percentage at that width. Line 8 is the spine: bridge | figures, spend to date | position at completion, Exceptions | Statutory deadlines. Records panels split on lines 3 and 7, the bridge track's ends. Bridge cost codes and trade names hang on the same 48px and 108px lines as the table's; exception text hangs on the 48px line. The dashboard's compact portfolio ledger uses the same lines from `xl` (code and project 1-3, status 4, budget 5, committed 6, actual 7, spent of budget 8 | variance bar 9-10, forecast 11, variance with its percent beneath 12), and the exceptions list sits on them from `lg` (exception 1-5, project 6-7, detected from 8-9, amount 10, link 11-12) under summary figures split on lines 5 and 9. Progress claims share one set of columns from `lg` (code and description 1-5, contract value 6-7, complete 8, previously claimed 9-10, this claim 11-12); each claim closes on its double rule, so the next claim adds no hairline. Below `xl` the table returns to auto layout (tagged headers stack label over tag from `lg`), and the bridge keeps its rem columns; only the 8 | 4 splits remain shared.

## Elevation & Depth

The page is flat. Depth is expressed by tone (chrome sidebar and opened records panel one step darker than the sheet; paper ground one step darker than the sheet) and by rules, never by shadow. Exactly one shadow exists, and it belongs to layers that float above the page: dropdown menus, tooltips and the search popover.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 2px 4px -1px rgb(24 20 16 / 0.08), 0 12px 28px -8px rgb(24 20 16 / 0.22)`): Menus, tooltips, search results. Nothing that sits in the page flow.

### Named Rules
**The Flat Sheet Rule.** Nothing in the page flow casts a shadow; if a surface needs separating, give it a rule or a tone step.

## Shapes

Corners are near-square: 3px for floating layers, 2px for buttons, clock badges and filter segments, 1px for status badges, source tags and nav items. The sheet itself is square-cornered. Markers are true squares, not dots: 8px for exception severity, 6px for an over-forecast code and the connected indicator, and the brand mark is an ink block cut by ruled lines. Bars in the bridge and the spent-of-forecast meter are square-ended. The bridge marks its cut axis with a double-slash break on the total bars and joins steps with short dashed ink connectors. The only round element is the user avatar.

**The Near-Square Rule.** No radius above 3px, and no pill shapes; status reads from colour and words, not from soft lozenges.

## Components

### Buttons
Restrained ink tools; there is usually one per title band.
- **Shape:** Gently squared (2px).
- **Primary:** Ink ground, sheet text, 36px high, 16px horizontal padding; hover drops the ink to 85%.
- **Outline:** Sheet ground with an ink stroke at 25%, 32px high in the small size; hover strengthens the stroke to 60% and washes the ground. This is the page-level action style (Ask about this project).
- **Ghost:** Icon-only 36px squares in the header (help, theme, reset); hover washes the ground.
- **Destructive / Success:** Over and ok grounds with white text, for reject and approve actions only.
- **Focus:** 2px ink ring with 2px offset on every focusable element.

### Source Tags
The product's core idea made visible.
- **Style:** 10px semibold text in the system's hue, 1px border of the same hue at 45%, 1px corners, 4px horizontal padding, no fill.
- **Placement:** Beside a figure's label, inside table column headers, in records-panel headings, and in a "built from" line under the headline figure. The short system name is used in tight spots.

### Status and Inline Tags
- **Status badge:** 12px medium, 1px corners, soft tint ground with matching border and status-hue text (over, warn, ok); a neutral variant is an ink-20% outline.
- **Inline exception tags in table rows:** outline-only, 10.5px, over-border stroke with red text (Duplicate bill, No PO) or warn-border with amber text (Variation not in budget).

### Statutory Clock Badge
- **Style:** 12px medium with a 14px leading icon (clock, warning, check), 2px corners, soft-tint ground and border.
- **Tones:** Red when we are overdue; amber within three working days; green when met; ink at 10% when the other party is overdue (an entitlement reads as information, not danger); neutral otherwise. The due date is always shown with the countdown wherever the detail form is used.

### Ledger Table (signature)
- **Rows:** 13px, 7px vertical padding, hairline dividers, hover a 2.5% ink wash, open a 3.5% ink wash. Variance and percent are right-aligned; only over-forecast values turn red and semibold.
- **Header:** 11.5px graphite, source tags inline; sortable columns show an arrow only when active.
- **Drill-down:** a chevron that rotates 90 degrees over 200ms; the records panel fades and slides in over 200ms on the chrome tone, with three record lists each closed by an ink-70% rule and its total. Bills not counted in actual are struck through in graphite.
- **Filter:** a segmented control with an ink-25% stroke; the active segment inverts to ink.
- **Footer:** semibold totals under a 1px ink rule, then a 5px double ink rule.

### Budget-to-Forecast Bridge (signature)
- Rows of label, bar track and right-aligned signed amount (12.5px). Total bars are full ink (or red when the forecast is over); overrun steps are red; any favourable step is ink at 30%. Tick lines are hairlines at 70%; tick labels are 11px graphite, only end ticks shown on phones.
- Each trade step is a button: hover underlines the label and washes the row; choosing one opens that cost code in the table, scrolls it into view (instantly under reduced motion) and flashes the row once, fading over 700ms. The flash takes the row's own status tone; it is not a red selection colour.
- A footnote always states where the cut axis starts.

### Ruled Figures
- Label (12px graphite) with source tags right-aligned, figure in the 22px figure style, a 12px graphite note beneath; stacked with hairlines between, 20px horizontal and 14px vertical padding. The figure turns red only when it is an overrun or a margin loss.

### Navigation
- **Sidebar:** chrome ground, 224px, hairline right border, 48px wordmark row. Items are 13px medium graphite with 15px icons at 1.75 stroke; hover is a 6% ink wash; active inverts to ink ground with paper text. Counts are right-aligned tabular 11.5px, red only for exception-type counts. A footer row shows the connected-systems square in green.
- **Header:** 48px, paper ground, hairline bottom; project switcher, search, icon tools, user.
- **Mobile:** a ghost menu button opens a dropdown carrying the same items, active item inverted to ink.
- **Demo banner:** a full-width ink strip with 11.5px paper text above everything, always present.

## Do's and Don'ts

### Do:
- **Do** set every money figure with tabular numerals and right-align it in columns.
- **Do** put an outlined source tag next to every key figure or in its column header, in that system's hue at the tag size.
- **Do** build pages as one bordered sheet divided by hairlines, with section heads on a 1px ink rule.
- **Do** close totals with a 1px ink rule and the 5px double rule.
- **Do** use square markers (6px or 8px) for severity and state, not dots.
- **Do** keep favourable and zero variances graphite, with an em dash for zero.
- **Do** use mono only for codes and reference numbers.
- **Do** honour reduced motion for scroll and panel transitions.

### Don't:
- **Don't** use red for anything other than over budget and exceptions, including selection, brand or emphasis.
- **Don't** use green for a favourable variance; green means approved, paid, met or connected.
- **Don't** fill source tags or give them a status hue.
- **Don't** split a page into a row of KPI cards, chart cards and table cards with gaps between them.
- **Don't** put a shadow on anything in the page flow; the overlay shadow is for menus, tooltips and popovers only.
- **Don't** use corners above 3px or pill shapes, except the round user avatar.
- **Don't** set uppercase tracked labels above headings.
