// src/services/history-service.ts
// Server-only service: business logic for calculation history.
//
// The /api/history routes call historyService.list / .get / .evaluateAndStore /
// .toggleStar / .clearAll / .delete. This module implements that contract on
// top of the Prisma-backed repository.

import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { tryEvaluate, formatDecimal, type AngleUnit } from "@/engine";

export type HistoryItem = Prisma.CalculationHistoryGetPayload<object>;

export interface HistoryListResult {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HistoryListQuery {
  mode?: string;
  search?: string;
  starred?: boolean;
  sort?: "createdAt_asc" | "createdAt_desc";
  page: number;
  pageSize: number;
}

export interface HistoryService {
  list(query: HistoryListQuery): Promise<HistoryListResult>;
  get(id: string): Promise<HistoryItem | null>;
  /** Evaluate the expression with the math engine and store the result. */
  evaluateAndStore(
    expression: string,
    mode: string,
    angleUnit: string,
  ): Promise<HistoryItem>;
  toggleStar(id: string): Promise<HistoryItem | null>;
  delete(id: string): Promise<{ deleted: string }>;
  clearAll(): Promise<{ cleared: true }>;
}

export const historyService: HistoryService = {
  async list(query) {
    const where: Prisma.CalculationHistoryWhereInput = {};
    if (query.mode) where.mode = query.mode;
    if (query.starred !== undefined) where.starred = query.starred;
    if (query.search) {
      where.OR = [
        { expression: { contains: query.search } },
        { result: { contains: query.search } },
      ];
    }
    const orderBy: Prisma.CalculationHistoryOrderByWithRelationInput =
      query.sort === "createdAt_asc"
        ? { createdAt: "asc" }
        : { createdAt: "desc" };
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const [items, total] = await Promise.all([
      db.calculationHistory.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.calculationHistory.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  async get(id) {
    return db.calculationHistory.findUnique({ where: { id } });
  },

  async evaluateAndStore(expression, mode, angleUnit) {
    const unit: AngleUnit = angleUnit === "deg" ? "deg" : "rad";
    const outcome = tryEvaluate(expression, { angleUnit: unit });
    const result = outcome.ok ? outcome.text ?? "" : "Error";
    const error = outcome.ok ? null : (outcome.error?.message ?? "Error");
    return db.calculationHistory.create({
      data: {
        expression,
        result,
        mode,
        angleUnit: angleUnit ?? null,
        error,
      },
    });
  },

  async toggleStar(id) {
    const item = await db.calculationHistory.findUnique({ where: { id } });
    if (!item) return null;
    return db.calculationHistory.update({
      where: { id },
      data: { starred: !item.starred },
    });
  },

  async delete(id) {
    await db.calculationHistory.delete({ where: { id } });
    return { deleted: id };
  },

  async clearAll() {
    await db.calculationHistory.deleteMany({});
    return { cleared: true as const };
  },
};

// Re-export for any callers that imported the legacy function names.
export { formatDecimal };

// Legacy compatibility wrappers (used by tests or other callers).
export async function fetchHistoryPage(query: {
  page?: number;
  pageSize?: number;
  search?: string;
  mode?: string;
  sort?: "asc" | "desc";
  starred?: boolean;
}): Promise<HistoryListResult> {
  const sort =
    query.sort === "asc"
      ? ("createdAt_asc" as const)
      : ("createdAt_desc" as const);
  return historyService.list({
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
    search: query.search,
    mode: query.mode,
    starred: query.starred,
    sort,
  });
}

export async function saveCalculation(input: {
  expression: string;
  result: string;
  mode: string;
  angleUnit?: string | null;
  error?: string | null;
}) {
  return db.calculationHistory.create({
    data: {
      expression: input.expression,
      result: input.result,
      mode: input.mode,
      angleUnit: input.angleUnit ?? null,
      error: input.error ?? null,
    },
  });
}
