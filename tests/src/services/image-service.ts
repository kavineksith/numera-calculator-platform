// src/services/image-service.ts
// Server-only service for image upload, transformation, deletion.

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import {
  createImage,
  getImageById,
  getImageByFilename,
  deleteImage,
  listImages,
} from "@/repositories/image-repo";
import { STORAGE_PATHS, ensureStorageDirs, isPathSafe } from "@/lib/storage/paths";
import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_DIMENSION,
  detectImageMime,
  sanitizeFilename,
  imageTransformSchema,
  type ImageTransform,
} from "@/lib/validation/image";

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  width: number;
  height: number;
  fileSize: number;
}

export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  clientMime: string
): Promise<UploadResult> {
  ensureStorageDirs();

  // 1. File-size check
  if (buffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `File exceeds maximum allowed size (${MAX_IMAGE_SIZE_BYTES} bytes)`
    );
  }

  // 2. Magic-byte validation (NEVER trust client MIME type)
  const detectedMime = detectImageMime(new Uint8Array(buffer.slice(0, 32)));
  if (!detectedMime) {
    throw new Error("File is not a valid image (magic byte check failed)");
  }
  if (clientMime && clientMime !== detectedMime) {
    // Accept the detected one but warn — we never trust the client value.
  }

  // 3. Decode with sharp (catches truncated/malformed files)
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch (e) {
    throw new Error(`Failed to decode image: ${e instanceof Error ? e.message : "unknown error"}`);
  }
  if (metadata.width && metadata.height) {
    if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
      throw new Error(`Image dimensions exceed maximum (${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION})`);
    }
    if (metadata.width * metadata.height > 16_000_000) {
      throw new Error("Image has too many pixels");
    }
  }

  // 4. Randomize internal filename (never trust user-supplied name as path)
  const sanitizedOriginal = sanitizeFilename(originalName);
  const ext = path.extname(sanitizedOriginal) || mimeToExtension(detectedMime);
  const randomId = crypto.randomBytes(16).toString("hex");
  const internalFilename = `${randomId}${ext}`;
  const targetPath = path.join(STORAGE_PATHS.uploads, internalFilename);

  // 5. Verify path safety (defense against path traversal)
  if (!isPathSafe(STORAGE_PATHS.uploads, targetPath)) {
    throw new Error("Resolved path is outside the uploads directory");
  }

  // 6. Write to disk
  await fs.writeFile(targetPath, buffer);

  // 7. Persist metadata
  const row = await createImage({
    filename: internalFilename,
    originalName: sanitizedOriginal,
    mimeType: detectedMime,
    fileSize: buffer.byteLength,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  });

  return {
    id: row.id,
    filename: internalFilename,
    originalName: sanitizedOriginal,
    mimeType: detectedMime,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    fileSize: buffer.byteLength,
  };
}

export async function getImageFile(
  id: string
): Promise<{ buffer: Buffer; mimeType: string; filename: string } | null> {
  const row = await getImageById(id);
  if (!row) return null;
  const filePath = path.join(STORAGE_PATHS.uploads, row.filename);
  if (!isPathSafe(STORAGE_PATHS.uploads, filePath)) return null;
  try {
    const buffer = await fs.readFile(filePath);
    return { buffer, mimeType: row.mimeType, filename: row.filename };
  } catch {
    return null;
  }
}

export async function removeImage(id: string): Promise<boolean> {
  const { filename } = await deleteImage(id);
  if (!filename) return false;
  const filePath = path.join(STORAGE_PATHS.uploads, filename);
  if (!isPathSafe(STORAGE_PATHS.uploads, filePath)) return false;
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    // file may already be gone — that's fine
    return true;
  }
}

export async function listAllImages(limit = 50) {
  return listImages(limit);
}

function mimeToExtension(mime: string): string {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return ".bin";
  }
}
