import { Info } from "lucide-react";

/** Always visible. This app is a demo and never pretends otherwise. */
export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-foreground px-4 py-1 text-center text-[11.5px] font-medium text-background">
      <Info className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <span>DEMO — sample data, no live systems connected.</span>
    </div>
  );
}
