// src/components/history/HistoryPanel.tsx
// Side panel listing calculation history with search, filter, sort, star,
// delete, pagination. Uses the shadcn Sheet on mobile / a fixed panel on
// desktop. Here we render the contents; the Sheet wrapper lives in the page.

"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Star, Trash2, Copy, RefreshCw, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HistoryItem } from "./HistoryItem";
import { toast } from "sonner";
import { useCalculator } from "@/context/CalculatorContext";

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  mode: string;
  angleUnit: string | null;
  starred: boolean;
  createdAt: string;
}

export function HistoryPanel({ onClose }: { onClose?: () => void }) {
  const { dispatch } = useCalculator();
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<string>("all");
  const [starred, setStarred] = useState<string>("all");
  const [sort, setSort] = useState<string>("createdAt_desc");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (mode !== "all") params.set("mode", mode);
      if (starred === "true") params.set("starred", "true");
      if (search) params.set("search", search);
      // The API expects sort=asc|desc, not the UI's createdAt_asc|desc form.
      params.set("sort", sort.endsWith("asc") ? "asc" : "desc");
      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sort, mode, starred, search]);

  useEffect(() => {
    load();
  }, [load]);

  const reload = () => {
    setPage(1);
    load();
  };

  const onToggleStar = async (entry: HistoryEntry) => {
    await fetch(`/api/history/${entry.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ starred: !entry.starred }),
    });
    load();
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/history/${id}`, { method: "DELETE" });
    load();
  };

  const onClearAll = async () => {
    // The DELETE /api/history/all endpoint requires an explicit confirmation
    // in the body (defense in depth against CSRF and accidental clicks).
    await fetch("/api/history/all", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    }).catch(() => {});
    toast.success("History cleared");
    load();
  };

  const onReuse = (entry: HistoryEntry) => {
    dispatch({ type: "LOAD_EXPRESSION", expression: entry.expression });
    onClose?.();
  };

  const onCopy = async (entry: HistoryEntry) => {
    try {
      await navigator.clipboard.writeText(entry.result);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const onExport = async () => {
    window.open("/api/export", "_blank");
  };

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="pl-8 h-9"
            />
          </div>
          <Button size="icon" variant="outline" onClick={reload} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={onExport} aria-label="Export history">
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select value={mode} onValueChange={(v) => { setMode(v); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="scientific">Scientific</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Select value={starred} onValueChange={(v) => { setStarred(v); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Starred" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Starred</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Newest</SelectItem>
              <SelectItem value="createdAt_asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[60vh] p-2 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {loading && <div className="text-center text-sm opacity-60 py-4">Loading…</div>}
        {!loading && items.length === 0 && (
          <div className="text-center text-sm opacity-60 py-8">No history yet.</div>
        )}
        {items.map((entry) => (
          <HistoryItem
            key={entry.id}
            entry={entry}
            onToggleStar={() => onToggleStar(entry)}
            onDelete={() => onDelete(entry.id)}
            onReuse={() => onReuse(entry)}
            onCopy={() => onCopy(entry)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t p-2 text-xs">
        <span className="opacity-70">
          Page {page} / {pages} ({total} items)
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
          <Button size="sm" variant="destructive" onClick={onClearAll}>
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

// Local icons re-exported for convenience (so HistoryItem doesn't need its own import path churn).
export { Star, Copy, Trash2 };
