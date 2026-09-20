"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { search, type SearchResult } from "@/lib/search";
import { cn } from "@/lib/utils";

/** Search across every connected system at once — one box, all five sources. */
export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo(() => search(query), [query]);

  React.useEffect(() => setHighlighted(0), [query]);

  // Close when the click lands anywhere else.
  React.useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const go = React.useCallback(
    (result: SearchResult) => {
      setOpen(false);
      setQuery("");
      router.push(result.href);
    },
    [router]
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[highlighted]);
    }
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search projects, suppliers, invoices"
        aria-label="Search"
        className="pl-9 pr-8"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {showPanel ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-card-hover">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r, i) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => go(r)}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-2 text-left transition-colors",
                      i === highlighted ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <span className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {r.group}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
