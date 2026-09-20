import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A deliberately small markdown renderer for the assistant's canned answers.
 * It handles exactly what those answers use — bold, bullet lists and a simple
 * table — rather than pulling in a full parser for fixed, trusted content.
 */

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

function splitRow(line: string): string[] {
  return line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}

export function AnswerMarkdown({ content, className }: { content: string; className?: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Table: header row, separator row, then body rows.
    if (line.trim().startsWith("|") && lines[i + 1]?.includes("---")) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push(
        <div key={`t-${i}`} className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                {header.map((h, hi) => (
                  <th
                    key={hi}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium text-muted-foreground",
                      hi === 0 ? "text-left" : "text-right"
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t border-border">
                  {r.map((c, ci) => (
                    <td
                      key={ci}
                      className={cn("px-3 py-1.5", ci === 0 ? "text-left" : "tabular text-right")}
                    >
                      {inline(c, `c-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list.
    if (line.trimStart().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("- ")) {
        items.push(lines[i].trimStart().slice(2));
        i += 1;
      }
      blocks.push(
        <ul key={`l-${i}`} className="list-disc space-y-1 pl-5">
          {items.map((it, ii) => (
            <li key={ii}>{inline(it, `li-${i}-${ii}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    blocks.push(<p key={`p-${i}`}>{inline(line, `p-${i}`)}</p>);
    i += 1;
  }

  return <div className={cn("space-y-2.5 text-sm leading-relaxed", className)}>{blocks}</div>;
}
