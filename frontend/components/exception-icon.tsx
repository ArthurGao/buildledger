import { AlertTriangle, Copy, FileWarning, Landmark, Timer, TimerOff } from "lucide-react";
import type { ExceptionType } from "@/lib/types";

const icons: Record<ExceptionType, typeof AlertTriangle> = {
  "Duplicate invoice": Copy,
  "No PO spend": FileWarning,
  "Over budget": AlertTriangle,
  "Payment schedule overdue": TimerOff,
  "Variation notice overdue": Timer,
  "Retention shortfall": Landmark,
};

export function ExceptionIcon({ type, className }: { type: ExceptionType; className?: string }) {
  const Icon = icons[type];
  return <Icon className={className} />;
}
