// src/components/history/HistoryItem.tsx
import { Star, Copy, Trash2, RotateCcw } from "lucide-react";
import type { HistoryEntry } from "./HistoryPanel";
import { cn } from "@/lib/utils";

export function HistoryItem({
  entry,
  onToggleStar,
  onDelete,
  onReuse,
  onCopy,
}: {
  entry: HistoryEntry;
  onToggleStar: () => void;
  onDelete: () => void;
  onReuse: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-md border border-[var(--calc-border)] bg-[var(--calc-surface)] p-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onReuse}
          className="flex-1 text-left"
          aria-label={`Reuse expression ${entry.expression}`}
        >
          <div className="font-mono text-xs opacity-70 truncate">{entry.expression}</div>
          <div className="font-mono font-semibold break-all">= {entry.result}</div>
          <div className="mt-0.5 text-[10px] opacity-50">
            {entry.mode} · {new Date(entry.createdAt).toLocaleString()}
          </div>
        </button>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={onToggleStar}
            aria-label={entry.starred ? "Unstar" : "Star"}
            className={cn(
              "rounded p-1 hover:bg-[var(--calc-btn)]",
              entry.starred && "text-amber-500",
            )}
          >
            <Star className="h-3.5 w-3.5" fill={entry.starred ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={onReuse}
            aria-label="Reuse"
            className="rounded p-1 hover:bg-[var(--calc-btn)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onCopy}
            aria-label="Copy result"
            className="rounded p-1 hover:bg-[var(--calc-btn)]"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            className="rounded p-1 hover:bg-[var(--calc-btn)] text-rose-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
