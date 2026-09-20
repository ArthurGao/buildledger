"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CircleHelp,
  FileOutput,
  Info,
  MessageCircleQuestion,
  MousePointerClick,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceBadge } from "@/components/source-badge";
import { getPageGuide } from "@/lib/page-guides";

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Explains the page the client is currently looking at: what goes in, what
 * comes out, how to work with it, and which manual process it replaces.
 * One button in the header covers every page, keyed by route.
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
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="本页说明">
            <CircleHelp className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>本页说明（按 ? 打开）</TooltipContent>
      </Tooltip>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {guide.englishTitle}
            </p>
            <SheetTitle>{guide.title}</SheetTitle>
            <SheetDescription>{guide.purpose}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-7 overflow-y-auto p-5 text-sm leading-relaxed">
            {guide.inputs.length > 0 ? (
              <Section icon={<Info className="h-4 w-4 text-primary" />} title="输入 · 数据从哪里来">
                <ul className="space-y-2">
                  {guide.inputs.map((i) => (
                    <li key={i.system} className="flex items-start gap-2.5">
                      <SourceBadge system={i.system} short className="mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{i.what}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <Section icon={<FileOutput className="h-4 w-4 text-primary" />} title="输出 · 这页给你什么">
              <ul className="space-y-1.5 border-l-2 border-border pl-3.5 text-muted-foreground">
                {guide.outputs.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </Section>

            <Section icon={<MousePointerClick className="h-4 w-4 text-primary" />} title="怎么用">
              <ol className="space-y-2.5">
                {guide.howToUse.map((s, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section icon={<Sparkles className="h-4 w-4 text-primary" />} title="AI 与自动化做了什么">
              <ul className="space-y-2.5">
                {guide.automation.map((a) => (
                  <li key={a.step} className="rounded-md border border-border bg-muted/40 p-3">
                    <p className="font-medium">{a.step}</p>
                    <p className="mt-1 text-muted-foreground">{a.detail}</p>
                  </li>
                ))}
              </ul>
            </Section>

            {guide.before.length > 0 ? (
              <Section icon={<Workflow className="h-4 w-4 text-primary" />} title="整合了哪些流程">
                <ul className="space-y-3">
                  {guide.before.map((b, i) => (
                    <li key={i} className="space-y-2 rounded-md border border-border p-3">
                      <div className="flex gap-2.5">
                        <span className="mt-px shrink-0 rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                          原来
                        </span>
                        <span className="text-muted-foreground">{b.before}</span>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="mt-px shrink-0 rounded bg-ok-soft px-1.5 py-px text-[10px] font-medium text-ok">
                          现在
                        </span>
                        <span className="flex-1">{b.after}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <Section icon={<MessageCircleQuestion className="h-4 w-4 text-primary" />} title="常见问题">
              <dl className="space-y-3">
                {guide.faq.map((f) => (
                  <div key={f.q} className="rounded-md border border-border bg-muted/40 p-3">
                    <dt className="flex gap-2 font-medium">
                      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                      {f.q}
                    </dt>
                    <dd className="mt-1 pl-5.5 text-muted-foreground">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
