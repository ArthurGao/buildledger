# Build Spec — **BuildLedger** · 施工财务整合平台 · 客户演示前端(Mock 数据)

> **产品名:BuildLedger**。在 UI 里全程用这个名字——app 标题、侧边栏顶部的 logo 文字、浏览器 tab 标题、假登录页。`Build`=建筑,`Ledger`=账本,合起来点出"把工程和账目对到一起"这个核心。侧边栏 logo 用文字标 "BuildLedger" 配一个简洁图标(lucide 里的 `layers` / `blocks` / `scale` 之类)即可。

> **给 Claude Code 的说明**:请按本文件生成一个**纯前端、纯 mock 数据**的 Next.js 演示应用。目标是给客户演示"整合完成后的成品长什么样",**不接任何真实 API、不写后端、不做真实鉴权**。所有数据来自本地 TypeScript 文件,所有"操作"(审批、路由等)只改本地状态即可。UI 文案一律用**英文**(客户演示用);代码标识符、注释用英文。本 spec 的说明是中文,给人看的,不用出现在产品里。

---

## 0. 一句话背景

一家新西兰/澳洲的**建筑承包公司**,现在用 5 个割裂的系统:CostX(估算/报价)、Xero(记账)、EzzyBills(发票捕获)、ApprovalMax(审批)、Microsoft 365(邮件/文档)。痛点是这些系统互不打通——尤其 **CostX 的项目预算 和 Xero 的实际花销没人自动对**,想知道项目超支没、毛利还剩多少全靠人导 Excel。

本演示要展示"整合平台"做完后的样子:一个统一界面,把这些系统的数据对齐,自动算预算 vs 实际、揪异常、还带一个只读 AI 助手能用自然语言问账。

---

## 1. 技术栈与约束

- **Next.js 14+**(App Router)+ **TypeScript**
- **Tailwind CSS** + **shadcn/ui**(卡片、表格、badge、tabs、dialog、dropdown、input 等)
- **recharts** 画图(柱状/折线/进度条)
- **lucide-react** 图标
- **date-fns** 处理日期
- 状态:React `useState` / `useContext` 即可;**无需后端、无需数据库**。审批等操作改本地 state。可选 `localStorage` 记住 demo 里的状态,但不是必需。
- 所有 mock 数据放 `lib/mock-data.ts`(类型放 `lib/types.ts`)。
- 可一键 `npm run dev` 跑起来,能部署到 Vercel 分享给客户。
- 顶部固定一条 **"DEMO — sample data, no live systems connected"** 提示条,提醒这是演示。

---

## 2. 设计语言

要看起来像**真实的高端 B2B SaaS 产品**,不是线框图。

- 风格:干净、专业、数据密但不吵。参考 Linear / Vercel / 现代财务 dashboard 的质感。
- 布局:**左侧固定侧边栏导航 + 右侧内容区**。顶部有细的 header(项目切换器、搜索、演示提示条)。
- 配色:主色用深蓝/石板灰(slate/indigo);语义色固定含义——**红=超预算/异常,琥珀=接近/待处理,绿=正常/已批**。
- 组件:卡片(带轻边框和微阴影)、干净的数据表格、进度条、小徽章(badge)。圆角适中,留白充足。
- 字体:系统 sans(Inter 之类),数字用等宽或 tabular-nums 让金额对齐。
- **来源徽章**:每个关键数字旁边放一个极小的来源标签(`CostX` / `Xero` / `EzzyBills` / `ApprovalMax`),颜色区分。这是演示的点睛之笔——让客户看懂"整合"把哪些系统的数据拼到了一起。
- 支持浅色为主,深色模式可选(不强求)。
- 货币 **NZD**,格式 `$1,234` 或 `$1,234.56`;GST 按 **15%**。

---

## 3. 信息架构(侧边栏)

侧边栏导航(英文标签):

1. **Dashboard** — 组合概览(所有项目健康度、总预算 vs 实际、待办异常数)
2. **Projects** — 项目列表 → 点进去是项目详情(**核心页:预算 vs 实际逐行对账**)
3. **Invoices** — 应付发票流水线(捕获→编码→审批→待付→已付)
4. **Approvals** — 待审批队列(ApprovalMax 视角)
5. **Exceptions** — 异常面板(重复发票、无 PO 支出、超预算)
6. **Inbox** — 邮件分诊(收件分类→路由)
7. **Assistant** — 只读 AI 助手(自然语言问账,canned 回答)
8. **Integrations** — 集成状态页(展示 5 个系统"已连接",最后同步时间)

---

## 4. 数据模型(`lib/types.ts`)

```ts
type System = 'CostX' | 'Xero' | 'EzzyBills' | 'ApprovalMax' | 'M365';

type ProjectStatus = 'On track' | 'At risk' | 'Over budget';

interface Project {
  id: string;                 // 也是跨系统 join key,如 "RIV-01"
  name: string;
  client: string;
  status: ProjectStatus;
  budgetTotal: number;        // 来自 CostX
  committedTotal: number;     // 已下 PO,来自 Xero/ApprovalMax
  actualTotal: number;        // 已发生实际,来自 Xero
  forecastFinal: number;      // 预测竣工成本
  budgetMarginPct: number;    // 原始毛利 %
  forecastMarginPct: number;  // 预测毛利 %
}

interface BudgetLine {
  projectId: string;
  code: string;               // 如 "05-100"
  description: string;
  budgetAmount: number;       // CostX
  committedAmount: number;    // ApprovalMax/Xero PO
  actualAmount: number;       // Xero 实际
  // 派生:variance = actual - budget, variancePct
}

type InvoiceStatus =
  | 'Captured'          // EzzyBills 刚提取
  | 'Coded'             // 已编码,Xero draft
  | 'Pending approval'  // ApprovalMax 审批中
  | 'Approved'          // 已批
  | 'Awaiting payment'  // Xero 待付
  | 'Paid';

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  projectId: string;
  lineCode: string;           // 对应 BudgetLine.code
  date: string;               // ISO
  amount: number;             // 含税
  gst: number;
  status: InvoiceStatus;
  source: 'Email' | 'Upload';
  hasPO: boolean;
  flags?: ('Duplicate' | 'No PO' | 'Over budget')[];
}

interface ApprovalStep {
  invoiceId: string;
  approver: string;           // 人名
  role: string;               // 如 "Project Manager"
  status: 'Waiting' | 'Approved' | 'Rejected';
  timestamp?: string;
}

type ExceptionType = 'Duplicate invoice' | 'No PO spend' | 'Over budget';

interface ExceptionItem {
  id: string;
  type: ExceptionType;
  severity: 'High' | 'Medium';
  projectId: string;
  description: string;
  relatedInvoiceId?: string;
  amount?: number;
}

type EmailClass = 'Invoice' | 'RFQ' | 'Client query' | 'Subbie quote' | 'Noise';

interface EmailItem {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;         // ISO
  classifiedAs: EmailClass;   // "AI 分类"结果
  routedTo: string;           // 如 "EzzyBills / AP", "Estimating", "PM"
  confidence: number;         // 0-1,展示"AI 置信度"
}

interface IntegrationStatus {
  system: System;
  connected: boolean;
  lastSync: string;           // 如 "2 min ago"
  note?: string;
}

interface ChatQA {
  question: string;
  answer: string;             // 可含简单 markdown / 数字
}
```

---

## 5. Mock 数据(`lib/mock-data.ts` 种子)

下面给足够的种子数据把故事讲圆。**Claude Code 可按同样风格补齐每个项目缺的行**。整体叙事:**Riverside 项目超支 6%,主因是 electrical 和 structural steel 超支**——演示时这个故事要一眼看出来。

### Projects(4 个)

| id | name | client | status | budget | committed | actual | forecastFinal | budgetMargin% | forecastMargin% |
|---|---|---|---|---|---|---|---|---|---|
| RIV-01 | Riverside Office Fitout | Meridian Property Group | Over budget | 742,000 | 698,000 | 610,000 | 786,000 | 12.0 | 6.4 |
| KAU-02 | Kauri Apartments Stage 2 | Kauri Living Ltd | On track | 3,150,000 | 2,240,000 | 1,980,000 | 3,120,000 | 9.5 | 10.1 |
| HOB-03 | Hobsonville Warehouse | Southgate Logistics | At risk | 1,880,000 | 1,510,000 | 1,340,000 | 1,932,000 | 11.0 | 8.7 |
| NEW-04 | Newmarket Retail Refit | Vantage Retail | On track | 465,000 | 290,000 | 205,000 | 458,000 | 14.0 | 14.6 |

### BudgetLines(RIV-01 完整,其余按此模式补几行)

Riverside(RIV-01)——故事核心,超支项标出来:

| code | description | budget | committed | actual |
|---|---|---|---|---|
| 03-100 | Concrete floor slab | 17,000 | 17,000 | 17,400 |
| 03-200 | Reinforcement steel | 4,800 | 5,000 | 5,200 |
| 04-100 | Blockwork | 16,800 | 16,000 | 15,900 |
| 05-100 | Structural steel | 36,000 | 40,000 | 41,500 |
| 06-100 | Carpentry & joinery | 52,000 | 51,000 | 49,000 |
| 08-100 | Windows & glazing | 44,000 | 43,500 | 38,200 |
| 09-100 | Plasterboard & painting | 39,000 | 38,000 | 31,500 |
| 15-100 | Mechanical / HVAC | 88,000 | 84,000 | 79,300 |
| 15-200 | Plumbing | 28,000 | 27,000 | 27,600 |
| 16-100 | Electrical | 61,000 | 70,000 | 72,300 |
| 01-100 | Preliminaries & site | 95,000 | 92,000 | 88,000 |
| 17-100 | Fit-out & fixtures | 71,000 | 68,000 | 45,000 |

> 派生显示:`05-100 Structural steel +$5,500`、`16-100 Electrical +$11,300`、`03-x` 小幅超支——这三行标红。其余绿色/中性。

其他项目每个给 6–10 行同风格数据即可(用不同 trade 组合,大部分 on track,Hobsonville 留 1–2 行轻微超支体现 "At risk")。

### Invoices(~14 条,覆盖各种状态)

至少包含这些"有戏"的:

| invoiceNumber | supplier | projectId | lineCode | date | amount | status | source | hasPO | flags |
|---|---|---|---|---|---|---|---|---|---|
| VLX-4471 | Voltix Electrical | RIV-01 | 16-100 | 2026-09-12 | 12,400 | Pending approval | Email | false | ["No PO"] |
| NST-8890 | Northern Steel Supplies | RIV-01 | 05-100 | 2026-09-10 | 8,900 | Approved | Email | true | [] |
| PAC-2231 | Pacific Concrete Ltd | RIV-01 | 03-100 | 2026-09-08 | 6,200 | Awaiting payment | Email | true | [] |
| PAC-2231 | Pacific Concrete Ltd | RIV-01 | 03-100 | 2026-09-09 | 6,200 | Pending approval | Email | true | ["Duplicate"] |
| TMB-1180 | TimberYard Co | KAU-02 | 06-100 | 2026-09-11 | 22,300 | Paid | Email | true | [] |
| PLR-5567 | PlumbRight Ltd | HOB-03 | 15-200 | 2026-09-13 | 4,750 | Coded | Upload | true | [] |
| GLZ-3020 | ClearView Glazing | RIV-01 | 08-100 | 2026-09-07 | 15,800 | Paid | Email | true | [] |
| … 再补 6–7 条分布在各状态/项目 | | | | | | | | | |

### Approvals(给 Pending 的发票配审批链)

例:VLX-4471 → step1 `Sarah Chen / Project Manager / Waiting`;PAC-2231(dup)→ `Waiting`。已批的显示 approver + 时间。

### Exceptions(3–4 条)

| type | severity | projectId | description | relatedInvoiceId | amount |
|---|---|---|---|---|---|
| Duplicate invoice | High | RIV-01 | PAC-2231 from Pacific Concrete appears twice | PAC-2231 | 6,200 |
| No PO spend | Medium | RIV-01 | Voltix Electrical invoice with no matching PO | VLX-4471 | 12,400 |
| Over budget | High | RIV-01 | Electrical (16-100) $11,300 over budget | — | 11,300 |
| Over budget | Medium | HOB-03 | Structural steel trending over | — | 3,400 |

### Emails(6 条,展示分类+路由)

| from | subject | classifiedAs | routedTo | confidence |
|---|---|---|---|---|
| accounts@voltix.co.nz | Invoice #4471 — Riverside electrical | Invoice | EzzyBills / AP | 0.98 |
| tenders@newmarket-dev.com | RFQ: Newmarket retail refit — electrical package | RFQ | Estimating | 0.94 |
| j.kauri@kaurilliving.co.nz | Re: variation request — Kauri Apartments L3 | Client query | PM (Sarah Chen) | 0.91 |
| sales@blocklayers.nz | Quote for blockwork — Hobsonville warehouse | Subbie quote | Estimating | 0.89 |
| info@buildexpo2026.com | Last chance: BuildExpo early-bird tickets | Noise | Ignored | 0.99 |
| accounts@northsteel.co.nz | Statement + invoice NST-8890 | Invoice | EzzyBills / AP | 0.97 |

### Integrations(5 个都"已连接")

Xero(2 min ago)、CostX(15 min ago,note: "OData API")、EzzyBills(1 min ago)、ApprovalMax(3 min ago)、Microsoft 365(live)。

### AI 助手 canned Q&A(见第 7 节)

---

## 6. 逐页规格

### Dashboard
- 顶部 4 个 KPI 卡:**Total budget**、**Actual to date**、**Forecast margin**(带升降箭头)、**Open exceptions**(数字,红)。每卡角标来源徽章。
- 一张 **Budget vs Actual vs Committed** 分组柱状图(recharts),x 轴=4 个项目。
- 一个 **Projects at a glance** 表:name / client / status badge / budget / actual / forecast margin / 一个迷你进度条(actual/budget)。超支行红色。点击行进项目详情。
- 右侧一列 **Recent exceptions**(前 3 条)+ **Recent activity**(几条"invoice approved / email routed"流水)。

### Projects → 列表 + 详情(**核心页,演示重头**)
列表同上表。详情页(`/projects/[id]`):
- Header:项目名 + client + status badge + 关键数字(budget / committed / actual / forecast final / margin now vs original)。
- **主视觉:Budget vs Actual 逐行对账表**。列:`Code | Description | Budget (CostX) | Committed | Actual (Xero) | Variance $ | Variance %`。Variance 正数标红、负数标绿,右侧一个 mini 横向 bar 直观显示超/欠。表头对应列标来源徽章。
- 一张按 variance 排序的横向条形图,红色条=超支的 trade,一眼看出 electrical / structural steel 是元凶。
- 一个 **"Ask about this project"** 按钮,点了跳到 Assistant 并预填相关问题。

### Invoices
- 一条**横向 pipeline 视图**:6 个状态列(Captured → Coded → Pending approval → Approved → Awaiting payment → Paid),每列下面是该状态的发票卡(supplier / amount / project / flags)。像个看板。
- 或者用表格 + 状态 tab 切换也行。带 flags 的发票(Duplicate/No PO)显红色角标。
- 点发票开 dialog:显示提取字段(supplier、amount、GST、line code、project)、来源(Email/Upload)、附件占位、审批链。**"Approve" 按钮**只改本地状态(演示用),把卡片移到下一列。

### Approvals
- ApprovalMax 视角:待审批队列表。列:invoice / supplier / project / amount / requested by / current approver / age。
- Approve / Reject 按钮(改本地状态)。展示"审批链"可视化(step1 → step2)。

### Exceptions
- 卡片列表,按 severity 排序。每张:类型图标 + 描述 + 涉及项目/发票 + 金额 + "View" 链接。
- 顶部小计:`3 High · 1 Medium`。
- 这页强调"系统自动揪出来的问题",配一句副标题:"Automatically surfaced from across Xero, CostX and ApprovalMax."

### Inbox(邮件分诊)
- 邮件列表,每行:发件人 / 主题 / 时间 / **分类 badge**(Invoice/RFQ/Client query/Subbie quote/Noise,不同颜色)/ **routed to** / 置信度小条。
- 副标题:"Incoming mail is auto-classified and routed — invoices to AP, RFQs to estimating, client queries to the PM."
- 点一封开 dialog 显示"为什么这样分类 + 路由到哪"。演示 AI 感知 + 确定性路由的配合。

### Assistant(只读 AI 助手)
- 聊天界面:消息气泡 + 底部输入框 + **一排建议问题 chips**(点了直接问)。
- 用第 7 节的 canned Q&A:用户消息匹配到 canned 问题就回对应答案(可做简单模糊匹配/关键词);答案里含具体数字,引用 mock 数据。
- 每条回答底部标一行小字:"Read-only · sourced from CostX + Xero"。强调它只读、不动钱。
- 顶部一句说明:"Ask about budgets, spend, margins or exceptions in plain English."

### Integrations
- 5 张系统卡:logo 占位 + 名字 + 绿点 "Connected" + last sync + note。
- 副标题讲整合故事:"Your existing tools stay in place — this platform reads from them and joins the data."

---

## 7. AI 助手 canned Q&A(放 `lib/mock-data.ts`)

至少这 6 组,答案用 mock 数字,可含简单列表:

1. **Q: Which projects are over budget?**
   A: Riverside Office Fitout is tracking **6% over** — forecast final $786k vs $742k budget. The overrun is driven by **Electrical (+$11,300)** and **Structural steel (+$5,500)**. Hobsonville Warehouse is *at risk* (forecast margin down to 8.7%). Kauri and Newmarket are on track.

2. **Q: Why is Riverside over budget?**
   A: Two trades account for most of it: **Electrical (16-100)** is $72,300 actual vs $61,000 budget (+$11,300), and **Structural steel (05-100)** is $41,500 vs $36,000 (+$5,500). A $12,400 Voltix Electrical invoice with **no matching PO** is still pending approval and would push electrical further over.

3. **Q: What's committed vs budget on Kauri Apartments Stage 2?**
   A: Budget $3.15M · Committed $2.24M · Actual $1.98M. Forecast final $3.12M — currently **on track**, forecast margin 10.1% (slightly above the 9.5% baseline).

4. **Q: Any duplicate invoices this month?**
   A: Yes — **Pacific Concrete PAC-2231** ($6,200, Riverside) appears twice, dated 8 and 9 Sep. One is already *awaiting payment*; the duplicate is flagged and held.

5. **Q: What spend has no PO?**
   A: One item: **Voltix Electrical VLX-4471**, $12,400 on Riverside (Electrical), received by email, no matching purchase order. Flagged and pending approval.

6. **Q: Show me margin across all projects.**
   A: (小表)Riverside 12.0% → **6.4%**;Kauri 9.5% → 10.1%;Hobsonville 11.0% → **8.7%**;Newmarket 14.0% → 14.6%. Two projects eroding: Riverside and Hobsonville.

输入框里没匹配到时,给个兜底回答:"This is a demo — try one of the suggested questions above."

---

## 8. 演示护栏

- 顶部常驻提示条:**"DEMO — sample data, no live systems connected."**
- 所有写操作(approve/reject/route)只改本地 state,不持久化到任何后端。
- 不要做登录墙;若想要仪式感,可放一个 BuildLedger 品牌的简单欢迎页,一个假的"Sign in with Microsoft"按钮直接进 dashboard。
- 不要引用任何真实公司/品牌 logo;供应商、客户名都是编的。

---

## 9. 建议构建顺序(给 Claude Code)

1. 初始化 Next.js + Tailwind + shadcn/ui,配好设计 token(颜色、字体、来源徽章样式)。
2. `lib/types.ts` + `lib/mock-data.ts`(先把第 5、7 节数据落进去,补齐缺的行)。
3. App shell:侧边栏 + header + 演示提示条 + 路由骨架。
4. Dashboard(KPI 卡 + 图 + 项目表)。
5. Projects 列表 + **项目详情对账页**(优先做好这个,是演示重头)。
6. Invoices pipeline + Approvals。
7. Exceptions + Inbox。
8. Assistant(canned 聊天)。
9. Integrations 页。
10. 最后统一打磨视觉:间距、空状态、hover、加载骨架、来源徽章一致性。

做完确保 `npm run dev` 能跑、能部署 Vercel。

---

## 10. 成功标准

客户点开后,**30 秒内能自己看懂**:
- 哪个项目在亏、亏在哪个 trade(Riverside 详情页);
- 系统自动揪出了重复发票和无 PO 支出(Exceptions);
- 能用大白话问账、马上有答案(Assistant);
- 这些数来自他现有的 Xero / CostX,只是被"拼"到了一起(来源徽章 + Integrations 页)。
