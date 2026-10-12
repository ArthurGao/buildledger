import { cn } from "@/lib/utils";

/** A section head on the sheet: title on a 1px ink rule, an aside (link or note) right. */
export function SectionHead({
  id,
  title,
  description,
  aside,
  className,
}: {
  id: string;
  title: string;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-foreground px-4 pb-2.5 pt-4 md:px-5",
        className
      )}
    >
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold tracking-[-0.01em]">
          {title}
        </h2>
        {description ? <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p> : null}
      </div>
      {aside ? <div className="shrink-0 text-[12px] text-muted-foreground">{aside}</div> : null}
    </header>
  );
}
