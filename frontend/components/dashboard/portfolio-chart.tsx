'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { projects } from '@/lib/mock-data';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';

/** Budget (CostX) against committed and actual (Xero), project by project. */
const data = projects.map((p) => ({
  name: p.name.replace(
    / (Office Fitout|Apartments Stage 2|Warehouse|Retail Refit)$/,
    '',
  ),
  fullName: p.name,
  Budget: p.budgetTotal,
  Committed: p.committedTotal,
  Actual: p.actualTotal,
}));

const series = [
  { label: 'Budget', source: 'CostX', color: 'hsl(var(--src-costx))' },
  {
    label: 'Committed',
    source: 'ApprovalMax',
    color: 'hsl(var(--src-approvalmax))',
  },
  { label: 'Actual', source: 'Xero', color: 'hsl(var(--src-xero))' },
];

export function PortfolioChart() {
  return (
    <div className="space-y-2">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickFormatter={(v: number) => formatCompactCurrency(v)}
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(_label, payload) =>
                payload?.[0]?.payload?.fullName ?? ''
              }
              contentStyle={{
                borderRadius: 8,
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                fontSize: 12,
                boxShadow: '0 8px 16px -4px rgb(15 23 42 / 0.10)',
              }}
            />
            <Bar
              dataKey="Budget"
              fill="hsl(var(--src-costx))"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="Committed"
              fill="hsl(var(--src-approvalmax))"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="Actual"
              fill="hsl(var(--src-xero))"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-4">
        {series.map((s) => (
          <li
            key={s.label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
            <span className="text-[11px] opacity-70">({s.source})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
