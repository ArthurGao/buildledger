"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BookOpen, HelpCircle, Lightbulb, MessageCircleQuestion, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceBadge } from "@/components/source-badge";
import { getPageGuide } from "@/lib/page-guides";

/**
 * Presenter guide. A single button in the header opens notes for whatever page
 * is currently open, so there is one implementation rather than one per page.
 *
 * The notes are in Chinese and are for the person running the demo — the
 * client-facing UI stays in English. Press "?" to open, Escape to close.
 */
export function PageGuideButton() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const guide = getPageGuide(pathname);

  // "?" opens the panel, as long as the user is not typing into something.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "?") return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      setOpen((v) => !v);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="页面说明">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>页面说明（按 ? 打开）</TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              演示说明 · {guide.englishTitle}
            </p>
            <SheetTitle>{guide.title}</SheetTitle>
            <SheetDescription>{guide.purpose}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-7 overflow-y-auto p-5 text-sm leading-relaxed">
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" />
                这一页上有什么
              </h3>
              {guide.sections.map((s) => (
                <div key={s.heading} className="space-y-1.5">
                  <p className="font-medium">{s.heading}</p>
                  <ul className="space-y-1.5 border-l-2 border-border pl-3.5 text-muted-foreground">
                    {s.body.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>

            {guide.sources.length > 0 ? (
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="h-4 w-4 text-primary" />
                  这页的数字来自哪里
                </h3>
                <ul className="space-y-2">
                  {guide.sources.map((s) => (
                    <li key={s.system} className="flex items-start gap-2.5">
                      <SourceBadge system={s.system} short className="mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{s.what}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-warn" />
                演示时可以这样讲
              </h3>
              <ol className="space-y-2.5">
                {guide.talkTrack.map((line, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{line}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircleQuestion className="h-4 w-4 text-primary" />
                客户可能会问
              </h3>
              <dl className="space-y-3">
                {guide.faq.map((f) => (
                  <div key={f.q} className="rounded-md border border-border bg-muted/40 p-3">
                    <dt className="font-medium">{f.q}</dt>
                    <dd className="mt-1 text-muted-foreground">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <p className="border-t border-border pt-4 text-xs text-muted-foreground">
              这块说明只给演示者看，客户看到的界面全是英文。演示前关掉即可。
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
