// src/components/calculator/StandardCalculator.tsx
// Standard calculator button grid: digits, +, -, *, /, %, +/-, x², √, 1/x,
// memory (MC/MR/M+/M-/MS), CE, AC, Backspace, equals.

"use client";

import { CalculatorButton } from "./CalculatorButton";
import { useCalculator } from "@/context/CalculatorContext";
import { useAudio } from "@/hooks/useAudio";
import { useSettings } from "@/hooks/useSettings";

export function StandardCalculator() {
  const { state, dispatch } = useCalculator();
  const { settings } = useSettings();
  const audio = useAudio(settings?.audio ?? null);

  const input = (token: string, variant?: "number" | "operator" | "function") => {
    dispatch({ type: "INPUT", token });
    if (variant === "operator") audio.operatorSound();
    else audio.click();
  };

  const Btn = CalculatorButton;

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {/* Row 1: memory + clears */}
      <Btn variant="memory" ariaLabel="Memory clear" onClick={() => { dispatch({ type: "MEMORY_OP", op: "MC" }); audio.click(); }}>MC</Btn>
      <Btn variant="memory" ariaLabel="Memory recall" onClick={() => { dispatch({ type: "MEMORY_OP", op: "MR" }); audio.click(); }}>MR</Btn>
      <Btn variant="memory" ariaLabel="Memory plus" onClick={() => { dispatch({ type: "MEMORY_OP", op: "M+" }); audio.click(); }}>M+</Btn>
      <Btn variant="memory" ariaLabel="Memory minus" onClick={() => { dispatch({ type: "MEMORY_OP", op: "M-" }); audio.click(); }}>M-</Btn>

      {/* Row 2: clears + backspace + utility */}
      <Btn variant="destructive" ariaLabel="All clear" onClick={() => { dispatch({ type: "CLEAR_ALL" }); audio.click(); }}>AC</Btn>
      <Btn variant="function" ariaLabel="Clear entry" onClick={() => { dispatch({ type: "CLEAR_ENTRY" }); audio.click(); }}>CE</Btn>
      <Btn variant="function" ariaLabel="Backspace" onClick={() => { dispatch({ type: "BACKSPACE" }); audio.click(); }}>⌫</Btn>
      <Btn variant="operator" ariaLabel="Divide" onClick={() => input("/", "operator")}>÷</Btn>

      {/* Row 3 */}
      <Btn ariaLabel="Seven" onClick={() => input("7")}>7</Btn>
      <Btn ariaLabel="Eight" onClick={() => input("8")}>8</Btn>
      <Btn ariaLabel="Nine" onClick={() => input("9")}>9</Btn>
      <Btn variant="operator" ariaLabel="Multiply" onClick={() => input("*", "operator")}>×</Btn>

      {/* Row 4 */}
      <Btn ariaLabel="Four" onClick={() => input("4")}>4</Btn>
      <Btn ariaLabel="Five" onClick={() => input("5")}>5</Btn>
      <Btn ariaLabel="Six" onClick={() => input("6")}>6</Btn>
      <Btn variant="operator" ariaLabel="Subtract" onClick={() => input("-", "operator")}>−</Btn>

      {/* Row 5 */}
      <Btn ariaLabel="One" onClick={() => input("1")}>1</Btn>
      <Btn ariaLabel="Two" onClick={() => input("2")}>2</Btn>
      <Btn ariaLabel="Three" onClick={() => input("3")}>3</Btn>
      <Btn variant="operator" ariaLabel="Add" onClick={() => input("+", "operator")}>+</Btn>

      {/* Row 6 */}
      <Btn ariaLabel="Toggle sign" onClick={() => { dispatch({ type: "TOGGLE_SIGN" }); audio.click(); }}>±</Btn>
      <Btn ariaLabel="Zero" onClick={() => input("0")}>0</Btn>
      <Btn ariaLabel="Decimal point" onClick={() => input(".")}>.</Btn>
      <Btn variant="function" ariaLabel="Modulo" onClick={() => input("%", "function")}>%</Btn>

      {/* Row 7: functions */}
      <Btn variant="function" ariaLabel="Square" onClick={() => { dispatch({ type: "APPLY_FUNCTION", name: "sqr", wrap: true }); audio.click(); }}>x²</Btn>
      <Btn variant="function" ariaLabel="Square root" onClick={() => { dispatch({ type: "APPLY_FUNCTION", name: "sqrt", wrap: true }); audio.click(); }}>√x</Btn>
      <Btn variant="function" ariaLabel="Reciprocal" onClick={() => { dispatch({ type: "APPLY_FUNCTION", name: "inv", wrap: true }); audio.click(); }}>1/x</Btn>
      <Btn variant="operator" ariaLabel="Memory store" onClick={() => { dispatch({ type: "MEMORY_OP", op: "MS" }); audio.click(); }}>MS</Btn>

      {/* Row 8: equals (wide) */}
      <Btn variant="operator" ariaLabel="Equals" wide onClick={() => { dispatch({ type: "EVALUATE" }); audio.resultSound(); if (!state.error) audio.speak(state.result); }} className="col-span-4 h-14 text-lg">
        =
      </Btn>
    </div>
  );
}
