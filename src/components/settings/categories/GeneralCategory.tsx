// src/components/settings/categories/GeneralCategory.tsx
"use client";

import type { Settings } from "@/lib/validation/settings";
import { Field, SectionTitle } from "./shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GeneralCategory({
  settings,
  update,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(s: K, v: Partial<Settings[K]>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle title="General" description="Default calculator behaviour." />
      <Field label="Default mode">
        <Select
          value={settings.general.defaultMode}
          onValueChange={(v) => update("general", { defaultMode: v as Settings["general"]["defaultMode"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="scientific">Scientific</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Default angle unit">
        <Select
          value={settings.general.angleUnit}
          onValueChange={(v) => update("general", { angleUnit: v as "deg" | "rad" })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rad">Radians</SelectItem>
            <SelectItem value="deg">Degrees</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Display precision" hint="Significant digits shown for non-integer results.">
        <Select
          value={String(settings.general.precision)}
          onValueChange={(v) => update("general", { precision: Number(v) })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
