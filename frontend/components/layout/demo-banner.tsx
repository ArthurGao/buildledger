import { Info } from "lucide-react";

/** Always visible. This app is a demo and never pretends otherwise. */
export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-slate-700/60 bg-slate-900 px-4 py-1.5 text-center text-xs font-medium text-slate-200">
      <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span>DEMO — sample data, no live systems connected.</span>
    </div>
  );
}
