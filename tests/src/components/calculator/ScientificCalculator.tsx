// src/components/calculator/ScientificCalculator.tsx
// Scientific calculator: powers, roots, factorial, abs, trig (incl. hyperbolic
// + inverses), logarithms, exp, constants, DEG/RAD toggle, parentheses.

"use client";

import { CalculatorButton } from "./CalculatorButton";
import { useCalculator } from "@/context/CalculatorContext";
import { useAudio } from "@/hooks/useAudio";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

export function ScientificCalculator() {
  const { state, dispatch } = useCalculator();
  const { settings } = useSettings();
  const audio = useAudio(settings?.audio ?? null);

  const input = (token: string, variant?: "number" | "operator" | "function") => {
    dispatch({ type: "INPUT", token });
    if (variant === "operator") audio.operatorSound();
    else audio.click();
  };
  const fn = (name: string, wrap = true) => {
    dispatch({ type: "APPLY_FUNCTION", name, wrap });
    audio.click();
  };

  const Btn = CalculatorButton;

  return (
    <div className="space-y-2">
      {/* DEG/RAD + clears row */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Toggle angle unit"
          onClick={() => {
            dispatch({ type: "SET_ANGLE", unit: state.angleUnit === "deg" ? "rad" : "deg" });
            audio.click();
          }}
          className={cn(
            "rounded-md px-2 py-2 text-sm font-semibold border transition-colors",
            "border-[var(--calc-border)] hover:bg-[var(--calc-btn)]",
          )}
          style={{ borderRadius: "var(--calc-radius)" }}
        >
          {state.angleUnit === "deg" ? "DEG" : "RAD"}
        </button>
        <Btn variant="destructive" ariaLabel="All clear" onClick={() => { dispatch({ type: "CLEAR_ALL" }); audio.click(); }}>AC</Btn>
        <Btn variant="function" ariaLabel="Backspace" onClick={() => { dispatch({ type: "BACKSPACE" }); audio.click(); }}>⌫</Btn>
        <Btn variant="operator" ariaLabel="Equals" onClick={() => { dispatch({ type: "EVALUATE" }); audio.resultSound(); if (!state.error) audio.speak(state.result); }}>=</Btn>
      </div>

      {/* Scientific functions grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        <Btn variant="function" onClick={() => fn("sqrt")}>√</Btn>
        <Btn variant="function" onClick={() => fn("cbrt")}>∛</Btn>
        <Btn variant="function" onClick={() => fn("nthroot", false)}>ⁿ√</Btn>
        <Btn variant="function" onClick={() => input("^", "function")}>x^y</Btn>
        <Btn variant="function" onClick={() => fn("sqr")}>x²</Btn>

        <Btn variant="function" onClick={() => fn("cube")}>x³</Btn>
        <Btn variant="function" onClick={() => fn("fact")}>n!</Btn>
        <Btn variant="function" onClick={() => fn("abs")}>|x|</Btn>
        <Btn variant="function" onClick={() => fn("inv")}>1/x</Btn>
        <Btn variant="function" onClick={() => input("%", "function")}>mod</Btn>

        <Btn variant="function" onClick={() => fn("sin")}>sin</Btn>
        <Btn variant="function" onClick={() => fn("cos")}>cos</Btn>
        <Btn variant="function" onClick={() => fn("tan")}>tan</Btn>
        <Btn variant="function" onClick={() => fn("asin")}>sin⁻¹</Btn>
        <Btn variant="function" onClick={() => fn("acos")}>cos⁻¹</Btn>

        <Btn variant="function" onClick={() => fn("atan")}>tan⁻¹</Btn>
        <Btn variant="function" onClick={() => fn("sinh")}>sinh</Btn>
        <Btn variant="function" onClick={() => fn("cosh")}>cosh</Btn>
        <Btn variant="function" onClick={() => fn("tanh")}>tanh</Btn>
        <Btn variant="function" onClick={() => fn("log", false)}>logₙ</Btn>

        <Btn variant="function" onClick={() => fn("log10")}>log₁₀</Btn>
        <Btn variant="function" onClick={() => fn("ln")}>ln</Btn>
        <Btn variant="function" onClick={() => fn("exp")}>eˣ</Btn>
        <Btn variant="function" onClick={() => input("pi")}>π</Btn>
        <Btn variant="function" onClick={() => input("e")}>e</Btn>

        <Btn variant="function" onClick={() => input("phi")}>φ</Btn>
        <Btn variant="function" onClick={() => input("gamma")}>γ</Btn>
        <Btn variant="function" onClick={() => input("(", "function")}>(</Btn>
        <Btn variant="function" onClick={() => input(")", "function")}>)</Btn>
        <Btn variant="function" onClick={() => input(",", "function")}>,</Btn>
      </div>

      {/* Digits + operators */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <Btn ariaLabel="Seven" onClick={() => input("7")}>7</Btn>
        <Btn ariaLabel="Eight" onClick={() => input("8")}>8</Btn>
        <Btn ariaLabel="Nine" onClick={() => input("9")}>9</Btn>
        <Btn variant="operator" ariaLabel="Divide" onClick={() => input("/", "operator")}>÷</Btn>

        <Btn ariaLabel="Four" onClick={() => input("4")}>4</Btn>
        <Btn ariaLabel="Five" onClick={() => input("5")}>5</Btn>
        <Btn ariaLabel="Six" onClick={() => input("6")}>6</Btn>
        <Btn variant="operator" ariaLabel="Multiply" onClick={() => input("*", "operator")}>×</Btn>

        <Btn ariaLabel="One" onClick={() => input("1")}>1</Btn>
        <Btn ariaLabel="Two" onClick={() => input("2")}>2</Btn>
        <Btn ariaLabel="Three" onClick={() => input("3")}>3</Btn>
        <Btn variant="operator" ariaLabel="Subtract" onClick={() => input("-", "operator")}>−</Btn>

        <Btn ariaLabel="Zero" onClick={() => input("0")}>0</Btn>
        <Btn ariaLabel="Decimal point" onClick={() => input(".")}>.</Btn>
        <Btn ariaLabel="Toggle sign" onClick={() => { dispatch({ type: "TOGGLE_SIGN" }); audio.click(); }}>±</Btn>
        <Btn variant="operator" ariaLabel="Add" onClick={() => input("+", "operator")}>+</Btn>
      </div>
    </div>
  );
}
