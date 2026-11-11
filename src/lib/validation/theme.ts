// src/lib/validation/theme.ts
// Zod schema for calculator theme configuration.
// Imported themes are validated strictly; we never execute imported JS/CSS/HTML.

import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Invalid color: must be hex like #fff or #ffffff");

const colorOrRgba = z
  .string()
  .max(80)
  .refine(
    (s) =>
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s) ||
      /^rgba?\([^)]+\)$/i.test(s) ||
      /^transparent$/i.test(s),
    "Invalid color (must be hex, rgba(), or 'transparent')",
  );

export const themeColorsSchema = z.object({
  primary: colorOrRgba,
  secondary: colorOrRgba,
  background: colorOrRgba,
  button: colorOrRgba,
  buttonHover: colorOrRgba.optional(),
  operator: colorOrRgba,
  display: colorOrRgba,
  displayText: colorOrRgba,
  text: colorOrRgba,
  border: colorOrRgba,
});

export const themeSizingSchema = z.object({
  cornerRadius: z.number().min(0).max(32).default(12),
  buttonSize: z.number().min(24).max(96).default(56),
  displaySize: z.number().min(12).max(48).default(32),
  fontSize: z.number().min(10).max(32).default(14),
  iconSize: z.number().min(10).max(32).default(16),
  spacing: z.number().min(0).max(16).default(8),
  blur: z.number().min(0).max(40).default(0),
  transparency: z.number().min(0).max(1).default(1),
  shadow: z.string().max(200).default("0 4px 12px rgba(0,0,0,0.15)"),
});

export const themeFontsSchema = z.object({
  fontFamily: z.string().max(200).default("'Inter', system-ui, sans-serif"),
  fontWeight: z.number().min(100).max(900).step(100).default(400),
  displayFontFamily: z.string().max(200).default("'JetBrains Mono', monospace"),
});

// themeConfigSchema — what /api/themes POST expects as the request body.
export const themeConfigSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional().default(""),
  configuration: z.object({
    colors: themeColorsSchema,
    sizing: themeSizingSchema,
    fonts: themeFontsSchema,
  }),
  category: z
    .enum(["official", "developer", "community", "personal"])
    .default("personal"),
  isDefault: z.boolean().default(false),
});

// themeConfigurationSchema — just the configuration sub-tree (used internally).
export const themeConfigurationSchema = z.object({
  colors: themeColorsSchema,
  sizing: themeSizingSchema,
  fonts: themeFontsSchema,
});

// full theme import schema (for /api/themes/import — accepts a single theme
// or a list). The API takes one at a time.
export const themeSchema = themeConfigSchema;

export type ThemeConfiguration = z.infer<typeof themeConfigurationSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type ThemeInput = z.infer<typeof themeSchema>;

// Backwards-compat: older code may import this name.
export const themeConfigSchemaAliases = { themeSchema };
