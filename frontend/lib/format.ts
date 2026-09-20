/** Currency is NZD throughout; GST is 15%. */

const nzd = new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
  maximumFractionDigits: 0,
});

const nzdCents = new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $742,000 */
export function formatCurrency(value: number): string {
  return nzd.format(value);
}

/** $6,200.00 — for invoice-level figures where cents matter. */
export function formatCurrencyPrecise(value: number): string {
  return nzdCents.format(value);
}

/** $786k / $3.15M — for tight spaces like KPI cards and chart axes. */
export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`;
  return `${sign}$${abs}`;
}

/** +$11,300 / -$7,500 — variance always carries its sign. */
export function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

/** 6.4% */
export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/** +18.5% / -12.1% */
export function formatSignedPct(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

/** 0.98 -> 98% */
export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}
