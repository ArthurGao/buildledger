import type { System } from "./types";

/**
 * Presenter notes, in Chinese, for whoever is driving the demo.
 *
 * This is deliberately the ONLY Chinese text in the product. The client-facing
 * interface stays entirely in English; this panel is an aid for the person
 * presenting, opened from the header and closed again before handing over.
 * Removing it is a one-line change: drop <PageGuideButton /> from the header.
 */

export interface GuideSection {
  heading: string;
  body: string[];
}

export interface PageGuide {
  /** Chinese page name, shown as the panel title. */
  title: string;
  /** The English page name, so the presenter can tie it back to the screen. */
  englishTitle: string;
  /** One sentence: what problem this page solves. */
  purpose: string;
  /** Block-by-block walkthrough of what is on screen. */
  sections: GuideSection[];
  /** Which upstream system each figure on this page comes from. */
  sources: { system: System; what: string }[];
  /** Suggested talk track while showing the page. */
  talkTrack: string[];
  /** Questions the client is likely to ask here, with answers. */
  faq: { q: string; a: string }[];
}

const dashboard: PageGuide = {
  "title": "总览面板",
  "englishTitle": "Dashboard",
  "purpose": "开场第一屏。让客户在 30 秒内看到:四个在建项目里,哪个在亏钱、亏多少、系统替他揪出了几个问题。",
  "sections": [
    {
      "heading": "顶部四张 KPI 卡",
      "body": [
        "Total budget($6.24M)——四个项目的投标预算合计,数字来自 CostX。",
        "Actual to date($4.13M)——已经发生的实际成本合计,来自 Xero。下面那行 66% of budget spent 是花掉的比例。",
        "Forecast margin(9.6%)——按当前趋势预测的竣工毛利率,红色向下箭头标出比投标时的 10.6% 掉了 1.0 个百分点。这是整个演示最要紧的一个数:钱正在漏。",
        "Open exceptions(4,红色)——系统自动揪出的异常条数,下面标了 2 high · 2 medium。"
      ]
    },
    {
      "heading": "Budget vs committed vs actual 柱状图",
      "body": [
        "每个项目三根柱子:预算(靛蓝 / CostX)、已下 PO 的承诺成本(青绿 / ApprovalMax)、实际发生(蓝 / Xero)。",
        "图例下方特意标了每个系列来自哪个系统 —— 这是整合这件事的视觉证据。",
        "看 Riverside 那组:三根柱子几乎齐平,说明预算快花完了但工程还没完,这就是它超支的先兆。"
      ]
    },
    {
      "heading": "Recent exceptions(右侧)",
      "body": [
        "按严重度排序的前三条异常,点击直接进异常页。",
        "重复发票排第一,因为那是真金白银可能付两遍的钱。"
      ]
    },
    {
      "heading": "Projects at a glance(整宽表格)",
      "body": [
        "四个项目一行一个。Riverside 整行底色是淡红,状态标 Over budget。",
        "Spend to date 那根进度条,Riverside 是红色 82%,其余是蓝色。",
        "Forecast margin 一列同时给出现在和投标时两个数,直接看出哪个项目在掉毛利。",
        "点任意一行进入该项目的逐行对账页。"
      ]
    },
    {
      "heading": "Recent activity(底部)",
      "body": [
        "一条条流水,每条左边一个小圆点,颜色对应来源系统。",
        "演示时如果你在 Invoices 页点过 Approve,回到这里会看到 just now 的新记录 —— 说明这是活的,不是截图。"
      ]
    }
  ],
  "sources": [
    {
      "system": "CostX",
      "what": "投标预算、原始毛利率"
    },
    {
      "system": "Xero",
      "what": "实际成本、已付款项"
    },
    {
      "system": "ApprovalMax",
      "what": "已下 PO 的承诺成本"
    },
    {
      "system": "EzzyBills",
      "what": "异常条数里的重复发票"
    }
  ],
  "talkTrack": [
    "这是你们四个在建项目。这一屏的数据,左边来自 CostX,右边来自 Xero —— 今天这两个系统是不通的,要对账得有人导 Excel。",
    "看这个 Forecast margin,9.6%,投标的时候是 10.6%,掉了一个点。问题是:掉在哪个项目、哪个工种?今天你们要查到这个答案要多久?",
    "右边这 4 条异常,没人去找,是系统自己冒出来的。",
    "然后点 Riverside 那一行,自然过渡到核心页。"
  ],
  "faq": [
    {
      "q": "这些数多久更新一次?",
      "a": "按集成页展示的同步频率:Xero 2 分钟、EzzyBills 1 分钟、ApprovalMax 3 分钟、CostX 15 分钟。实际落地按 API 限额定,通常分钟级足够。"
    },
    {
      "q": "Forecast final 是怎么算出来的?",
      "a": "演示里是预置数据。真实实现一般是:已完成部分按实际,未完成部分按预算或最新承诺价推算,再叠加已识别的变更。这个算法要跟你们 QS 的口径对齐。"
    }
  ]
};

const projects: PageGuide = {
  "title": "项目列表",
  "englishTitle": "Projects",
  "purpose": "从组合视角过渡到单个项目。这页本身信息不多,主要作用是让客户挑一个项目点进去。",
  "sections": [
    {
      "heading": "四张 KPI 卡",
      "body": [
        "Active projects(4)、Committed(已下 PO 合计及占预算比例)、Forecast final(预测竣工总成本 vs 预算)、Needing attention(非 On track 的项目数,红色)。"
      ]
    },
    {
      "heading": "项目表格",
      "body": [
        "和总览页底部是同一张表 —— 同一个组件,保证两处数字永远一致。",
        "状态徽章三种:绿 On track、琥珀 At risk、红 Over budget。全产品统一这套语义色。"
      ]
    }
  ],
  "sources": [
    {
      "system": "CostX",
      "what": "预算、项目清单"
    },
    {
      "system": "Xero",
      "what": "实际成本"
    },
    {
      "system": "ApprovalMax",
      "what": "承诺成本"
    }
  ],
  "talkTrack": [
    "这页别停太久,一句话带过:所有在建项目都在这,红的那个就是今天要讲的。",
    "直接点 Riverside Office Fitout 进详情页。"
  ],
  "faq": [
    {
      "q": "能按客户或项目经理筛选吗?",
      "a": "演示里没做筛选器。正式版这里会有状态、客户、PM、日期区间的筛选,以及导出。"
    }
  ]
};

const projectDetail: PageGuide = {
  "title": "项目详情 · 逐行对账(演示重头)",
  "englishTitle": "Project detail",
  "purpose": "整个演示的核心。把 CostX 的预算和 Xero 的实际按工种代码逐行对上,让超支的工种自己跳出来。这一页就是客户买单的理由。",
  "sections": [
    {
      "heading": "顶部五个关键数字",
      "body": [
        "Budget $742,000(CostX)· Committed $698,000(ApprovalMax)· Actual to date $610,000(Xero)· Forecast final $786,000 · Margin 6.4%。",
        "Forecast final 是红色的,下面标 +$44,000 (+5.9%) vs budget —— 这就是超支 6% 的出处。",
        "Margin 那格标 -5.6 pts from 12.0%:投标时 12%,现在预测只剩 6.4%,一半毛利没了。"
      ]
    },
    {
      "heading": "红色警示条",
      "body": [
        "4 trades are over budget — +$17,600 in total,下面直接点名:Electrical +$11,300 · Structural steel +$5,500 · Concrete floor slab +$400。",
        "这条是从数据自动算出来的,不是写死的文案。"
      ]
    },
    {
      "heading": "Budget vs actual 逐行对账表",
      "body": [
        "列依次是:工种代码 / 描述 / Budget(带 CostX 徽章)/ Committed(带 ApprovalMax 徽章)/ Actual(带 Xero 徽章)/ 差额 $ / 差额 % / 一根左右分向的迷你条。",
        "表头上的来源徽章是全场最值得指的地方 —— 同一行里,预算来自一个系统,实付来自另一个系统,现在它们对上了。",
        "超支行整行淡红底、工种名变红。16-100 Electrical 和 05-100 Structural steel 最显眼。",
        "最下面有合计行:$742,000 / $698,000 / $610,000 —— 逐行加起来和项目级数字分毫不差。客户里的 QS 一定会拿计算器核这个,所以数据是按精确对账造的。"
      ]
    },
    {
      "heading": "Variance by trade 横向条形图",
      "body": [
        "按差额排序,超支的红条在右,未超的浅绿条在左。",
        "注意副标题那句:绿色那部分大多是还没开票的工作,不是省下来的钱。这点很重要 —— 不要让客户误以为项目整体在省钱。绿色柱子被刻意调淡,就是为了不抢红色的戏。"
      ]
    },
    {
      "heading": "Exceptions on this project(右侧)",
      "body": [
        "只显示这个项目相关的异常,点进去跳异常页。"
      ]
    },
    {
      "heading": "Ask about this project 按钮",
      "body": [
        "右上角。点了跳到 AI 助手,并自动把问题填好问出去(Riverside 填的是 Why is Riverside over budget?)。",
        "这是从看数据到问数据的过渡动作,演示时一定要点一次。"
      ]
    }
  ],
  "sources": [
    {
      "system": "CostX",
      "what": "每个工种代码的投标预算"
    },
    {
      "system": "Xero",
      "what": "每个工种代码的实际发生成本"
    },
    {
      "system": "ApprovalMax",
      "what": "每个工种已下 PO 的承诺金额"
    }
  ],
  "talkTrack": [
    "这张表就是今天整件事的答案。左边这列预算在 CostX 里,右边这列实付在 Xero 里,中间这个工种代码是把它们连起来的钥匙。",
    "手指划过 16-100 那行:电气,预算 61,000,实付 72,300,超了 11,300。这一行今天没人会主动发现,要等到月底对账,或者更晚。",
    "再看 05-100 结构钢,超 5,500。这两条加起来就是这个项目掉掉的那 5.6 个点毛利。",
    "注意 Committed 这一列 —— 电气已经下了 70,000 的 PO,比预算还高。也就是说超支在下单的时候就已经注定了,不是结算才发现。",
    "最后点右上角 Ask about this project,把话头带到 AI 助手。"
  ],
  "faq": [
    {
      "q": "工种代码不一样怎么办?我们 CostX 的编码和 Xero 的科目对不上。",
      "a": "这是落地时最实际的一个问题。通常做一层映射表:CostX 的 trade code 对应 Xero 的 tracking category 或 account code,一次性配置,之后自动套用。演示里假设两边已经对齐。"
    },
    {
      "q": "变更单(variation)怎么体现?",
      "a": "演示里没做变更单。正式版会在预算列旁边加原始预算 / 已批变更 / 修订预算三列,差额按修订预算算。"
    },
    {
      "q": "为什么合计实际只有 61 万,却说超支?",
      "a": "因为工程还没做完。超支看的是 Forecast final($786,000)对预算($742,000),不是看当前已花多少。表格下方那行合计的 -$132,000 是还没花完,不是省下了。"
    }
  ]
};

const invoices: PageGuide = {
  "title": "应付发票流水线",
  "englishTitle": "Invoices",
  "purpose": "展示一张发票从邮箱进来到付款出去的全过程,以及每一步由哪个系统负责 —— 强调这条链现在是断的,整合后是连的。",
  "sections": [
    {
      "heading": "四张 KPI 卡",
      "body": [
        "In the pipeline(未付完的发票数及金额)、Pending approval(卡在审批的数量金额)、Flagged(被标红的异常发票数)、Paid this month。"
      ]
    },
    {
      "heading": "六列看板",
      "body": [
        "Captured → Coded → Pending approval → Approved → Awaiting payment → Paid。",
        "每列标题左边有个小圆点,颜色对应负责这一步的系统:前两列紫色(EzzyBills 捕获与编码)、中间两列青绿(ApprovalMax 审批)、后两列蓝色(Xero 付款)。这根颜色线就是在讲哪一段归谁管。",
        "每列标题下面有该列发票的金额小计。",
        "带异常的发票卡是红边,底部挂红色标签:Duplicate(重复)、No PO(无采购订单)。"
      ]
    },
    {
      "heading": "点开任意发票的弹窗",
      "body": [
        "左边 Extracted fields:供应商、发票日期、含税金额、GST(15%)、工种代码、采购订单匹配结果。每个字段旁边都标了它来自 EzzyBills 还是 Xero。",
        "Voltix 那张的 Purchase order 一栏是红色 No matching PO —— 这是异常的来源。",
        "下面有个附件占位(VLX-4471.pdf)和 Received by email。",
        "右边是 ApprovalMax 的审批链,谁批了、什么时候批的,还在等谁。",
        "底部 Approve / Reject 按钮。点 Approve 会真的把卡片推到下一列。"
      ]
    },
    {
      "heading": "关于 Approve 的行为",
      "body": [
        "审批链有几级就要批几次 —— 全部批完发票才会往下一列走。这是刻意做的,因为真实 ApprovalMax 就是这个逻辑。",
        "Reject 会把发票退回 Coded 状态,并在审批链上留一条红色拒绝记录。",
        "所有操作只改浏览器里的状态,刷新就复原。顶部还有个回退按钮可以一键重置。"
      ]
    }
  ],
  "sources": [
    {
      "system": "EzzyBills",
      "what": "发票捕获与字段提取(供应商、金额、GST)"
    },
    {
      "system": "ApprovalMax",
      "what": "审批链与审批状态"
    },
    {
      "system": "Xero",
      "what": "工种编码、PO 匹配、付款状态"
    },
    {
      "system": "M365",
      "what": "发票邮件的来源"
    }
  ],
  "talkTrack": [
    "一张发票从邮箱进来,到最后付掉,要经过三个系统。这六列就是那条路。",
    "指着列标题的小圆点:紫色这两步是 EzzyBills,绿色这两步是 ApprovalMax,蓝色这两步是 Xero。今天你们要在三个系统里分别看,现在是一条线。",
    "点开红边的 Voltix 那张:这张 12,400 的电气发票,没有对应的采购订单。系统自己发现的。",
    "点一次 Approve,让卡片动起来:批一下,它就往前走一格。"
  ],
  "faq": [
    {
      "q": "能直接在这里付款吗?",
      "a": "不能,也不应该。这个平台定位是只读加审批流转,真正的付款动作留在 Xero 里执行。这条边界对财务合规很重要。"
    },
    {
      "q": "重复发票是怎么识别的?",
      "a": "演示里按供应商加发票号加金额匹配。真实实现通常还会加模糊匹配(金额接近、日期相近、OCR 识别误差)并给出置信度。"
    }
  ]
};

const approvals: PageGuide = {
  "title": "审批队列",
  "englishTitle": "Approvals",
  "purpose": "从审批人的视角看:现在有哪些钱卡在我这里、卡了多久、卡在谁手上。",
  "sections": [
    {
      "heading": "四张 KPI 卡",
      "body": [
        "Awaiting decision(待决策发票数)、Value held up(被卡住的金额)、Oldest in queue(最久的一张等了几天,超过 7 天变红)、Approvers involved(涉及几个审批人)。"
      ]
    },
    {
      "heading": "队列表格",
      "body": [
        "列:发票号加供应商 / 项目 / 金额 / 提交人 / 当前审批人 / 等待天数 / 操作按钮。",
        "Current approver 那列左边有一串小圆圈,就是审批链的压缩视图 —— 钟表图标是等待中,对勾是已批,叉是已拒。鼠标悬停能看到是谁。",
        "带异常的发票整行淡红底,发票号下面挂红标签。",
        "等待超过 7 天的天数显示为琥珀色。"
      ]
    },
    {
      "heading": "Approve / Reject",
      "body": [
        "点了立刻生效:该行从队列消失,左侧导航的 Approvals 角标数字同步减一,上面四张 KPI 卡的数字也跟着变。",
        "这个联动是演示时值得刻意展示的 —— 它证明这是一个真实的状态机,不是静态页面。"
      ]
    }
  ],
  "sources": [
    {
      "system": "ApprovalMax",
      "what": "审批链、审批人、审批状态与时间戳"
    },
    {
      "system": "Xero",
      "what": "发票金额"
    }
  ],
  "talkTrack": [
    "这是 Sarah 打开系统看到的东西:三张单等她点头,总共 3 万块卡在这。",
    "指最久那张:这张等了 8 天。今天这个数字没人盯,单子就一直躺在邮箱里。",
    "点一次 Approve,同时让客户注意左边导航的角标:3 变成 2,整个系统是联动的。"
  ],
  "faq": [
    {
      "q": "审批规则能配吗?比如金额超过多少要两级审批。",
      "a": "能,这本来就是 ApprovalMax 的能力。演示里大额发票配了两级(项目经理到商务经理),小额一级。这个平台读它的规则和结果,不重复造一套审批引擎。"
    },
    {
      "q": "手机上能批吗?",
      "a": "能。这个界面是响应式的,窄屏下用左上角菜单导航。真实场景里审批人多半在工地上用手机。"
    }
  ]
};

const exceptions: PageGuide = {
  "title": "异常面板",
  "englishTitle": "Exceptions",
  "purpose": "整个演示里最有说服力的一页 —— 这些问题没有任何人去找,是系统跨三个数据源自己撞出来的。",
  "sections": [
    {
      "heading": "顶部小计条",
      "body": [
        "左边 3 High · 1 Medium,右边 Total exposure $33,300 —— 这四条异常加起来涉及三万三千块。",
        "这个总额是有冲击力的数字,演示时可以停一下。"
      ]
    },
    {
      "heading": "四张异常卡",
      "body": [
        "按严重度排序。每张卡:左边图标(重复是复制图标,无 PO 是文件警告,超预算是三角警告)、中间标题加严重度加项目号加描述、右边金额和跳转链接。",
        "重复发票 $6,200:Pacific Concrete 的 PAC-2231 出现了两次,8 号一张 9 号一张。",
        "超预算 $11,300:电气实付 72,300 对预算 61,000。",
        "无 PO 支出 $12,400:Voltix 的电气发票没有对应采购订单。",
        "超预算 $3,400(Medium):Hobsonville 的结构钢开始冒头,还没恶化。"
      ]
    },
    {
      "heading": "Detected from 那一行",
      "body": [
        "每张卡下方都标了这条异常是靠哪几个系统的数据碰出来的 —— 重复发票靠 EzzyBills 加 Xero,无 PO 靠 Xero 加 ApprovalMax,超预算靠 CostX 加 Xero。",
        "这是全页最关键的一行字:它说明这些异常单靠任何一个系统都发现不了,必须把数据合起来才行。这就是整合的价值本身。"
      ]
    }
  ],
  "sources": [
    {
      "system": "EzzyBills",
      "what": "发票原始字段,用于重复检测"
    },
    {
      "system": "Xero",
      "what": "实际成本与 PO 记录"
    },
    {
      "system": "ApprovalMax",
      "what": "PO 审批记录"
    },
    {
      "system": "CostX",
      "what": "预算基线,用于超预算判定"
    }
  ],
  "talkTrack": [
    "这四条,没有任何人去查过,是系统自己冒出来的。",
    "指 Detected from:看这里 —— 重复发票要 EzzyBills 和 Xero 一起才能发现,超预算要 CostX 和 Xero 一起才能发现。单独看任何一个系统,这些问题都是看不见的。",
    "加起来三万三。这还只是一个月、四个项目。"
  ],
  "faq": [
    {
      "q": "误报多不多?",
      "a": "这是落地时真正要调的东西。通常做法是给每条异常一个置信度,高置信度直接拦截,低置信度只提示;再加忽略并记住让系统学习。演示里只展示结果,不展示调参。"
    },
    {
      "q": "能配置我们自己的异常规则吗?",
      "a": "可以。常见的还有:同一供应商短期内金额突增、发票日期早于 PO 日期、单价偏离历史均值、超出合同总额等。"
    }
  ]
};

const inbox: PageGuide = {
  "title": "邮件分诊",
  "englishTitle": "Inbox",
  "purpose": "展示 AI 分类加确定性路由的配合:AI 负责猜这封邮件是什么,规则负责决定它去哪。",
  "sections": [
    {
      "heading": "四张 KPI 卡",
      "body": [
        "今日邮件数、自动路由数、平均置信度、转给 AP 的发票数。"
      ]
    },
    {
      "heading": "邮件列表",
      "body": [
        "每行:主题加发件人 / 分类徽章 / 箭头加路由目的地 / 置信度条加百分比 / 日期。",
        "五种分类各有颜色:Invoice 紫、RFQ 靛蓝、Client query 青绿、Subbie quote 橙、Noise 灰。",
        "置信度条 90% 以上绿色,以下琥珀色 —— 那封 89% 的分包报价就是琥珀色的。",
        "Noise 那行(BuildExpo 广告)整行半透明,路由目的地是 Ignored。"
      ]
    },
    {
      "heading": "点开任意邮件",
      "body": [
        "弹窗里有一段 Why it was classified this way —— 用大白话解释判断依据,比如附件是 PDF、有发票号和 GST 合计、发件人在 Xero 的供应商名单里。",
        "下面是路由目的地,旁边有个 Change routing 下拉可以人工改派。改完会记进活动流水。",
        "最底下一句话点题:分类是建议,路由是你定的规则。"
      ]
    }
  ],
  "sources": [
    {
      "system": "M365",
      "what": "收件箱邮件、发件人、附件"
    },
    {
      "system": "EzzyBills",
      "what": "发票类邮件的下游去向"
    }
  ],
  "talkTrack": [
    "你们现在一天多少封邮件?发票、询价、客户问题、分包报价、广告,全混在一个收件箱里。",
    "点开第一封:系统不光说它是发票,还告诉你为什么它这么判断。",
    "点 Change routing:判断错了你随时改。AI 只负责猜,真正往哪走是你的规则说了算 —— 这条边界很重要,不然财务不敢用。"
  ],
  "faq": [
    {
      "q": "会不会把重要邮件误判成广告?",
      "a": "会有这个风险,所以设计上 Noise 是不处理,不是删除,邮件还在 Outlook 里。而且每条都能人工改派并回流给模型。"
    },
    {
      "q": "需要把邮箱权限交出去吗?",
      "a": "通过 Microsoft 365 的标准 Graph API 授权,可以只读、可以限定到特定共享邮箱(比如 accounts@)。不需要给个人邮箱的全权限。"
    }
  ]
};

const assistant: PageGuide = {
  "title": "AI 助手(只读)",
  "englishTitle": "Assistant",
  "purpose": "让老板不用学任何软件,用大白话问账。这是演示的情绪高点,但必须同时讲清楚它的边界:只读。",
  "sections": [
    {
      "heading": "建议问题按钮",
      "body": [
        "输入框上方六个胶囊按钮,点一下直接问。演示时用这个,别现场手打,稳。",
        "六个问题覆盖了:哪些项目超支 / 为什么超 / 某项目承诺 vs 预算 / 重复发票 / 无 PO 支出 / 全部项目毛利。"
      ]
    },
    {
      "heading": "回答内容",
      "body": [
        "Show me margin across all projects 会返回一张表格,四个项目的投标毛利和预测毛利并排。",
        "Why is Riverside over budget 返回带加粗数字的要点列表,和详情页的数字完全一致。",
        "所有数字都来自同一份数据源,不会出现助手说一个数、表格说另一个数的情况。"
      ]
    },
    {
      "heading": "每条回答底部的小字",
      "body": [
        "Read-only · sourced from CostX + Xero —— 这行字每条回答都有,是刻意的。",
        "它在回答两个客户一定会担心的问题:数据哪来的、它会不会乱动我的账。"
      ]
    },
    {
      "heading": "从项目页跳过来",
      "body": [
        "在项目详情页点 Ask about this project,会跳到这里并自动把问题问出去,不用手打。"
      ]
    },
    {
      "heading": "兜底行为",
      "body": [
        "演示版是预置问答,输入没匹配上的问题会回 This is a demo — try one of the suggested questions above.",
        "所以现场不要让客户随便打字。想让客户自己点,就引导他点上面的胶囊按钮。"
      ]
    }
  ],
  "sources": [
    {
      "system": "CostX",
      "what": "预算与毛利基线"
    },
    {
      "system": "Xero",
      "what": "实际成本与发票"
    }
  ],
  "talkTrack": [
    "最后这个,是给不想学软件的人用的。",
    "点 Why is Riverside over budget:同样的问题,刚才我们是在表格里一行行找出来的,现在直接问。",
    "指底部小字:注意这行 —— 只读,数据来自 CostX 和 Xero。它不会动你一分钱,也不会改任何账。",
    "如果客户问能不能让它下单或付款:能做,但我们建议不要。AI 负责回答,动钱的事留给人。"
  ],
  "faq": [
    {
      "q": "它会不会把我们的财务数据传到外面去?",
      "a": "这是必须正面回答的问题。正式版可以选择本地部署的模型,或者用企业版 API(数据不用于训练)。也可以限制它只能访问聚合后的数字,不接触原始凭证。"
    },
    {
      "q": "能问任何问题吗?",
      "a": "演示版是预置的六组问答。正式版是接真实数据的,但仍然会限定在查询范围内,不做写操作。"
    }
  ]
};

const integrations: PageGuide = {
  "title": "集成状态",
  "englishTitle": "Integrations",
  "purpose": "收尾页。回答客户心里最后一个问题:我现在这几套系统要不要换掉?答案是不用。",
  "sections": [
    {
      "heading": "顶部那条横幅",
      "body": [
        "五个系统徽章加箭头加 One reconciled view。一句话说完整个产品。"
      ]
    },
    {
      "heading": "五张系统卡",
      "body": [
        "每张:占位色块(故意不用真实 logo)、系统名、连接方式、绿色呼吸点 Connected、最后同步时间。",
        "下方 Reads 一栏说明这个平台从该系统读什么 —— 注意是读,不是写。",
        "CostX 那张特意标了 OData API,因为 CostX 的对接方式客户可能会问。"
      ]
    },
    {
      "heading": "底部免责",
      "body": [
        "明确写了这些连接状态是示意,演示不连任何真实系统。"
      ]
    }
  ],
  "sources": [
    {
      "system": "Xero",
      "what": "实际成本、PO、供应商账单、付款状态"
    },
    {
      "system": "CostX",
      "what": "按工种代码的投标预算、工程量、毛利基线"
    },
    {
      "system": "EzzyBills",
      "what": "发票提取字段"
    },
    {
      "system": "ApprovalMax",
      "what": "审批链与审批结果"
    },
    {
      "system": "M365",
      "what": "收件邮件"
    }
  ],
  "talkTrack": [
    "最后一件事,也是你们最关心的:这套东西上了,你们现在的系统要不要动?",
    "不用。Xero 还是 Xero,CostX 还是 CostX,团队该怎么用怎么用。这个平台只是从它们里面读数据,拼在一起。",
    "指 Reads 那一栏:注意都是读。我们不往你们的账里写东西。"
  ],
  "faq": [
    {
      "q": "上线要多久?要我们配合做什么?",
      "a": "主要工作量在两件事:一是 CostX 工种代码和 Xero 科目的映射表,二是审批规则的确认。这两件事需要你们 QS 和财务各出一个人。技术对接本身是标准 API。"
    },
    {
      "q": "如果某个系统的 API 挂了会怎样?",
      "a": "页面会显示该系统的最后同步时间并标记异常,其他系统的数据照常显示。不会因为一个源断了整个平台不可用。"
    }
  ]
};

const welcome: PageGuide = {
  "title": "欢迎页 / 假登录",
  "englishTitle": "Welcome",
  "purpose": "纯粹是演示的仪式感开场。不是真的登录,点按钮直接进。",
  "sections": [
    {
      "heading": "页面内容",
      "body": [
        "左边:品牌、一句主张(你们的估算和账目,终于在看同一组数字)、五个系统徽章、一个假的 Sign in with Microsoft 按钮。",
        "右边:三个卖点卡 —— 逐行对账、自动揪异常、大白话问账。正好对应演示的三段。",
        "按钮下面明确写了这是演示登录,不需要凭据。"
      ]
    },
    {
      "heading": "用不用这页",
      "body": [
        "这页不在左侧导航里,要手动访问 /welcome。",
        "如果是正式的客户会议,建议从这页开场,点一下按钮进入 Dashboard,有开场感。",
        "如果只是发链接给客户自己看,直接发根路径就行。"
      ]
    }
  ],
  "sources": [],
  "talkTrack": [
    "从这页开场,念一遍标题那句话,然后点 Sign in with Microsoft 进去。",
    "不要在这页停超过 15 秒。"
  ],
  "faq": [
    {
      "q": "正式版会用微软账号登录吗?",
      "a": "会。既然客户已经在用 Microsoft 365,用 Entra ID 单点登录是最自然的选择,不用再维护一套账号密码。"
    }
  ]
};

/** Route path -> guide. Dynamic project pages fall back to the detail guide. */
const guides: Record<string, PageGuide> = {
  "/": dashboard,
  "/projects": projects,
  "/invoices": invoices,
  "/approvals": approvals,
  "/exceptions": exceptions,
  "/inbox": inbox,
  "/assistant": assistant,
  "/integrations": integrations,
  "/welcome": welcome,
};

export function getPageGuide(pathname: string): PageGuide {
  if (guides[pathname]) return guides[pathname];
  // /projects/RIV-01 and friends resolve to the reconciliation walkthrough.
  if (pathname.startsWith("/projects/")) return projectDetail;
  return dashboard;
}
