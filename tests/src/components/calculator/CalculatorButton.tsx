// src/components/calculator/CalculatorButton.tsx
// Raised physical-button component with press animation, hover lift, focus
// ring, and touch feedback. Variants map to the theme's button colours.

"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "number"
  | "operator"
  | "function"
  | "memory"
  | "destructive"
  | "utility";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  number:
    "text-[var(--calc-text)] bg-[var(--calc-btn)] hover:brightness-105 active:brightness-95",
  operator:
    "text-[var(--calc-btn-operator-fg)] bg-[var(--calc-btn-operator)] hover:brightness-110 active:brightness-95 font-semibold",
  function:
    "text-[var(--calc-text)] bg-[var(--calc-btn-function)] hover:brightness-105 active:brightness-95",
  memory:
    "text-[var(--calc-btn-memory-fg)] bg-[var(--calc-btn-memory)] hover:brightness-110 active:brightness-95",
  destructive:
    "text-[var(--calc-btn-destructive-fg)] bg-[var(--calc-btn-destructive)] hover:brightness-110 active:brightness-95",
  utility:
    "text-[var(--calc-text)] bg-transparent border border-[var(--calc-border)] hover:bg-[var(--calc-btn)]",
};

export interface CalculatorButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  ariaLabel?: string;
  wide?: boolean;
}

export const CalculatorButton = forwardRef<
  HTMLButtonElement,
  CalculatorButtonProps
>(function CalculatorButton(
  { variant = "number", ariaLabel, wide, className, children, onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        borderRadius: "var(--calc-radius)",
        minHeight: "44px",
      }}
      className={cn(
        "relative flex items-center justify-center text-center font-medium select-none",
        "transition-all duration-100 ease-out",
        "shadow-sm hover:shadow-md hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--calc-accent)] focus-visible:ring-offset-1",
        "active:scale-95 active:translate-y-0",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        VARIANT_STYLES[variant],
        wide ? "col-span-2" : "",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
