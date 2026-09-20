"use client";

import { useParams, useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectStatusBadge } from "@/components/status-badge";
import { getProject } from "@/lib/derive";
import { projects } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Reflects whichever project page you are on, rather than always saying "All projects". */
export function ProjectSwitcher() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();

  const current = params?.id ? getProject(params.id) : undefined;
  const label = current?.name ?? "All projects";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-0 max-w-[13rem] gap-1.5 lg:gap-2">
          <span className="hidden shrink-0 text-muted-foreground lg:inline">Project</span>
          <span className="truncate font-medium">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Switch project</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => router.push("/projects")}>
          <Check className={cn("h-4 w-4 text-primary", current && "invisible")} />
          <span>All projects</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {projects.map((p) => (
          <DropdownMenuItem key={p.id} onSelect={() => router.push(`/projects/${p.id}`)}>
            <Check className={cn("h-4 w-4 shrink-0 text-primary", current?.id !== p.id && "invisible")} />
            <span className="flex-1 truncate">{p.name}</span>
            <ProjectStatusBadge status={p.status} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
