// src/components/display/LcdDisplay.tsx
// Segmented LCD-style display. Shows the main result (large), the expression
// preview (small, above), and status indicators (M, DEG/RAD, ERR).

"use client";

import { useCalculator } from "@/context/CalculatorContext";
import { cn } from "@/lib/utils";

export function LcdDisplay() {
  const { state, preview } = useCalculator();
  const hasMemory = state.memory !== 0;
  const showError = !!state.error;
  const showPreview = !!preview && !state.error;

  return (
    <div
      role="region"
      aria-label="Calculator display"
      className="relative w-full rounded-2xl p-4 sm:p-5 select-none overflow-hidden border"
      style={{
        background: "var(--calc-display-bg)",
        color: "var(--calc-display-fg)",
        borderColor: "var(--calc-border)",
      }}
    >
      {/* Status row */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono opacity-80 mb-1">
        <div className="flex gap-2">
          {hasMemory && (
            <span className="font-bold" aria-label="Memory in use">M</span>
          )}
        </div>
        <div className="flex gap-2 uppercase tracking-wider">
          <span>{state.angleUnit}</span>
          <span>{state.mode === "scientific" ? "SCI" : state.mode === "advanced" ? "ADV" : "STD"}</span>
          {showError && <span className="text-rose-400 font-bold">ERR</span>}
        </div>
      </div>

      {/* Expression preview line */}
      <div
        className="h-5 sm:h-6 text-right text-xs sm:text-sm font-mono opacity-70 truncate"
        aria-live="polite"
      >
        {showError
          ? state.error
          : showPreview && preview
            ? `= ${preview.value}`
            : state.expression || "\u00a0"}
      </div>

      {/* Main result line */}
      <div
        className={cn(
          "text-right font-mono font-semibold leading-tight tabular-nums break-all",
          "text-3xl sm:text-4xl md:text-5xl",
          showError && "text-rose-400",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {state.result}
      </div>
    </div>
  );
}
