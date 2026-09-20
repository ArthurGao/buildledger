import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExceptionIcon } from "@/components/exception-icon";
import { getExceptionsBySeverity, getProjectName } from "@/lib/derive";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RecentExceptions() {
  const items = getExceptionsBySeverity().slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm">Recent exceptions</CardTitle>
        <Link
          href="/exceptions"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {items.map((e) => (
          <Link
            key={e.id}
            href="/exceptions"
            className="flex gap-3 rounded-md border border-border p-3 transition-colors hover:border-foreground/20 hover:bg-accent/50"
          >
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                e.severity === "High" ? "bg-over-soft text-over" : "bg-warn-soft text-warn"
              )}
            >
              <ExceptionIcon type={e.type} className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{e.type}</span>
                <Badge variant={e.severity === "High" ? "over" : "warn"}>{e.severity}</Badge>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{e.description}</p>
              <p className="tabular mt-1 text-xs text-muted-foreground">
                {getProjectName(e.projectId)}
                {e.amount ? ` · ${formatCurrency(e.amount)}` : ""}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
