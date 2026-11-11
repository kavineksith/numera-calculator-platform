// src/components/settings/categories/AccessibilityCategory.tsx
"use client";

import type { Settings } from "@/lib/validation/settings";
import { Field, SectionTitle } from "./shared";
import { Switch } from "@/components/ui/switch";

export function AccessibilityCategory({
  settings,
  update,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(s: K, v: Partial<Settings[K]>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Accessibility" description="WCAG 2.2 AA compliance options." />
      <div className="flex items-center justify-between">
        <Field label="Reduce motion">
          <Switch
            checked={settings.accessibility.reduceMotion}
            onCheckedChange={(v) => update("accessibility", { reduceMotion: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="High contrast theme">
          <Switch
            checked={settings.accessibility.highContrast}
            onCheckedChange={(v) => update("accessibility", { highContrast: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="Large text">
          <Switch
            checked={settings.accessibility.largeText}
            onCheckedChange={(v) => update("accessibility", { largeText: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="Announce results (screen reader)">
          <Switch
            checked={settings.accessibility.announceResults}
            onCheckedChange={(v) => update("accessibility", { announceResults: v })}
          />
        </Field>
      </div>
    </div>
  );
}
