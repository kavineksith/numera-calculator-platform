// src/components/image-editor/ImageEditor.tsx
// Lightweight client-side preview of an uploaded image. Server-side transforms
// (rotate/brightness/blur/fit/crop) can be applied via /api/images/[id] (the
// image-service.applyTransforms helper). For brevity, this component previews
// client-side CSS filters and POSTs the chosen transform to the server.

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function ImageEditorPanel({ imageId }: { imageId: string | null }) {
  const [brightness, setBrightness] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [saved, setSaved] = useState(false);

  const markUnsaved = () => setSaved(false);

  if (!imageId) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm opacity-70">
        Upload an image to edit it.
      </div>
    );
  }

  const saveTransforms = async () => {
    await fetch(`/api/images/${imageId}`, {
      method: "POST",
      body: JSON.stringify({ transforms: { brightness, blur, rotate } }),
    }).catch(() => {});
    setSaved(true);
  };

  return (
    <div className="space-y-3">
      <img
        src={`/api/images/${imageId}`}
        alt="Preview"
        className="max-h-64 mx-auto rounded-md border"
        style={{
          filter: `brightness(${brightness}%) blur(${blur}px)`,
          transform: `rotate(${rotate}deg)`,
        }}
      />
      <div>
        <Label className="text-xs">Brightness: {brightness}%</Label>
        <Slider value={[brightness]} min={50} max={200} step={5} onValueChange={(v) => { setBrightness(v[0]!); markUnsaved(); }} />
      </div>
      <div>
        <Label className="text-xs">Blur: {blur}px</Label>
        <Slider value={[blur]} min={0} max={20} step={1} onValueChange={(v) => { setBlur(v[0]!); markUnsaved(); }} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => { setRotate((r) => (r + 90) % 360); markUnsaved(); }}>Rotate 90°</Button>
        <Button size="sm" onClick={saveTransforms}>{saved ? "Saved" : "Save transforms"}</Button>
      </div>
    </div>
  );
}
