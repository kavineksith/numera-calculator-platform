// src/components/display/ErrorRibbon.tsx
// Top-of-page notification ribbon shown when there is an active math error.

"use client";

import { useCalculator } from "@/context/CalculatorContext";
import { AlertTriangle, X } from "lucide-react";

export function ErrorRibbon() {
  const { state, dispatch } = useCalculator();
  if (!state.error) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-md border border-rose-300 bg-rose-50 text-rose-800 px-3 py-2 text-sm dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{state.error}</span>
      <button
        type="button"
        onClick={() => dispatch({ type: "CLEAR_ERROR" })}
        aria-label="Dismiss error"
        className="rounded p-1 hover:bg-rose-100 dark:hover:bg-rose-900"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
