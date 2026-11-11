// src/components/settings/categories/AudioCategory.tsx
"use client";

import type { Settings } from "@/lib/validation/settings";
import { Field, SectionTitle } from "./shared";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

export function AudioCategory({
  settings,
  update,
}: {
  settings: Settings;
  update: <K extends keyof Settings>(s: K, v: Partial<Settings[K]>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Audio" description="Click sounds and spoken results." />
      <div className="flex items-center justify-between">
        <Field label="Enable button sounds">
          <Switch
            checked={settings.audio.enabled}
            onCheckedChange={(v) => update("audio", { enabled: v })}
          />
        </Field>
      </div>
      <div className="flex items-center justify-between">
        <Field label="Error sounds">
          <Switch
            checked={settings.audio.errorSounds}
            onCheckedChange={(v) => update("audio", { errorSounds: v })}
          />
        </Field>
      </div>
      <Field label={`Volume: ${Math.round(settings.audio.volume * 100)}%`}>
        <Slider
          value={[settings.audio.volume]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={(v) => update("audio", { volume: v[0]! })}
        />
      </Field>
      <div className="flex items-center justify-between">
        <Field label="Speak results (TTS)">
          <Switch
            checked={settings.audio.ttsEnabled}
            onCheckedChange={(v) => update("audio", { ttsEnabled: v })}
          />
        </Field>
      </div>
      <Field label="TTS language" hint="e.g. en-US, zh-CN">
        <Input
          value={settings.audio.ttsLang}
          onChange={(e) => update("audio", { ttsLang: e.target.value })}
        />
      </Field>
      <Field label={`TTS rate: ${settings.audio.ttsRate.toFixed(1)}×`}>
        <Slider
          value={[settings.audio.ttsRate]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={(v) => update("audio", { ttsRate: v[0]! })}
        />
      </Field>
    </div>
  );
}
