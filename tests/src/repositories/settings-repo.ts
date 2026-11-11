// src/repositories/settings-repo.ts

import { db } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.userPreference.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.userPreference.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.userPreference.findMany();
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function deleteSetting(key: string): Promise<void> {
  await db.userPreference.deleteMany({ where: { key } });
}

export async function getApplicationSetting(key: string): Promise<string | null> {
  const row = await db.applicationSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setApplicationSetting(key: string, value: string): Promise<void> {
  await db.applicationSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
