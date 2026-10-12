"use client";

import { getExceptionCounts, getRetentionPosition, getVariationClockCounts } from "@/lib/derive";
import { useDemoState } from "@/lib/demo-state";

export type BadgeTone = "over" | "warn" | "muted";
export type NavBadge = "approvals" | "exceptions" | "variationClocks" | "retentionAlert";

/**
 * Counts and colours for the navigation badges, shared by the sidebar and the
 * mobile menu. Red is kept for a missed deadline or a breach; a variation
 * notice that is merely due soon is amber.
 */
export function useNavBadges(): Record<NavBadge, { count: number; tone: BadgeTone }> {
  const { invoices } = useDemoState();
  const variations = getVariationClockCounts();
  return {
    approvals: { count: invoices.filter((i) => i.status === "Pending approval").length, tone: "muted" },
    exceptions: { count: getExceptionCounts().total, tone: "over" },
    variationClocks: { count: variations.missed + variations.dueSoon, tone: variations.missed > 0 ? "over" : "warn" },
    retentionAlert: { count: getRetentionPosition().compliant ? 0 : 1, tone: "over" },
  };
}
