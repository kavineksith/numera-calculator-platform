// src/repositories/theme-repo.ts

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type ThemeRow = Prisma.ThemeGetPayload<object>;

export async function listThemes(category?: string): Promise<ThemeRow[]> {
  return db.theme.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export async function getThemeById(id: string): Promise<ThemeRow | null> {
  return db.theme.findUnique({ where: { id } });
}

export async function getThemeByName(name: string): Promise<ThemeRow | null> {
  return db.theme.findUnique({ where: { name } });
}

export async function getDefaultTheme(): Promise<ThemeRow | null> {
  return db.theme.findFirst({ where: { isDefault: true } });
}

export async function createTheme(data: {
  name: string;
  description?: string;
  configuration: string; // JSON string
  isDefault?: boolean;
  isBuiltIn?: boolean;
  category?: string;
}): Promise<ThemeRow> {
  // If this theme is set as default, unset others first.
  if (data.isDefault) {
    await db.theme.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }
  return db.theme.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      configuration: data.configuration,
      isDefault: data.isDefault ?? false,
      isBuiltIn: data.isBuiltIn ?? false,
      category: data.category ?? "personal",
    },
  });
}

export async function updateTheme(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    configuration: string;
    isDefault: boolean;
    category: string;
  }>
): Promise<ThemeRow | null> {
  if (data.isDefault) {
    await db.theme.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }
  try {
    return await db.theme.update({ where: { id }, data });
  } catch {
    return null;
  }
}

export async function deleteTheme(id: string): Promise<boolean> {
  try {
    // Built-in themes cannot be deleted.
    const t = await db.theme.findUnique({ where: { id } });
    if (!t || t.isBuiltIn) return false;
    await db.theme.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
