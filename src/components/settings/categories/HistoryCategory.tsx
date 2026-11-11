// src/components/settings/categories/HistoryCategory.tsx
"use client";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "./shared";
import { toast } from "sonner";

export function HistoryCategory() {
  const clearAll = async () => {
    await fetch("/api/history/all", { method: "DELETE" });
    toast.success("History cleared");
  };
  return (
    <div className="space-y-4">
      <SectionTitle title="History" description="Manage stored calculation history." />
      <Button variant="destructive" onClick={clearAll}>Clear all history</Button>
      <p className="text-xs opacity-70">
        History is stored in SQLite via the <code>/api/history</code> endpoint.
        Use the side panel to search, filter, sort, star, and reuse entries.
      </p>
    </div>
  );
}
