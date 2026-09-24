# BuildLedger 系统设计(初步)

> **与 `demo-frontend-spec.md` 的关系**
> 那份是**当前演示应用**的规格,已实现,范围是「把 CostX 与 Xero 的数据拼到一起给客户看」。
> 本文是**整个系统**的设计,演示应用只是其中的一部分(第 6 节逐项对照)。
>
> **成熟度**:在取得第 8 节列出的资料之前,第 2 节的接口契约属于**基于经验的推断**,不是已确认的规格。
> 唯一有外部依据的是第 3 节的法定流程,出自公开法规;但**不构成法律意见**,落地前须由法律顾问确认。

---

## 1. 范围与边界

### 1.1 两个闭环黑盒(不设计,只定义进出)

| 黑盒 | 组成 | 立场 |
|---|---|---|
| ② QS · 估算 | CostX | 已闭环,不进去重做。只接它的输入输出 |
| ④ 应付 · 审批 | EzzyBills · ApprovalMax · Xero | 同上。发票 OCR 在黑盒内部完成,不重复造轮子 |

### 1.2 三块待设计

| 块 | 说明 |
|---|---|
| ① 商机前端 | 把邮件、会议纪要、聊天里的线索变成结构化商机,产出交给估算黑盒 |
| ③ 执行中枢 | **重心。**采购申请、变更、进度三条并行状态机。它的输出同时是两个黑盒的输入 |
| 贯穿层 | 把两个黑盒的输出按 **cost code** 对齐:对账、竣工预测、异常检测、法定时钟、保留金台账、自然语言问答 |

**为什么 ③ 是重心**:采购申请决定 ④ 收到什么 PO;变更决定 ② 的预算基线要不要改。它不是一个功能,是中枢。

### 1.3 不引入新的第三方系统

应收、保留金台账、法定时钟一并自建。这几样所依赖的数据(按 cost code 的预算明细、实际成本、合同条款)都能从既有黑盒取得。

---

## 2. 黑盒接口契约(推断,待样本验证)

### 2.1 ② QS · 估算(CostX)

**输入**

- 项目基本信息 —— 业主、项目名、地点、工期要求(来自 ① 商机)
- 招标文件 · 图纸 · bill of quantities
- 分包报价(按 trade 归集)
- *历史单价与工效* —— 来自 ④ 的回流,**目前这条不存在**

**输出**

| 字段 | 说明 |
|---|---|
| **预算明细行** | `cost code / description / budget amount / quantity`。**粒度必须到 cost code**,这是逐行对账的左半边 |
| 项目总预算、投标毛利率 | 毛利追踪的基线 |
| 合同金额 · Spec · Schedule | ③ 开工的依据 |

### 2.2 ④ 应付 · 审批(EzzyBills / ApprovalMax / Xero)

**输入**

| 字段 | 说明 |
|---|---|
| 发票文件 | 邮件或上传。字段提取在黑盒内完成 |
| **采购订单(PO)** | 来自 ③ 的采购申请。没有 PO,「无 PO 支出」这类异常就无从判定 |
| **项目 + cost code 映射** | 决定成本归到哪一行。**这张表是否已存在,是重大未知** |
| 审批规则 | 金额门槛、审批层级、指定审批人 |

**输出**

| 字段 | 说明 |
|---|---|
| **实际成本行** | `project / cost code / amount / date`。**必须与左半边同一套 cost code** |
| 承诺成本(committed cost) | 已下 PO 未开票,喂给竣工预测 |
| 审批状态 · 时间戳 · 审批人 | 审批可视化与法定时效监控 |
| 付款状态、异常信号 | Duplicate / No PO |

### 2.3 两条目前不存在的回写线

1. **实际成本 → CostX**:校准下次投标的单价与工效。不做这条,同样的报价错误会重复发生。
2. **已批变更 → 预算基线**:不写回,对账表会把「已批准的变更」误判成「超支」。

---

## 3. 新西兰法定流程

### 3.1 三条法定时钟

| 触发 | 时限 | 逾期后果 | 依据 |
|---|---|---|---|
| 收到分包的 payment claim | 20 working days | **未发出 payment schedule → 索赔全额成为可追讨债务** | Construction Contracts Act 2002 |
| 收到业主或 Contract Administrator 的指令 | 20 working days | **未发出变更通知 → 变更索赔失权** | NZS 3910:2023 |
| 向业主发出 payment claim | 20 working days | 对方未回应 → 我方可直接追讨或申请裁决(**权利,非风险**) | Construction Contracts Act 2002 |

三者共用同一套机制:working day 日历、倒计时、逾期升级、全程留痕。**建一次,用三处。**

补充:payment schedule 在金额有争议时,**必须写明计算方式与差额理由** —— 而逐行对账、超预算、无 PO、重复发票的结论正好就是理由(见 5.2)。

### 3.2 working day 日历(必须一次做对)

排除项:

- 周末
- 公共假期
- **各地区的 anniversary day**(奥克兰与惠灵顿并不同日)
- **12 月 24 日至 1 月 5 日整段**

实现要求:

- 做成数据表 + 测试用例,不用通用工作日函数
- 算出的到期日**永远显示给人确认**,系统不做权威判定,界面措辞需法律顾问定稿

### 3.3 保留金(retention money)

- 须尽快存入新西兰注册银行的**合规信托账户**,并告知银行该账户性质
- **每三个月**须向每个分包出具报告:金额、合同、日期、累计额、账户信息、查账权利告知
- 不合规**构成刑事犯罪**:每项最高 NZD 200,000;法人则每位董事最高 NZD 50,000
- 生效:2023 年修订,2023-10-05

> **待核实**:公司在目标项目里是总承包还是分包。若为总承包,上述义务方就是公司本身;若处在分包位置,则是受益方而非义务方。

### 3.4 变更(variation)的细则

- 成本与工期是**两个独立裁定**
- 工期索赔(EOT)需另附预估延误明细,持续性延误需重复通知
- NZS 3910:2023 已将 Engineer to the Contract 拆为 **Contract Administrator** 与 **Independent Certifier** 两个角色

---

## 4. 数据模型

### 4.1 现有类型(`frontend/lib/types.ts`,已实现)

`System` · `ProjectStatus` · `Project` · `BudgetLine` · `InvoiceStatus` · `InvoiceFlag` · `Invoice`
· `ApprovalStep` · `ExceptionType` · `ExceptionItem` · `EmailClass` · `EmailItem`
· `IntegrationStatus` · `ChatQA` · `ActivityKind` · `ActivityItem` · `BudgetLineWithVariance`

### 4.2 需要新增的类型

```ts
/** 合同 —— 法定时钟与保留金台账的参数全部来自这里,不能做成全局配置 */
export interface Contract {
  id: string;
  projectId: string;
  /** 我方是收款方(对业主)还是付款方(对分包) */
  side: "Principal" | "Subcontractor";
  counterparty: string;
  value: number;
  /** 收到 payment claim 后须回应的工作日数;未约定则按 CCA 的 20 */
  paymentScheduleWorkingDays: number;
  paymentDueWorkingDays: number;
  retentionPct: number;
  /** 通常封顶在合同额的某个百分比 */
  retentionCapPct: number;
  /** practical completion 时释放的比例,其余在 DLP 届满释放 */
  retentionReleaseAtPCPct: number;
  defectsLiabilityMonths: number;
}

/** 法定时钟 —— 三个场景共用一套 */
export type ClockKind =
  | "Payment schedule due"
  | "Payment due"
  | "Variation notice due";

export interface StatutoryClock {
  id: string;
  kind: ClockKind;
  /** 触发它的那张单据 */
  sourceId: string;
  projectId: string;
  contractId: string;
  /** 触发日,按挂钟日期存,不做时区换算 */
  triggeredOn: string;
  workingDays: number;
  /** 算出的到期日 —— 仅供提示,不作权威判定 */
  dueOn: string;
  status: "Open" | "Met" | "Missed";
  /** 逾期后果,直接显示在界面上 */
  consequence: string;
}

/** 变更 */
export interface Variation {
  id: string;
  projectId: string;
  costCode: string;
  /** 触发它的那条沟通,AI 识别出来的 */
  originId?: string;
  origin: "Email" | "Meeting" | "Site instruction" | "Chat";
  raisedOn: string;
  description: string;
  /** 成本与工期分别裁定,可能一个已定一个未定 */
  costImpact: number | null;
  timeImpactDays: number | null;
  status: "Identified" | "Notified" | "Priced" | "Approved" | "Rejected";
  /** 批准后是否已写回预算基线 —— 没写回,对账表会误判成超支 */
  writtenBackToBudget: boolean;
}

/** 进度款申请 */
export interface ProgressClaim {
  id: string;
  projectId: string;
  contractId: string;
  claimNumber: number;
  periodEnd: string;
  servedOn: string | null;
  lines: ProgressClaimLine[];
  grossClaimed: number;
  retentionWithheld: number;
  netClaimed: number;
  status: "Draft" | "Served" | "Scheduled" | "Paid" | "Disputed";
}

export interface ProgressClaimLine {
  costCode: string;
  /** 来自 CostX 的 schedule of values,与 BudgetLine 同源 */
  contractValue: number;
  /** 本期核定完成比例 —— 人核定,系统不算 */
  percentComplete: number;
  previouslyClaimed: number;
  thisClaim: number;
}

/** 保留金台账 */
export interface RetentionEntry {
  id: string;
  contractId: string;
  projectId: string;
  claimId: string;
  withheldOn: string;
  amount: number;
  releasedOn: string | null;
  releaseTrigger: "Practical completion" | "Defects liability period" | null;
}

/** 采购申请 —— ③ 的输出,④ 的输入 */
export interface PurchaseRequest {
  id: string;
  projectId: string;
  costCode: string;
  supplier: string;
  amount: number;
  requestedBy: string;
  status: "Draft" | "Pending approval" | "Approved" | "PO raised";
  poNumber: string | null;
}

/** 商机 */
export interface Opportunity {
  id: string;
  principal: string;
  name: string;
  location: string;
  budgetRange: string | null;
  closesOn: string | null;
  /** AI 从非结构化输入抽取,人确认后才入库 */
  extractedFrom: "Email" | "Meeting minutes" | "Chat";
  confidence: number;
  confirmed: boolean;
  status: "Lead" | "Opportunity" | "Bid" | "No bid" | "Submitted" | "Won" | "Lost";
}

/** cost code 映射 —— 两个黑盒之间的钥匙 */
export interface CostCodeMapping {
  /** CostX 侧 */
  costCode: string;
  /** Xero 侧,二选一或并用 */
  xeroAccountCode?: string;
  xeroTrackingOption?: string;
}
```

---

## 5. AI 介入点

**原则:AI 只在非结构化输入的入口出现,做「读懂」和「起草」两件事。**
往哪走、谁批、什么时候 —— 全是确定性工作流;判断和拍板 —— 全是人。

### 5.1 按价值 ÷ 风险排序

| 序 | AI 做什么 | 位置 | 结论 |
|---|---|---|---|
| 01 | 从现场邮件、聊天、日报**识别出「这是一个变更」**,起草变更单并启动 20 working day 倒计时 | ③ | 首选 |
| 02 | **起草 payment schedule**(含差额理由,见 5.2) | 贯穿层 | 首选 |
| 03 | 判断收到的文件**是否构成合规 payment claim** —— 是则时钟必须启动 | ④ 入口 | 推荐 |
| 04 | 分包报价 PDF → 单价与工程量,自动对到 cost code | ①→② | 推荐 |
| 05 | 邮件 · 会议纪要 → 商机字段 | ① | 卡在数据源,先解决微信 |
| 06 | 合同 · Spec → 关键条款抽取(付款周期、retention 比例与释放条件) | ②→③ | 推荐,它驱动所有时钟 |
| 07 | 会议纪要 → 决议与待办抽取 | ① ③ | 低成本,见效明显 |
| 08 | 文字进度描述 → 结构化完成百分比 | ③ | 只给建议值,人确认 |
| 09 | 招标文件 · 图纸 → 工程量 | ② 入口 | **暂不做**,错一个工程量代价是整个投标报错价 |
| 10 | 自然语言问账 | 贯穿层 | demo 为预置问答,接真实数据需重做 |

### 5.2 为什么 02 值得排到前面

法律要求 payment schedule 在金额有争议时写明**计算方式与差额理由**。
而现有的逐行对账、超预算标记、无 PO、重复发票检测,产出的正好就是「为什么我不认这个金额」。
**这条把现有的对账能力直接变成一份有法律效力的文件,而不只是一张好看的表。**

### 5.3 不要用 AI 的地方

- **定价** —— 组价是 QS 的专业判断
- **决定审批流向** —— 走几级、找谁批是规则,必须确定性
- **判定变更是否成立、是否索赔** —— AI 只负责发现和起草
- **异常的最终判定** —— 本质是规则比对,AI 只在模糊匹配上做辅助
- **进度百分比拍板** —— 直接牵动应收与收入确认,只能是建议值

---

## 6. 前端实现状态

第 7 节列出的六步全部完成。前端现有 15 条路由、32 个类型、两套自动化校验。
仍为**模拟数据、无后端、无真实集成** —— 验证的是呈现与交互,不是与真实系统的对接。

### 6.1 已完成的改造

| # | 位置 | 原状 | 现状 |
|---|---|---|---|
| 1 | `lib/working-days.ts` | 不存在 | NZ working day 日历:周末、公共假期、regional anniversary day、24 Dec–5 Jan。附 41 项测试 |
| 2 | `lib/derive.ts` | `ageInDays()` 按自然日 | `ageInWorkingDays()`,法定期限一律按 working day |
| 3 | Approvals | 「8d」+ 有人拍的 7 天阈值 | 20 working day 法定倒计时,并写明逾期后果 |
| 4 | `ExceptionType` | 3 类 | 6 类,新增 payment schedule 逾期、变更通知逾期、retention 缺口 |
| 5 | 对账表 | 列名 `Code` | `Cost code`;并标出已批准但未写回预算的变更 |
| 6 | Dashboard | 只有预算对账 | 新增法定敞口 KPI 与 statutory deadlines 面板 |
| 7 | 项目详情 | 无 | 接入该项目的法定时钟与变更数 |
| 8 | 全局搜索 | 5 类实体 | 9 类,覆盖变更、retention、采购、商机 |
| 9 | 助手 | 6 组问答 | 9 组,新增法定期限、retention 缺口、未写回变更 |

### 6.2 新增的页面

| 路由 | 内容 |
|---|---|
| `/retentions` | 台账 vs 信托账户、缺口告警、按 subcontract 的上限占比、季度报告入口 |
| `/variations` | 20 working day 通知倒计时、成本与工期分列、未写回预算的标记 |
| `/claims` | progress claim,逐行复用 CostX 的 schedule of values,retention 联动 |
| `/purchases` | 采购申请 → PO,含 cost code 到 Xero account code 的映射展示 |
| `/pipeline` | 商机看板,抽取置信度与人工确认门槛 |

### 6.3 一处模型修正

实现过程中发现原设计把**我方义务**与**对方义务**混为一谈。
`Payment due` 逾期意味着对方没付我们 —— 那是**权利**,不是我方失误。
把两者一起计入「错过的法定期限」会高估风险、并且掩盖了可追讨的债权。

因此 `StatutoryClock` 增加了 `ClockExposure: "Ours" | "Theirs"` 维度:
我方逾期为红色告警,对方逾期为蓝色信息(`Unanswered 14 working days`),
KPI 与角标只统计我方。

### 6.4 校验

| 命令 | 覆盖 |
|---|---|
| `npm run check:days` | 41 项:周末、假期、地区差异、圣诞停工、正反向换算、时钟位置、日历覆盖范围 |
| `npm run check:data` | 全量:合同与投标毛利一致、cost code 映射完整、时钟归属、retention 不超合同上限、claim 行加总、变更未写回、低置信度商机不得自动确认 |
| `npm run check` | 两者依次执行 |

`check:data` 在编写过程中查出四个真实缺陷:一个未映射的 cost code、四个超出合同上限的
retention、上述归属建模错误,以及一处 KPI 引用了错误的时钟。四者现均有断言看守。

## 7. 前端更新顺序(已执行)

1. ~~working day 日历 + 测试~~ ✅
2. ~~`ageInDays` → working days,Approvals 换成法定倒计时~~ ✅
3. ~~保留金台账页~~ ✅
4. ~~变更,带时钟与写回预算基线~~ ✅
5. ~~进度款 / 应收~~ ✅
6. ~~采购申请、商机~~ ✅

演示的叙事已从「我们能对账」升级为「我们不会漏掉法定期限」。

**下一步不在前端**,而在第 8 节:在取得真实样本之前,接口契约仍属推断,
再往下做只会在假设之上叠加假设。

**约束**:`demo-frontend-spec.md` 的演示护栏继续有效 —— 无后端、模拟数据、UI 文案英文、
source badge 全局一致、Riverside 超支 6% 的叙事不能破。

---

## 8. 待取得的资料与待确认事实

### 8.1 黑盒输入输出样本(最高优先)

| 黑盒 | 进出 | 文件 | 验证什么 |
|---|---|---|---|
| ② CostX | 出 | **预算导出的实际文件**(Excel / CSV / OData,非截图) | 是否含 cost code、description、budget、quantity |
| ④ Xero | 出 | **成本明细导出**(按项目 + tracking category 或 account code) | 能否对上同一套 cost code |
| ④ 全栈 | 入 | **项目 + cost code 映射表** —— 现在在哪、谁维护 | 映射是否已存在,还是要从零建 |

其余:合同、分包合同、现行保留金台账、真实分包 payment claim、变更单及往来邮件、
供应商发票 PDF、PO、ApprovalMax 规则与审批历史、脱敏收件箱样本、三个系统的只读账号。

### 8.2 待确认(按影响范围)

1. **CostX 能否按 cost code 导出预算明细?** —— 唯一一个会让整件事不成立的前提
2. **Xero 用什么维度归集实际成本?** —— account code / tracking category / 其他
3. **公司在目标项目里是总承包还是分包?** —— 决定 retention 的义务方
4. **保留金目前怎么管?** —— 是否已有合规信托账户与季度报告
5. **retention 与付款条件是否逐合同不同?** —— 决定数据模型按合同还是全局
6. **微信是企业微信还是个人微信?** —— 个人微信无官方 API,决定 ① 能否成立
7. **「文件申请 / WF」指采购申请还是资料报审?** —— 决定它接 ④ 还是另起一条线
