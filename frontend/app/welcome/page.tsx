import Link from "next/link";
import { ArrowRight, BarChart3, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/source-badge";

const highlights = [
  {
    icon: BarChart3,
    title: "Budget vs actual, line by line",
    body: "CostX budgets reconciled against Xero spend on every trade code.",
  },
  {
    icon: ShieldCheck,
    title: "Exceptions caught for you",
    body: "Duplicate invoices, spend with no PO and trades running over budget.",
  },
  {
    icon: Sparkles,
    title: "Answers in plain English",
    body: "Ask where the margin went. Read-only — it never moves money.",
  },
];

export default function WelcomePage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background p-6">
      <div className="grid w-full max-w-4xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">BuildLedger</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Your estimating and your accounts, finally looking at the same numbers.
            </h1>
            <p className="text-muted-foreground">
              BuildLedger joins the systems you already run and shows you, in one place, which jobs are
              making money and which ones are quietly losing it.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <SourceBadge system="CostX" />
            <SourceBadge system="Xero" />
            <SourceBadge system="EzzyBills" />
            <SourceBadge system="ApprovalMax" />
            <SourceBadge system="M365" />
          </div>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/">
                Sign in with Microsoft
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Demo sign-in — no credentials required, no live systems connected.
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <li
                key={h.title}
                className="flex gap-3.5 rounded-lg border border-border bg-card p-4 shadow-card"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{h.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
