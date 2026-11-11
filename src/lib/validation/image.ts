// src/lib/validation/image.ts
// Validation for uploaded image files.

import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_DIMENSION = 4000;
export const MAX_IMAGE_PIXELS = 16_000_000; // 4000*4000

export const imageMetadataSchema = z.object({
  filename: z.string().min(1).max(200),
  mimeType: z.enum(ALLOWED_IMAGE_TYPES),
  fileSize: z.number().int().min(1).max(MAX_IMAGE_SIZE_BYTES),
  width: z.number().int().positive().max(MAX_IMAGE_DIMENSION).optional(),
  height: z.number().int().positive().max(MAX_IMAGE_DIMENSION).optional(),
});

export const imageTransformSchema = z.object({
  rotate: z.number().int().min(0).max(360).default(0),
  brightness: z.number().min(0).max(2).default(1),
  blur: z.number().min(0).max(20).default(0),
  fit: z.enum(["contain", "cover", "fill", "inside", "outside"]).default("cover"),
  // crop rectangle: {x, y, w, h}
  crop: z
    .object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      w: z.number().int().positive(),
      h: z.number().int().positive(),
    })
    .optional(),
});

export type ImageTransform = z.infer<typeof imageTransformSchema>;

// Magic-byte signatures for actual file-type validation (do NOT trust
// client-provided MIME type).
export const FILE_SIGNATURES: Record<string, { offset: number; bytes: number[] }> = {
  "image/png": { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
  "image/jpeg": { offset: 0, bytes: [0xff, 0xd8, 0xff] },
  "image/jpg": { offset: 0, bytes: [0xff, 0xd8, 0xff] },
  "image/webp": { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF, webp is RIFF...WEBP
  "image/gif": { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }, // GIF8
};

/** Detect actual file type from raw bytes; returns MIME or null. */
export function detectImageMime(bytes: Uint8Array): string | null {
  for (const [mime, sig] of Object.entries(FILE_SIGNATURES)) {
    if (bytes.length < sig.offset + sig.bytes.length) continue;
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (bytes[sig.offset + i] !== sig.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      // WebP needs additional check for "WEBP" at offset 8
      if (mime === "image/webp") {
        if (bytes.length >= 12) {
          const tag = String.fromCharCode(...bytes.slice(8, 12));
          if (tag !== "WEBP") continue;
        }
      }
      return mime;
    }
  }
  return null;
}

/** Sanitize a user-provided filename. Strips path components and unsafe chars. */
export function sanitizeFilename(name: string): string {
  const base = name.replace(/^.*[\\/]/, "");
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.slice(0, 200) || "uploaded";
}
