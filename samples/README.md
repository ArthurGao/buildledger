# 样例导出文件

这三份文件是**我们猜的**,不是真的。

`system-design.md` 第 2 节的接口契约全部建立在推断上。与其继续追问
「CostX 能不能按 cost code 导出预算?」—— 一个对方不容易回答的抽象问题 ——
不如做出一份长得像真实导出的文件,把问题换成:

> **你们的导出是不是长这样?哪里不一样?**

这个问题任何一个会用 CostX 或 Xero 的人都能在十秒内回答,而答案直接决定
整个方案成不成立。

---

## 三份文件

| 文件 | 代表什么 | 对方从哪里导出 |
|---|---|---|
| `costx-budget-export.csv` | ② QS 黑盒的**输出** | CostX 的工程量/预算报表,导出为 Excel 或 CSV |
| `xero-account-transactions.csv` | ④ 应付黑盒的**输出** | Xero 的 Account Transactions 报表,按项目筛选 |
| `cost-code-mapping.csv` | 两个黑盒之间的**钥匙** | 目前多半不存在,或散落在某个人的 Excel 里 |

金额与演示应用中的 Riverside Office Fitout 精确一致:预算合计 **$742,000**,
实际合计 **$610,000**。这样一来,导入结果能不能还原出对账表,是可以被断言的。

---

## 怎么用

```bash
cd frontend
npm run check:import
```

它会读这三份文件,执行 join,并报告:

- CostX 导出是否包含 cost code、描述、金额三列,以及工程量 × 单价是否等于金额
- 每个 cost code 是否都有映射
- 每笔 Xero 交易是否都能落到某个 cost code 上
- join 出来的实际成本,是否与应用里的对账表逐行一致

**拿到真实导出后,把文件替换掉再跑一次** —— 它会立刻告诉你差在哪里。
这就是导入路径本身,不是一次性的验证脚本。

---

## 样例里刻意留了一个问题

`03-100 Concrete floor slab` 与 `03-200 Reinforcement steel` 被映射到了
**同一个 Xero 键**(account `320` + tracking `Concrete`)。

于是校验会报:

```
NOTE  cost codes 03-100 and 03-200 both map to Xero key 320|Concrete
      — actual cost cannot be split between them on this mapping alone
NOTE  $22,600 of actual cost sits on an ambiguous key and was attributed
      to the first matching cost code
```

这不是 bug,是**刻意留的**。它演示了真实导出里最常见的一类问题:

> 估算端的颗粒度比记账端细。CostX 里分开的两条线,在 Xero 里可能共用一个
> account code,靠 account + tracking 拆不开。

遇到这种情况有三条路,需要和对方一起定:

1. 在 Xero 侧增加一个 tracking 选项,把两者分开
2. 在映射表里加第三个键(比如供应商、或摘要中的关键词)
3. 接受合并,在对账表里把这两条线并成一条

**这正是只看真实文件才能发现的东西。** 抽象讨论接口契约永远讨论不到这一层。

---

## 需要对方确认的

拿到真实导出后,对照这三份样例看:

1. **CostX 导出里有没有 cost code 这一列?** 粒度是到工种,还是只有项目总额?
2. **Xero 用什么维度归集项目成本?** tracking category、account code,还是别的?
3. **映射表现在存在吗?** 在谁手里、多久更新一次、谁负责维护?
4. **有多少 cost code 会像 03-x 那样在 Xero 侧拆不开?**
5. 导出是手工操作,还是能通过 API 定时拉取?

第 1 条如果答案是「没有」,整个逐行对账就不成立,方案要重做 ——
`system-design.md` 第 8.2 节把它列为唯一一个会让整件事不成立的前提。

---

## 注意

- 文件带 UTF-8 BOM,与 Excel 导出的实际行为一致
- 金额为不含 GST 的净额,GST 单列(15%)
- 所有供应商、项目、金额均为虚构演示数据
