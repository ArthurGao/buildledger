"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceDot } from "@/components/source-badge";
import { useDemoState } from "@/lib/demo-state";

export function RecentActivity() {
  const { activity } = useDemoState();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activity.slice(0, 6).map((a) => (
            <li key={a.id} className="flex gap-2.5">
              <SourceDot system={a.system} className="mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{a.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.at} · {a.system === "M365" ? "Microsoft 365" : a.system}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
