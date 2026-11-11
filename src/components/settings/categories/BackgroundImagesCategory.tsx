// src/components/settings/categories/BackgroundImagesCategory.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "./shared";
import { toast } from "sonner";

interface ImageRow {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  fileSize: number;
  createdAt: string;
}

export function BackgroundImagesCategory() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/images");
    const data = await res.json();
    setImages(data.images ?? []);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const saved = localStorage.getItem("calc.background");
    if (saved) setActiveId(saved);
  }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/images", { method: "POST", body: form });
    if (res.ok) {
      toast.success("Image uploaded");
      load();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Upload failed");
    }
  };

  const onActivate = (id: string) => {
    setActiveId(id);
    localStorage.setItem("calc.background", id);
    toast.success("Background applied (reload to see full effect)");
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (activeId === id) {
      setActiveId(null);
      localStorage.removeItem("calc.background");
    }
    load();
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Background Images"
        description="Upload PNG/JPEG/WebP/GIF (≤5MB, ≤4000px). Stored outside public/."
      />
      <Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onUpload} />
      <div className="grid grid-cols-2 gap-2">
        {images.map((img) => (
          <div key={img.id} className="rounded-md border p-2 space-y-1">
            <img
              src={`/api/images/${img.id}`}
              alt={img.originalName}
              className="h-20 w-full object-cover rounded"
            />
            <div className="text-xs truncate">{img.originalName}</div>
            <div className="text-[10px] opacity-60">
              {img.width}×{img.height} · {(img.fileSize / 1024).toFixed(1)}KB
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant={activeId === img.id ? "default" : "outline"} onClick={() => onActivate(img.id)}>
                {activeId === img.id ? "Active" : "Set"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(img.id)}>Del</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
