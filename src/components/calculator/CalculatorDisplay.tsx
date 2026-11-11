// src/components/calculator/CalculatorDisplay.tsx
// Wraps the LCD display + error ribbon into a single surface.

"use client";

import { LcdDisplay } from "@/components/display/LcdDisplay";
import { ErrorRibbon } from "@/components/display/ErrorRibbon";

export function CalculatorDisplay() {
  return (
    <div className="space-y-2">
      <ErrorRibbon />
      <LcdDisplay />
    </div>
  );
}
