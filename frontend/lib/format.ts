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

/**
 * Dates are rendered from the wall-clock fields written in the ISO string,
 * never converted into the viewer's timezone.
 *
 * Two reasons. Server-side rendering happens in UTC while the browser runs in
 * the viewer's own zone, and converting would make the two disagree — React
 * then throws away the server HTML and re-renders. And the demo's dates are
 * New Zealand dates: a 12 Sep invoice must read "12 Sep" wherever it is opened.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface IsoParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function parseIso(iso: string): IsoParts {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(iso);
  if (!m) return { year: 0, month: 1, day: 1, hour: 0, minute: 0 };
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4] ?? 0),
    minute: Number(m[5] ?? 0),
  };
}

function clockTime({ hour, minute }: IsoParts): string {
  const suffix = hour < 12 ? "am" : "pm";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/** 12 Sep */
export function formatDateShort(iso: string): string {
  const p = parseIso(iso);
  return `${p.day} ${MONTHS[p.month - 1]}`;
}

/** 12 Sep 2026 */
export function formatDateLong(iso: string): string {
  const p = parseIso(iso);
  return `${p.day} ${MONTHS[p.month - 1]} ${p.year}`;
}

/** 12 Sep 2026, 8:14 am */
export function formatDateTimeLong(iso: string): string {
  const p = parseIso(iso);
  return `${p.day} ${MONTHS[p.month - 1]} ${p.year}, ${clockTime(p)}`;
}

/** 10 Sep, 2:22 pm */
export function formatDateTimeShort(iso: string): string {
  const p = parseIso(iso);
  return `${p.day} ${MONTHS[p.month - 1]}, ${clockTime(p)}`;
}
