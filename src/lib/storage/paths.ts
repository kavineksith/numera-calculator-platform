// src/lib/storage/paths.ts
// Resolves storage directory paths. Storage MUST live outside public/.
// The directory is configured via STORAGE_DIR env var (defaults to ./storage).

import path from "node:path";
import fs from "node:fs";

const ROOT = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(process.cwd(), "storage");

export const STORAGE_PATHS = {
  root: ROOT,
  uploads: path.join(ROOT, "uploads"),
  backgrounds: path.join(ROOT, "backgrounds"),
  exports: path.join(ROOT, "exports"),
  backups: path.join(ROOT, "backups"),
} as const;

/** Ensure all storage subdirectories exist. Safe to call repeatedly. */
export function ensureStorageDirs(): void {
  for (const p of Object.values(STORAGE_PATHS)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

/**
 * Prevent path traversal. Returns true if `target` is inside `base`.
 */
export function isPathSafe(base: string, target: string): boolean {
  const resolvedBase = path.resolve(base);
  const resolvedTarget = path.resolve(target);
  const rel = path.relative(resolvedBase, resolvedTarget);
  return !!rel && !rel.startsWith("..") && !path.isAbsolute(rel);
}
