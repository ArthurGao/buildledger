"use client";

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompactCurrency, formatSignedCurrency } from "@/lib/format";
import type { BudgetLineWithVariance } from "@/lib/types";

/**
 * Variance by trade, worst first. Red bars to the right are the trades
 * eating the margin — this is the picture the client should remember.
 */
export function VarianceChart({ lines }: { lines: BudgetLineWithVariance[] }) {
  const data = lines.map((l) => ({
    name: l.description,
    code: l.code,
    variance: l.variance,
    isOver: l.isOver,
  }));

  return (
    <div style={{ height: Math.max(220, data.length * 30 + 40) }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 8 }}>
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatCompactCurrency(v)}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={168}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
          />
          <ReferenceLine x={0} stroke="hsl(var(--border))" />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
            formatter={(value) => [formatSignedCurrency(Number(value)), "Variance"]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
              boxShadow: "0 8px 16px -4px rgb(15 23 42 / 0.10)",
            }}
          />
          <Bar dataKey="variance" radius={3} maxBarSize={18}>
            {data.map((d) => (
              // Under-budget trades are muted: most of that gap is work not yet
              // invoiced, not a saving, and it must not out-shout the overruns.
              <Cell
                key={d.code}
                fill={d.isOver ? "hsl(var(--over))" : "hsl(var(--ok))"}
                fillOpacity={d.isOver ? 1 : 0.3}
              />
            ))}
            <LabelList
              dataKey="variance"
              position="right"
              formatter={(v) => (typeof v === "number" ? formatSignedCurrency(v) : "")}
              style={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
