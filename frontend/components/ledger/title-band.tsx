import { cn } from "@/lib/utils";

/**
 * The band above a page's sheet: headline, an optional meta line split by short
 * hairlines, a description, and at most one action aligned right. It has no
 * container; the sheet below is the only bordered surface on the page.
 */
export function TitleBand({
  title,
  meta,
  description,
  action,
  className,
}: {
  title: string;
  meta?: React.ReactNode[];
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-1", className)}>
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]">{title}</h1>
        {meta && meta.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted-foreground">
            {meta.map((m, i) => (
              <span key={i} className="contents">
                {i > 0 ? <span aria-hidden="true" className="h-3 w-px bg-border" /> : null}
                <span>{m}</span>
              </span>
            ))}
          </div>
        ) : null}
        {description ? <p className="max-w-[68ch] text-[13px] text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}
