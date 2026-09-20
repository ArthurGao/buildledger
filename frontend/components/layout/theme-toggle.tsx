"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Render a stable icon until mounted so server and client markup agree.
  const dark = mounted && theme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dark ? "Light mode" : "Dark mode"}</TooltipContent>
    </Tooltip>
  );
}
