// src/components/accessibility/LiveRegion.tsx
// Polite live region that announces the calculator result for screen readers.

"use client";

import { useCalculator } from "@/context/CalculatorContext";

export function LiveRegion() {
  const { state } = useCalculator();
  const message = state.error
    ? `Error: ${state.error}`
    : state.justEvaluated
      ? `Result: ${state.result}`
      : state.expression
        ? `Editing: ${state.expression}`
        : "Calculator ready";
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
