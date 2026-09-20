"use client";

import { format } from "date-fns";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SourceBadge } from "@/components/source-badge";
import { ClassBadge, ConfidenceBar } from "@/components/inbox/class-badge";
import { useDemoState } from "@/lib/demo-state";
import { formatConfidence } from "@/lib/format";
import type { EmailItem } from "@/lib/types";

/** Where mail can be sent. Classification is a suggestion; routing is a rule. */
const DESTINATIONS = ["EzzyBills / AP", "Estimating", "PM (Sarah Chen)", "Commercial", "Ignored"];

export function EmailDialog({
  email,
  open,
  onOpenChange,
}: {
  email: EmailItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { routeEmail } = useDemoState();
  if (!email) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="pr-8 text-base">{email.subject}</DialogTitle>
          <DialogDescription>
            {email.from} · {format(new Date(email.receivedAt), "d MMM yyyy, h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Why it was classified this way
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{email.reason}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <ClassBadge value={email.classifiedAs} />
              <div className="flex items-center gap-2">
                <ConfidenceBar value={email.confidence} className="w-24" />
                <span className="tabular text-xs text-muted-foreground">
                  {formatConfidence(email.confidence)} confidence
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Routed to</p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium">
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                {email.routedTo}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Change routing
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Send instead to</DropdownMenuLabel>
                {DESTINATIONS.map((d) => (
                  <DropdownMenuItem key={d} onSelect={() => routeEmail(email.id, d)}>
                    {d}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Mail read from <SourceBadge system="M365" short /> · classification is a suggestion, routing is a
            fixed rule you control.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
