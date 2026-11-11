// src/services/settings-service.ts
// Server-only service that loads + persists the composite Settings object.
// The entire Settings object is stored as a single JSON value under the
// `settings` key in UserPreference. This matches the API contract used by
// /api/settings (GET returns the object; PUT accepts the whole object).

import "server-only";
import { db } from "@/lib/db";
import {
  settingsSchema,
  DEFAULT_SETTINGS,
  type Settings,
} from "@/lib/validation/settings";

const SETTINGS_KEY = "settings";

export interface SettingsService {
  get(): Promise<Settings>;
  save(value: Settings): Promise<Settings>;
  reset(): Promise<{ reset: true }>;
}

export const settingsService: SettingsService = {
  async get(): Promise<Settings> {
    const row = await db.userPreference.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row) return DEFAULT_SETTINGS;
    try {
      const parsed = settingsSchema.safeParse(JSON.parse(row.value));
      return parsed.success ? parsed.data : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async save(value: Settings): Promise<Settings> {
    const valid = settingsSchema.parse(value);
    const json = JSON.stringify(valid);
    await db.userPreference.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: json },
      create: { key: SETTINGS_KEY, value: json },
    });
    return valid;
  },

  async reset(): Promise<{ reset: true }> {
    await db.userPreference.deleteMany({ where: { key: SETTINGS_KEY } });
    return { reset: true };
  },
};
