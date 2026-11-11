// src/services/theme-service.ts
// Server-only service for theme CRUD + built-in seeding.
//
// /api/themes routes call:
//   themeService.seedBuiltIns()
//   themeService.list()
//   themeService.create(config)         // config is a ThemeConfig (validated)
//   themeService.get(id)
//   themeService.update(id, config)
//   themeService.delete(id)
//   themeService.importTheme(payload, overwrite)

import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  themeConfigSchema,
  type ThemeConfig,
} from "@/lib/validation/theme";

export type ThemeRow = Prisma.ThemeGetPayload<object>;

export interface ThemeService {
  seedBuiltIns(): Promise<void>;
  list(): Promise<ThemeRow[]>;
  get(id: string): Promise<ThemeRow | null>;
  create(config: ThemeConfig): Promise<ThemeRow>;
  update(id: string, config: ThemeConfig): Promise<ThemeRow>;
  delete(id: string): Promise<{ deleted: string }>;
  importTheme(payload: unknown, overwrite: boolean): Promise<ThemeRow>;
  exportAll(): Promise<ThemeRow[]>;
}

const BUILT_IN_THEMES: Array<{
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  configuration: ThemeConfig["configuration"];
}> = [
  {
    name: "Light",
    description: "Clean light theme",
    category: "official",
    isDefault: true,
    configuration: {
      colors: {
        primary: "#0f172a",
        secondary: "#475569",
        background: "#f8fafc",
        button: "#ffffff",
        buttonHover: "#f1f5f9",
        operator: "#0ea5e9",
        display: "#1e293b",
        displayText: "#22d3ee",
        text: "#0f172a",
        border: "#e2e8f0",
      },
      sizing: {
        cornerRadius: 12,
        buttonSize: 56,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 8,
        blur: 0,
        transparency: 1,
        shadow: "0 4px 12px rgba(0,0,0,0.08)",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "Dark",
    description: "Dark theme for low-light use",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#f1f5f9",
        secondary: "#94a3b8",
        background: "#0f172a",
        button: "#1e293b",
        buttonHover: "#334155",
        operator: "#22d3ee",
        display: "#020617",
        displayText: "#34d399",
        text: "#f1f5f9",
        border: "#1e293b",
      },
      sizing: {
        cornerRadius: 12,
        buttonSize: 56,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 8,
        blur: 0,
        transparency: 1,
        shadow: "0 4px 12px rgba(0,0,0,0.4)",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "Midnight",
    description: "Deep midnight blue tones",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#e0e7ff",
        secondary: "#a5b4fc",
        background: "#1e1b4b",
        button: "#312e81",
        buttonHover: "#3730a3",
        operator: "#a78bfa",
        display: "#0c0a3e",
        displayText: "#c4b5fd",
        text: "#e0e7ff",
        border: "#312e81",
      },
      sizing: {
        cornerRadius: 14,
        buttonSize: 56,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 8,
        blur: 4,
        transparency: 0.95,
        shadow: "0 6px 20px rgba(67,56,202,0.5)",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "OLED Black",
    description: "True black for OLED displays",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#ffffff",
        secondary: "#9ca3af",
        background: "#000000",
        button: "#0a0a0a",
        buttonHover: "#171717",
        operator: "#f97316",
        display: "#000000",
        displayText: "#22d3ee",
        text: "#ffffff",
        border: "#171717",
      },
      sizing: {
        cornerRadius: 10,
        buttonSize: 56,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 8,
        blur: 0,
        transparency: 1,
        shadow: "0 0 0 rgba(0,0,0,0)",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "Classic Calculator",
    description: "Vintage calculator aesthetic",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#1c1917",
        secondary: "#57534e",
        background: "#d6d3d1",
        button: "#fafaf9",
        buttonHover: "#e7e5e4",
        operator: "#ea580c",
        display: "#9ca3af",
        displayText: "#1c1917",
        text: "#1c1917",
        border: "#78716c",
      },
      sizing: {
        cornerRadius: 4,
        buttonSize: 56,
        displaySize: 28,
        fontSize: 14,
        iconSize: 16,
        spacing: 4,
        blur: 0,
        transparency: 1,
        shadow: "0 2px 4px rgba(0,0,0,0.3)",
      },
      fonts: {
        fontFamily: "'Courier New', monospace",
        fontWeight: 700,
        displayFontFamily: "'Courier New', monospace",
      },
    },
  },
  {
    name: "Modern Glass",
    description: "Frosted glass effect",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#0f172a",
        secondary: "#475569",
        background: "#e2e8f0",
        button: "rgba(255,255,255,0.6)",
        buttonHover: "rgba(255,255,255,0.8)",
        operator: "#0ea5e9",
        display: "rgba(15,23,42,0.7)",
        displayText: "#22d3ee",
        text: "#0f172a",
        border: "rgba(255,255,255,0.4)",
      },
      sizing: {
        cornerRadius: 16,
        buttonSize: 56,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 8,
        blur: 20,
        transparency: 0.7,
        shadow: "0 8px 32px rgba(31,38,135,0.2)",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 500,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "Liquid Glass",
    description: "Liquid glass with strong blur",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#1e293b",
        secondary: "#64748b",
        background: "#cbd5e1",
        button: "rgba(255,255,255,0.4)",
        buttonHover: "rgba(255,255,255,0.6)",
        operator: "#8b5cf6",
        display: "rgba(30,41,59,0.6)",
        displayText: "#a78bfa",
        text: "#1e293b",
        border: "rgba(255,255,255,0.5)",
      },
      sizing: {
        cornerRadius: 24,
        buttonSize: 60,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 8,
        blur: 30,
        transparency: 0.6,
        shadow: "0 12px 40px rgba(139,92,246,0.25)",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "Transparent",
    description: "Minimal transparent theme",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#ffffff",
        secondary: "#cbd5e1",
        background: "transparent",
        button: "rgba(255,255,255,0.1)",
        buttonHover: "rgba(255,255,255,0.2)",
        operator: "#10b981",
        display: "rgba(0,0,0,0.4)",
        displayText: "#ffffff",
        text: "#ffffff",
        border: "rgba(255,255,255,0.2)",
      },
      sizing: {
        cornerRadius: 12,
        buttonSize: 56,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 8,
        blur: 8,
        transparency: 0.4,
        shadow: "0 4px 12px rgba(0,0,0,0.2)",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "Minimal",
    description: "Stripped-down minimal design",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#18181b",
        secondary: "#71717a",
        background: "#ffffff",
        button: "#f4f4f5",
        buttonHover: "#e4e4e7",
        operator: "#18181b",
        display: "#fafafa",
        displayText: "#18181b",
        text: "#18181b",
        border: "#e4e4e7",
      },
      sizing: {
        cornerRadius: 8,
        buttonSize: 56,
        displaySize: 32,
        fontSize: 14,
        iconSize: 16,
        spacing: 6,
        blur: 0,
        transparency: 1,
        shadow: "none",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 400,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
  {
    name: "High Contrast",
    description: "Maximum contrast for accessibility",
    category: "official",
    isDefault: false,
    configuration: {
      colors: {
        primary: "#ffffff",
        secondary: "#ffffff",
        background: "#000000",
        button: "#000000",
        buttonHover: "#1a1a1a",
        operator: "#ffff00",
        display: "#000000",
        displayText: "#ffff00",
        text: "#ffffff",
        border: "#ffffff",
      },
      sizing: {
        cornerRadius: 4,
        buttonSize: 60,
        displaySize: 34,
        fontSize: 16,
        iconSize: 18,
        spacing: 8,
        blur: 0,
        transparency: 1,
        shadow: "none",
      },
      fonts: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 700,
        displayFontFamily: "'JetBrains Mono', monospace",
      },
    },
  },
];

export const themeService: ThemeService = {
  async seedBuiltIns() {
    for (const t of BUILT_IN_THEMES) {
      const existing = await db.theme.findUnique({ where: { name: t.name } });
      const config: ThemeConfig = {
        name: t.name,
        description: t.description,
        category: t.category as ThemeConfig["category"],
        isDefault: t.isDefault,
        configuration: t.configuration,
      };
      if (existing) {
        await db.theme.update({
          where: { id: existing.id },
          data: {
            description: t.description,
            isBuiltIn: true,
            category: t.category,
            isDefault: t.isDefault,
            configuration: JSON.stringify(config),
          },
        });
      } else {
        await db.theme.create({
          data: {
            name: t.name,
            description: t.description,
            configuration: JSON.stringify(config),
            isDefault: t.isDefault,
            isBuiltIn: true,
            category: t.category,
          },
        });
      }
    }
  },

  async list() {
    return db.theme.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  },

  async get(id) {
    return db.theme.findUnique({ where: { id } });
  },

  async create(config: ThemeConfig) {
    const valid = themeConfigSchema.parse(config);
    const existing = await db.theme.findUnique({ where: { name: valid.name } });
    if (existing) {
      throw new Error(`A theme named '${valid.name}' already exists`);
    }
    if (valid.isDefault) {
      await db.theme.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    return db.theme.create({
      data: {
        name: valid.name,
        description: valid.description ?? null,
        configuration: JSON.stringify(valid),
        isDefault: valid.isDefault,
        isBuiltIn: false,
        category: valid.category,
      },
    });
  },

  async update(id, config: ThemeConfig) {
    const valid = themeConfigSchema.parse(config);
    const existing = await db.theme.findUnique({ where: { id } });
    if (!existing) throw new Error("Theme not found");
    if (valid.isDefault) {
      await db.theme.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }
    return db.theme.update({
      where: { id },
      data: {
        name: valid.name,
        description: valid.description ?? null,
        configuration: JSON.stringify(valid),
        isDefault: valid.isDefault,
        category: valid.category,
      },
    });
  },

  async delete(id) {
    const t = await db.theme.findUnique({ where: { id } });
    if (!t) throw new Error("Theme not found");
    if (t.isBuiltIn) throw new Error("Built-in themes cannot be deleted");
    await db.theme.delete({ where: { id } });
    return { deleted: id };
  },

  async importTheme(payload, overwrite) {
    const parsed = themeConfigSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(
        `Invalid theme configuration: ${parsed.error.issues
          .map((i) => i.message)
          .join("; ")}`,
      );
    }
    const valid = parsed.data;
    const existing = await db.theme.findUnique({ where: { name: valid.name } });
    if (existing && !overwrite) {
      throw new Error(
        `A theme named '${valid.name}' already exists. Set overwrite=true to replace.`,
      );
    }
    if (existing) {
      return db.theme.update({
        where: { id: existing.id },
        data: {
          description: valid.description ?? null,
          configuration: JSON.stringify(valid),
          isDefault: valid.isDefault,
          category: valid.category,
        },
      });
    }
    return db.theme.create({
      data: {
        name: valid.name,
        description: valid.description ?? null,
        configuration: JSON.stringify(valid),
        isDefault: valid.isDefault,
        isBuiltIn: false,
        category: valid.category,
      },
    });
  },

  async exportAll() {
    return db.theme.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  },
};
