// src/components/settings/categories/DataRecoveryCategory.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "./shared";
import { toast } from "sonner";

interface RecoveryPayload {
  expression: string;
  result: string;
  mode: string;
  angleUnit: string;
  memory: number;
  ts: number;
}

export function DataRecoveryCategory() {
  const [latest, setLatest] = useState<RecoveryPayload | null>(null);

  const load = async () => {
    const res = await fetch("/api/recovery");
    const data = await res.json();
    setLatest(data.snapshot ?? null);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const clear = async () => {
    await fetch("/api/recovery", { method: "DELETE" });
    setLatest(null);
    toast.success("Recovery snapshots cleared");
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Data Recovery"
        description="Versioned snapshots let you resume after a refresh or crash."
      />
      {latest ? (
        <div className="rounded-md border p-3 text-sm space-y-1">
          <div><span className="opacity-70">Expression:</span> <code>{latest.expression}</code></div>
          <div><span className="opacity-70">Result:</span> <code>{latest.result}</code></div>
          <div><span className="opacity-70">Mode:</span> {latest.mode}</div>
          <div><span className="opacity-70">Angle:</span> {latest.angleUnit}</div>
          <div><span className="opacity-70">Memory:</span> {latest.memory}</div>
          <div><span className="opacity-70">Saved:</span> {new Date(latest.ts).toLocaleString()}</div>
        </div>
      ) : (
        <p className="text-sm opacity-70">No snapshot stored.</p>
      )}
      <Button variant="outline" onClick={load}>Refresh</Button>{" "}
      <Button variant="destructive" onClick={clear}>Clear snapshots</Button>
    </div>
  );
}
