// src/components/settings/categories/DisplayCategory.tsx
"use client";

import type { Settings } from "@/lib/validation/settings";
import { Field, SectionTitle } from "./shared";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export function DisplayCategory({
  settings,
  update,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(s: K, v: Partial<Settings[K]>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Display" description="How results are shown on the LCD." />
      <div className="flex items-center justify-between">
        <Field label="Show expression preview">
          <Switch
            checked={settings.display.showExpressionPreview}
            onCheckedChange={(v) => update("display", { showExpressionPreview: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="Scientific notation for large numbers">
          <Switch
            checked={settings.display.scientificNotation}
            onCheckedChange={(v) => update("display", { scientificNotation: v })}
          />
        </Field>
      </div>
      <Field label={`Result font size: ${settings.display.fontSize}px`}>
        <Slider
          value={[settings.display.fontSize]}
          min={24}
          max={72}
          step={2}
          onValueChange={(v) => update("display", { fontSize: v[0]! })}
        />
      </Field>
    </div>
  );
}
