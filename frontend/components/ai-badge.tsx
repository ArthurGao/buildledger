import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marks something the assistant produced rather than a person.
 *
 * Used everywhere AI touches the data, so the boundary is legible at a glance:
 * anything carrying this mark was read or drafted by a model and is waiting on
 * a person. Nothing acts on it by itself.
 */
export function AiBadge({
  label = "AI drafted",
  confidence,
  className,
}: {
  label?: string;
  confidence?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-primary/25 bg-primary/10 px-1.5 py-px text-[11px] font-medium text-primary",
        className
      )}
    >
      <Sparkles className="h-3 w-3 shrink-0" />
      {label}
      {confidence !== undefined ? (
        <span className="tabular opacity-70">{Math.round(confidence * 100)}%</span>
      ) : null}
    </span>
  );
}

/** The rule this product holds to, stated wherever AI output is shown. */
export function AiBoundaryNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-[11px] leading-relaxed text-muted-foreground", className)}>
      Drafted from your own records. Every figure below points at a document you can open — nothing
      here is issued until you issue it.
    </p>
  );
}
