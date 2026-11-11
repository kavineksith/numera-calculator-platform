// src/services/recovery-service.ts
import "server-only";
import { z } from "zod";
import {
  getLatestSnapshot,
  saveSnapshot,
  clearSnapshots,
  RECOVERY_SCHEMA_VERSION,
} from "@/repositories/recovery-repo";

export const snapshotPayloadSchema = z.object({
  expression: z.string().max(500).default(""),
  result: z.string().max(500).default(""),
  mode: z.enum(["standard", "scientific", "advanced"]).default("standard"),
  angleUnit: z.enum(["deg", "rad"]).default("deg"),
  memory: z.record(z.string(), z.string()).default({}),
  version: z.number().int().default(RECOVERY_SCHEMA_VERSION),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type SnapshotPayload = z.infer<typeof snapshotPayloadSchema>;

export async function getLatest(): Promise<SnapshotPayload | null> {
  const row = await getLatestSnapshot();
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.snapshot);
    const result = snapshotPayloadSchema.safeParse(parsed);
    if (!result.success) return null;
    if (result.data.version !== RECOVERY_SCHEMA_VERSION) {
      // For now: accept older versions but flag in console. A real migration
      // path would transform older shapes into the current one.
      // (Documented in ARCHITECTURE.md as a known limitation.)
    }
    return result.data;
  } catch {
    return null;
  }
}

export async function save(payload: SnapshotPayload, source: "auto" | "manual" | "import" = "auto") {
  const valid = snapshotPayloadSchema.parse(payload);
  return saveSnapshot(JSON.stringify(valid), source);
}

export async function clear() {
  return clearSnapshots();
}
