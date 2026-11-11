// src/components/calculator/KeyboardHandler.tsx
// Mounts the global keyboard listener. Renders nothing.

"use client";

import { useKeyboard } from "@/hooks/useKeyboard";

export function KeyboardHandler() {
  useKeyboard();
  return null;
}
