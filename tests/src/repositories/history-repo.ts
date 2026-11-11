// src/repositories/history-repo.ts
// Data-access layer for calculation history. Server-only.

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface HistoryQuery {
  page: number;
  pageSize: number;
  search?: string;
  mode?: string;
  sort?: "asc" | "desc";
  starred?: boolean;
}

export interface HistoryPage {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type HistoryItem = Prisma.CalculationHistoryGetPayload<object>;

export async function listHistory(q: HistoryQuery): Promise<HistoryPage> {
  const where: Prisma.CalculationHistoryWhereInput = {};
  if (q.search) {
    where.OR = [
      { expression: { contains: q.search } },
      { result: { contains: q.search } },
    ];
  }
  if (q.mode) where.mode = q.mode;
  if (q.starred !== undefined) where.starred = q.starred;

  const orderBy: Prisma.CalculationHistoryOrderByWithRelationInput = {
    createdAt: q.sort === "asc" ? "asc" : "desc",
  };

  const [items, total] = await Promise.all([
    db.calculationHistory.findMany({
      where,
      orderBy,
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    db.calculationHistory.count({ where }),
  ]);

  return { items, total, page: q.page, pageSize: q.pageSize };
}

export async function createHistoryEntry(data: {
  expression: string;
  result: string;
  mode: string;
  angleUnit?: string | null;
  error?: string | null;
}): Promise<HistoryItem> {
  return db.calculationHistory.create({
    data: {
      expression: data.expression,
      result: data.result,
      mode: data.mode,
      angleUnit: data.angleUnit ?? null,
      error: data.error ?? null,
    },
  });
}

export async function getHistoryById(id: string): Promise<HistoryItem | null> {
  return db.calculationHistory.findUnique({ where: { id } });
}

export async function deleteHistoryById(id: string): Promise<void> {
  await db.calculationHistory.delete({ where: { id } });
}

export async function clearAllHistory(): Promise<{ count: number }> {
  const r = await db.calculationHistory.deleteMany({});
  return { count: r.count };
}

export async function setStarred(id: string, starred: boolean): Promise<HistoryItem | null> {
  try {
    return await db.calculationHistory.update({
      where: { id },
      data: { starred },
    });
  } catch {
    return null;
  }
}

export async function bulkInsert(
  items: Array<{
    expression: string;
    result: string;
    mode: string;
    angleUnit?: string | null;
    error?: string | null;
    createdAt?: Date;
  }>
): Promise<number> {
  if (items.length === 0) return 0;
  // SQLite supports batched inserts via createMany
  const r = await db.calculationHistory.createMany({
    data: items.map((i) => ({
      expression: i.expression,
      result: i.result,
      mode: i.mode,
      angleUnit: i.angleUnit ?? null,
      error: i.error ?? null,
      createdAt: i.createdAt ?? new Date(),
    })),
  });
  return r.count;
}
