// src/components/image-editor/ImageUploader.tsx
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export function ImageUploader({ onUploaded }: { onUploaded: (id: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/images", { method: "POST", body: form });
    if (res.ok) {
      const data = await res.json();
      toast.success("Uploaded");
      onUploaded(data.id);
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Upload failed");
    }
  };
  return (
    <div>
      <Button variant="outline" onClick={() => ref.current?.click()}>
        <Upload className="h-4 w-4" /> Upload image
      </Button>
      <input ref={ref} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  );
}
