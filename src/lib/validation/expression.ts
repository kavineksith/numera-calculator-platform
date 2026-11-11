// src/lib/validation/expression.ts
// Zod validation for mathematical expressions entering the API.
//
// The math engine has its own tokenizer/parser which catches malformed
// expressions at evaluation time. This schema enforces basic shape rules
// (length, allowed characters) so we can reject obviously-malicious inputs
// before they ever reach the parser.

import { z } from "zod";

const MAX_EXPRESSION_LENGTH = 500;

// Allow: digits, letters, + - * / ^ % ! ( ) , . and whitespace
const EXPRESSION_PATTERN = /^[0-9a-zA-Z_+\-*/^%!(),.\s]+$/;

export const expressionSchema = z
  .string()
  .trim()
  .min(1, "Expression cannot be empty")
  .max(MAX_EXPRESSION_LENGTH, `Expression too long (max ${MAX_EXPRESSION_LENGTH} chars)`)
  .regex(EXPRESSION_PATTERN, "Expression contains invalid characters");

export const calculatorModeSchema = z.enum([
  "standard",
  "scientific",
  "advanced",
]);

export const angleUnitSchema = z.enum(["deg", "rad"]).nullable();

export const createHistoryEntrySchema = z.object({
  expression: expressionSchema,
  result: z.string().min(1).max(500),
  mode: calculatorModeSchema,
  angleUnit: angleUnitSchema.optional().nullable(),
  error: z.string().max(500).optional(),
});

// Stateless evaluation request (used by /api/evaluate).
export const evaluateRequestSchema = z.object({
  expression: expressionSchema,
  angleUnit: z.enum(["deg", "rad"]).default("rad"),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  mode: calculatorModeSchema.optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  starred: z
    .union([z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true" || v === "1")),
});

export type CalculatorMode = z.infer<typeof calculatorModeSchema>;
export type AngleUnitValue = z.infer<typeof angleUnitSchema>;
