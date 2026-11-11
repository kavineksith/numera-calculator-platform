// src/components/settings/categories/BehaviorCategory.tsx
"use client";

import type { Settings } from "@/lib/validation/settings";
import { Field, SectionTitle } from "./shared";
import { Switch } from "@/components/ui/switch";

export function BehaviorCategory({
  settings,
  update,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(s: K, v: Partial<Settings[K]>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Calculator Behavior" description="How the calculator reacts to input." />
      <div className="flex items-center justify-between">
        <Field label="Auto-evaluate preview">
          <Switch
            checked={settings.behavior.autoEvaluate}
            onCheckedChange={(v) => update("behavior", { autoEvaluate: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="Save to history">
          <Switch
            checked={settings.behavior.historyEnabled}
            onCheckedChange={(v) => update("behavior", { historyEnabled: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="Confirm before clear all">
          <Switch
            checked={settings.behavior.confirmClear}
            onCheckedChange={(v) => update("behavior", { confirmClear: v })}
          />
        </Field>
      </div>
    </div>
  );
}
