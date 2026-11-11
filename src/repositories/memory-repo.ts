// src/repositories/memory-repo.ts

import { db } from "@/lib/db";

export async function getMemoryRegister(name: string): Promise<string | null> {
  const row = await db.memoryRegister.findUnique({ where: { registerName: name } });
  return row?.value ?? null;
}

export async function setMemoryRegister(name: string, value: string, label?: string): Promise<void> {
  await db.memoryRegister.upsert({
    where: { registerName: name },
    update: { value, label: label ?? undefined },
    create: { registerName: name, value, label },
  });
}

export async function listMemoryRegisters(): Promise<Array<{ registerName: string; value: string; label: string | null }>> {
  return db.memoryRegister.findMany({
    orderBy: { registerName: "asc" },
  });
}

export async function clearMemoryRegister(name: string): Promise<void> {
  await db.memoryRegister.deleteMany({ where: { registerName: name } });
}

export async function clearAllMemory(): Promise<{ count: number }> {
  const r = await db.memoryRegister.deleteMany({});
  return { count: r.count };
}
