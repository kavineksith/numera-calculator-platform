// src/components/settings/categories/ImportExportCategory.tsx
"use client";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "./shared";
import { toast } from "sonner";
import { useRef } from "react";

export function ImportExportCategory() {
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    window.open("/api/export", "_blank");
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    try {
      const parsed = JSON.parse(text);
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Imported ${data.imported} history entries`);
      } else {
        toast.error(data.error ?? "Import failed");
      }
    } catch {
      toast.error("Invalid JSON file");
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="Import & Export" description="Backup or restore calculation history." />
      <Button onClick={onExport}>Export history (JSON)</Button>
      <div>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          Import history (JSON)
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onImport}
          className="hidden"
        />
      </div>
    </div>
  );
}
