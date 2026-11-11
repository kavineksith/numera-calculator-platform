// src/components/Providers.tsx
// Client-side providers wrapper. Keeps the root layout a server component.

"use client";

import { CalculatorProvider } from "@/context/CalculatorContext";
import { ToastHost } from "@/components/notifications/ToastHost";
import { LiveRegion } from "@/components/accessibility/LiveRegion";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CalculatorProvider>
      {children}
      <LiveRegion />
      <ToastHost />
    </CalculatorProvider>
  );
}
