// src/repositories/recovery-repo.ts

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type RecoveryRow = Prisma.RecoverySnapshotGetPayload<object>;

export const RECOVERY_SCHEMA_VERSION = 1;

export async function getLatestSnapshot(): Promise<RecoveryRow | null> {
  return db.recoverySnapshot.findFirst({
    orderBy: { createdAt: "desc" },
  });
}

export async function saveSnapshot(snapshot: string, source: "auto" | "manual" | "import" = "auto"): Promise<RecoveryRow> {
  return db.recoverySnapshot.create({
    data: {
      snapshot,
      version: RECOVERY_SCHEMA_VERSION,
      source,
    },
  });
}

export async function clearSnapshots(): Promise<{ count: number }> {
  const r = await db.recoverySnapshot.deleteMany({});
  return { count: r.count };
}
