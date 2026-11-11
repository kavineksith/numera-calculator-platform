// src/lib/validation/settings.ts
// Zod schemas for all settings sections + composite schema for API.

import { z } from "zod";

export const generalSettingsSchema = z.object({
  angleUnit: z.enum(["deg", "rad"]).default("deg"),
  defaultMode: z.enum(["standard", "scientific", "advanced"]).default("standard"),
  thousandsSeparator: z.boolean().default(true),
  autoSaveHistory: z.boolean().default(true),
});

export const behaviorSettingsSchema = z.object({
  repeatedEquals: z.boolean().default(true),
  implicitMultiplication: z.boolean().default(true),
  roundingMode: z
    .enum(["ROUND_HALF_UP", "ROUND_DOWN", "ROUND_HALF_EVEN"])
    .default("ROUND_HALF_UP"),
  displayPrecision: z.number().int().min(1).max(20).default(12),
});

export const displaySettingsSchema = z.object({
  appearance: z
    .enum(["classic-lcd", "modern-digital", "minimal", "custom"])
    .default("modern-digital"),
  showExpressionLine: z.boolean().default(true),
  showPreviousResult: z.boolean().default(false),
  showTimestamp: z.boolean().default(false),
  sciNotation: z.enum(["auto", "always", "never"]).default("auto"),
});

export const audioSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  volume: z.number().min(0).max(1).default(0.5),
  clickSounds: z.boolean().default(true),
  errorSounds: z.boolean().default(true),
  resultSounds: z.boolean().default(false),
  ttsEnabled: z.boolean().default(false),
  ttsVoice: z.string().default(""),
  ttsRate: z.number().min(0.5).max(2).default(1),
  ttsVolume: z.number().min(0).max(1).default(1),
  ttsLanguage: z.string().default("en-US"),
});

export const accessibilitySettingsSchema = z.object({
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  largeText: z.boolean().default(false),
  announceResults: z.boolean().default(true),
});

export const privacySettingsSchema = z.object({
  saveHistory: z.boolean().default(true),
  shareUsageAnalytics: z.boolean().default(false),
});

// Composite schema — used by the /api/settings PUT endpoint.
export const settingsSchema = z.object({
  general: generalSettingsSchema,
  behavior: behaviorSettingsSchema,
  display: displaySettingsSchema,
  audio: audioSettingsSchema,
  accessibility: accessibilitySettingsSchema,
  privacy: privacySettingsSchema,
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type BehaviorSettings = z.infer<typeof behaviorSettingsSchema>;
export type DisplaySettings = z.infer<typeof displaySettingsSchema>;
export type AudioSettings = z.infer<typeof audioSettingsSchema>;
export type AccessibilitySettings = z.infer<typeof accessibilitySettingsSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;

export const ALL_SETTINGS_KEYS = [
  "general",
  "behavior",
  "display",
  "audio",
  "accessibility",
  "privacy",
] as const;

export type SettingsKey = (typeof ALL_SETTINGS_KEYS)[number];

// Composite Settings object used by the UI.
export interface Settings {
  general: GeneralSettings;
  behavior: BehaviorSettings;
  display: DisplaySettings;
  audio: AudioSettings;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
}

export const DEFAULT_SETTINGS: Settings = {
  general: generalSettingsSchema.parse({}),
  behavior: behaviorSettingsSchema.parse({}),
  display: displaySettingsSchema.parse({}),
  audio: audioSettingsSchema.parse({}),
  accessibility: accessibilitySettingsSchema.parse({}),
  privacy: privacySettingsSchema.parse({}),
};
