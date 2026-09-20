import { AlertTriangle, Copy, FileWarning } from "lucide-react";
import type { ExceptionType } from "@/lib/types";

const icons: Record<ExceptionType, typeof AlertTriangle> = {
  "Duplicate invoice": Copy,
  "No PO spend": FileWarning,
  "Over budget": AlertTriangle,
};

export function ExceptionIcon({ type, className }: { type: ExceptionType; className?: string }) {
  const Icon = icons[type];
  return <Icon className={className} />;
}
