// src/components/settings/categories/PrivacyCategory.tsx
"use client";

import type { Settings } from "@/lib/validation/settings";
import { Field, SectionTitle } from "./shared";
import { Switch } from "@/components/ui/switch";

export function PrivacyCategory({
  settings,
  update,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(s: K, v: Partial<Settings[K]>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Privacy & Security" description="Local-only data controls." />
      <div className="flex items-center justify-between">
        <Field label="Clear history on exit" hint="Removes all stored history when you close the tab.">
          <Switch
            checked={settings.privacy.clearHistoryOnExit}
            onCheckedChange={(v) => update("privacy", { clearHistoryOnExit: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="Disable recovery snapshots">
          <Switch
            checked={settings.privacy.disableRecovery}
            onCheckedChange={(v) => update("privacy", { disableRecovery: v })}
          />
        </Field>
      </div>
      <div className="rounded-md border p-3 text-xs space-y-1">
        <div><span className="opacity-70">CSP:</span> default-src 'self'</div>
        <div><span className="opacity-70">Rate limit:</span> 60 req/min per IP on /api/*</div>
        <div><span className="opacity-70">Uploads:</span> magic-byte validated, stored outside public/</div>
        <div><span className="opacity-70">Theme import:</span> Zod-validated JSON only — no code execution</div>
      </div>
    </div>
  );
}
