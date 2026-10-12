"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Lock, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnswerMarkdown } from "@/components/assistant/answer-markdown";
import { SourceBadge } from "@/components/source-badge";
import { assistantFallback, suggestedQuestions } from "@/lib/mock-data";
import { matchQuestion } from "@/lib/derive";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  /** False for the fallback, which cites nothing. */
  sourced: boolean;
}

const GREETING: Message = {
  id: 0,
  role: "assistant",
  content:
    "Ask me anything about budgets, spend, margins or exceptions across your four active projects. I read from CostX and Xero — I can't move money or change anything.",
  sourced: false,
};

export function Chat() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("q");

  const [messages, setMessages] = React.useState<Message[]>([GREETING]);
  const [input, setInput] = React.useState("");
  const nextId = React.useRef(1);
  const endRef = React.useRef<HTMLDivElement>(null);

  const ask = React.useCallback((question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const match = matchQuestion(trimmed);
    const userMsg: Message = { id: nextId.current++, role: "user", content: trimmed, sourced: false };
    const reply: Message = {
      id: nextId.current++,
      role: "assistant",
      content: match?.answer ?? assistantFallback,
      sourced: Boolean(match),
    };

    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  }, []);

  // A question handed over from a project page is asked on arrival.
  const asked = React.useRef(false);
  React.useEffect(() => {
    if (prefill && !asked.current) {
      asked.current = true;
      ask(prefill);
    }
  }, [prefill, ask]);

  React.useEffect(() => {
    if (messages.length === 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages]);

  const [greeting, ...exchange] = messages;

  return (
    <div className="flex h-[calc(100dvh-16rem)] min-h-[460px] flex-col">
      {/* A ruled transcript, not a chat app: each question heads its answer, and
          every sourced answer closes with where it was read from. */}
      <div className="flex-1 overflow-y-auto" aria-live="polite">
        <p className="max-w-[72ch] px-4 pb-4 pt-4 text-[13px] leading-relaxed text-muted-foreground md:px-5">
          {greeting.content}
        </p>
        {exchange.map((m) =>
          m.role === "user" ? (
            <h2
              key={m.id}
              className="border-t border-border px-4 pt-4 text-[15px] font-semibold leading-snug tracking-[-0.01em] md:px-5"
            >
              {m.content}
            </h2>
          ) : (
            <div key={m.id} className="space-y-2.5 px-4 pb-4 pt-2 md:px-5">
              <AnswerMarkdown content={m.content} />
              {m.sourced ? (
                <p className="flex flex-wrap items-center gap-1 text-[11.5px] text-muted-foreground">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Read-only · sourced from
                  <SourceBadge system="CostX" short />
                  <SourceBadge system="Xero" short />
                </p>
              ) : null}
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="space-y-3 border-t border-foreground px-4 pb-4 pt-3 md:px-5">
        {/* On phones the suggestions scroll in one line so the transcript keeps the room. */}
        <div
          role="group"
          aria-label="Suggested questions"
          className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              className="shrink-0 whitespace-nowrap rounded-sm border border-foreground/25 px-2.5 py-1 text-left text-[12px] sm:whitespace-normal text-muted-foreground transition-colors duration-150 hover:border-foreground/60 hover:bg-accent hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about budgets, spend, margins or exceptions…"
            aria-label="Ask a question"
          />
          <Button type="submit" disabled={!input.trim()}>
            <SendHorizonal />
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}
