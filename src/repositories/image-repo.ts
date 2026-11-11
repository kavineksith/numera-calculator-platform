// src/repositories/image-repo.ts

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type ImageRow = Prisma.UploadedImageGetPayload<object>;

export async function createImage(data: {
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  transforms?: string | null;
}): Promise<ImageRow> {
  return db.uploadedImage.create({
    data: {
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      width: data.width ?? null,
      height: data.height ?? null,
      transforms: data.transforms ?? null,
    },
  });
}

export async function getImageById(id: string): Promise<ImageRow | null> {
  return db.uploadedImage.findUnique({ where: { id } });
}

export async function getImageByFilename(filename: string): Promise<ImageRow | null> {
  return db.uploadedImage.findUnique({ where: { filename } });
}

export async function listImages(limit = 50): Promise<ImageRow[]> {
  return db.uploadedImage.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function deleteImage(id: string): Promise<{ filename: string | null }> {
  const row = await db.uploadedImage.findUnique({ where: { id } });
  if (!row) return { filename: null };
  await db.uploadedImage.delete({ where: { id } });
  return { filename: row.filename };
}
