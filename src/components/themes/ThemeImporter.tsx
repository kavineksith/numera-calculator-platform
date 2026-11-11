// src/components/themes/ThemeImporter.tsx
// Import a theme from a JSON file or pasted JSON. NEVER executes code — only
// validates via the Zod theme schema on the server.

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export function ThemeImporter({ onImported }: { onImported?: () => void }) {
  const [text, setText] = useState("");

  const doImport = async (payload: unknown) => {
    const res = await fetch("/api/themes/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme: payload, overwrite: false }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Theme imported");
      onImported?.();
    } else {
      toast.error(data.error ?? "Import failed");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    setText(txt);
    try {
      const parsed = JSON.parse(txt);
      await doImport(parsed);
    } catch {
      toast.error("Invalid JSON file");
    }
  };

  const onPaste = async () => {
    if (!text.trim()) {
      toast.error("Paste JSON first");
      return;
    }
    try {
      const parsed = JSON.parse(text);
      await doImport(parsed);
    } catch {
      toast.error("Invalid JSON");
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">Import a theme JSON file</Label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          className="text-xs"
          aria-label="Choose theme JSON file"
        />
      </div>
      <Label className="text-xs">…or paste the JSON here</Label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder='{"name":"…","colors":{…}}'
        className="font-mono text-xs"
      />
      <Button onClick={onPaste}>
        <Upload className="h-4 w-4" /> Import
      </Button>
      <p className="text-[11px] opacity-70">
        Imported themes are validated server-side with Zod. No code or CSS is
        executed from imported payloads.
      </p>
    </div>
  );
}
