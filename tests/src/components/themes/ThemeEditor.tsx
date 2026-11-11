// src/components/themes/ThemeEditor.tsx
// Inline editor for creating / editing a theme (JSON config). Does NOT execute
// any imported code — only validates via the Zod theme schema.

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { ThemeConfig } from "@/lib/validation/theme";

const DEFAULT_CONFIG: ThemeConfig = {
  name: "My Theme",
  description: "Custom theme",
  colors: {
    background: "#0f172a",
    surface: "#1e293b",
    button: "#334155",
    buttonOperator: "#10b981",
    buttonFunction: "#475569",
    buttonMemory: "#f59e0b",
    buttonDestructive: "#ef4444",
    display: "#e2e8f0",
    text: "#f1f5f9",
    accent: "#10b981",
    border: "#334155",
  },
  sizing: { radius: 16, fontSize: 14, blur: 0, transparency: 1, buttonSize: "md" },
  fonts: { displayFont: "ui-monospace, monospace", buttonFont: "ui-sans-serif" },
};

const COLOR_FIELDS: { key: keyof NonNullable<ThemeConfig["colors"]>; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "button", label: "Button" },
  { key: "buttonOperator", label: "Operator" },
  { key: "buttonFunction", label: "Function" },
  { key: "buttonMemory", label: "Memory" },
  { key: "buttonDestructive", label: "Destructive" },
  { key: "display", label: "Display text" },
  { key: "text", label: "Text" },
  { key: "accent", label: "Accent" },
  { key: "border", label: "Border" },
];

export function ThemeEditor({ onSaved }: { onSaved?: () => void }) {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG);

  const setColor = (key: string, value: string) =>
    setConfig((c) => ({ ...c, colors: { ...c.colors, [key]: value } }));

  const save = async () => {
    try {
      const res = await fetch("/api/themes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Save failed");
        return;
      }
      toast.success(`Theme "${config.name}" saved`);
      onSaved?.();
    } catch {
      toast.error("Network error");
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Description</Label>
          <Input value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1 block">Colours</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <input
                type="color"
                aria-label={f.label}
                value={config.colors[f.key] ?? "#888888"}
                onChange={(e) => setColor(f.key, e.target.value)}
                className="h-8 w-8 rounded border cursor-pointer"
              />
              <span className="text-xs">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1 block">Corner radius: {config.sizing?.radius}px</Label>
        <Slider
          value={[config.sizing?.radius ?? 16]}
          min={0}
          max={32}
          step={1}
          onValueChange={(v) => setConfig({ ...config, sizing: { ...config.sizing!, radius: v[0]! } })}
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Blur: {config.sizing?.blur}px</Label>
        <Slider
          value={[config.sizing?.blur ?? 0]}
          min={0}
          max={40}
          step={1}
          onValueChange={(v) => setConfig({ ...config, sizing: { ...config.sizing!, blur: v[0]! } })}
        />
      </div>
      <div>
        <Label className="text-xs mb-1 block">Transparency: {config.sizing?.transparency}</Label>
        <Slider
          value={[config.sizing?.transparency ?? 1]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(v) => setConfig({ ...config, sizing: { ...config.sizing!, transparency: v[0]! } })}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={save}>Save theme</Button>
        <Button variant="outline" onClick={exportJson}>Export JSON</Button>
      </div>
    </div>
  );
}
