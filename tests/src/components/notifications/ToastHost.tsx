// src/components/notifications/ToastHost.tsx
// Sonner toaster host with theme-aware styling.

"use client";

import { Toaster } from "@/components/ui/sonner";

export function ToastHost() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-lg",
        },
      }}
    />
  );
}
