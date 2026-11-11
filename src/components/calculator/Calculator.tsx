// src/components/calculator/Calculator.tsx
// Main orchestrator: mode tabs + display + the active calculator grid +
// keyboard handler.

"use client";

import { useEffect } from "react";
import { useCalculator, type CalcMode } from "@/context/CalculatorContext";
import { useRecovery } from "@/hooks/useRecovery";
import { CalculatorDisplay } from "./CalculatorDisplay";
import { StandardCalculator } from "./StandardCalculator";
import { ScientificCalculator } from "./ScientificCalculator";
import { AdvancedCalculator } from "./AdvancedCalculator";
import { KeyboardHandler } from "./KeyboardHandler";
import { Calculator as CalcIcon, Sigma, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: { id: CalcMode; label: string; icon: typeof CalcIcon }[] = [
  { id: "standard", label: "Standard", icon: CalcIcon },
  { id: "scientific", label: "Scientific", icon: Sigma },
  { id: "advanced", label: "Advanced", icon: FlaskConical },
];

export function Calculator() {
  const { state, dispatch } = useCalculator();

  const restore = (payload: {
    expression: string;
    result: string;
    mode: string;
    angleUnit: string;
    memory: number;
    lastOperator: string | null;
  }) => {
    dispatch({
      type: "LOAD_EXPRESSION",
      expression: payload.expression,
      result: payload.result,
    });
    if (payload.mode === "scientific" || payload.mode === "advanced" || payload.mode === "standard") {
      dispatch({ type: "SET_MODE", mode: payload.mode });
    }
    if (payload.angleUnit === "deg" || payload.angleUnit === "rad") {
      dispatch({ type: "SET_ANGLE", unit: payload.angleUnit });
    }
  };
  useRecovery(restore);

  // Sync online/offline indicator.
  useEffect(() => {
    const on = () => {
      // Flush queued history on reconnect.
      try {
        const q = JSON.parse(localStorage.getItem("calc.history.queue") ?? "[]");
        if (Array.isArray(q) && q.length > 0) {
          q.forEach((item: { expression: string; mode: string; angleUnit: string }) => {
            fetch("/api/history", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(item),
            }).catch(() => {});
          });
          localStorage.removeItem("calc.history.queue");
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("online", on);
    return () => window.removeEventListener("online", on);
  }, []);

  return (
    <div
      className="w-full max-w-md mx-auto rounded-3xl border p-4 sm:p-5 shadow-xl backdrop-blur-sm"
      style={{
        background: "var(--calc-surface)",
        borderColor: "var(--calc-border)",
      }}
    >
      <KeyboardHandler />
      <CalculatorDisplay />

      {/* Mode tabs */}
      <div
        role="tablist"
        aria-label="Calculator mode"
        className="mt-4 grid grid-cols-3 gap-1 rounded-lg p-1"
        style={{ background: "var(--calc-bg)" }}
      >
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = state.mode === m.id;
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={active}
              aria-label={m.label}
              onClick={() => dispatch({ type: "SET_MODE", mode: m.id })}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all",
                active
                  ? "bg-[var(--calc-accent)] text-[var(--calc-accent-fg)] shadow-sm"
                  : "text-[var(--calc-text)] hover:bg-[var(--calc-btn)]",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active calculator body */}
      <div className="mt-4">
        {state.mode === "standard" && <StandardCalculator />}
        {state.mode === "scientific" && <ScientificCalculator />}
        {state.mode === "advanced" && <AdvancedCalculator />}
      </div>
    </div>
  );
}
