"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Lock, SendHorizonal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnswerMarkdown } from "@/components/assistant/answer-markdown";
import { assistantFallback, suggestedQuestions } from "@/lib/mock-data";
import { matchQuestion } from "@/lib/derive";
import { cn } from "@/lib/utils";

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
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-15rem)] min-h-[440px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-lg rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 max-w-[88%] space-y-2">
                <div className="rounded-lg rounded-tl-sm border border-border bg-muted/40 px-3.5 py-2.5">
                  <AnswerMarkdown content={m.content} />
                </div>
                {m.sourced ? (
                  <p className="flex items-center gap-1 pl-1 text-[11px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Read-only · sourced from CostX + Xero
                  </p>
                ) : null}
              </div>
            </div>
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              className={cn(
                "rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground",
                "transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              )}
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
          <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
