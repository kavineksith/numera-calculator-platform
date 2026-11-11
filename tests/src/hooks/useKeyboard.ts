// src/hooks/useKeyboard.ts
// Global keyboard listener that maps physical keys to calculator actions.

"use client";

import { useEffect } from "react";
import { useCalculator } from "@/context/CalculatorContext";

export function useKeyboard() {
  const { state, dispatch } = useCalculator();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't hijack typing in inputs / textareas / contenteditable.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      const k = e.key;
      // Digits and decimal point.
      if (/^[0-9.]$/.test(k)) {
        dispatch({ type: "INPUT", token: k });
        e.preventDefault();
        return;
      }
      if (k === "+" || k === "-" || k === "*" || k === "/") {
        dispatch({ type: "INPUT", token: k });
        e.preventDefault();
        return;
      }
      if (k === "%") {
        dispatch({ type: "INPUT", token: "%" });
        e.preventDefault();
        return;
      }
      if (k === "^") {
        dispatch({ type: "INPUT", token: "^" });
        e.preventDefault();
        return;
      }
      if (k === "!") {
        dispatch({ type: "INPUT", token: "!" });
        e.preventDefault();
        return;
      }
      if (k === "(" || k === ")") {
        dispatch({ type: "INPUT", token: k });
        e.preventDefault();
        return;
      }
      if (k === ",") {
        dispatch({ type: "INPUT", token: "," });
        e.preventDefault();
        return;
      }
      if (k === "Enter" || k === "=") {
        dispatch({ type: "EVALUATE" });
        e.preventDefault();
        return;
      }
      if (k === "Escape") {
        dispatch({ type: "CLEAR_ALL" });
        e.preventDefault();
        return;
      }
      if (k === "Backspace") {
        dispatch({ type: "BACKSPACE" });
        e.preventDefault();
        return;
      }
      if (k === "p" || k === "P") {
        dispatch({ type: "INPUT", token: "pi" });
        e.preventDefault();
        return;
      }
      if (k === "e" || k === "E") {
        // 'E' could be scientific-notation marker if we're mid-number; the
        // tokenizer handles that. As a standalone key, treat as the constant.
        dispatch({ type: "INPUT", token: "e" });
        e.preventDefault();
        return;
      }
      if (k === "m" || k === "M") {
        dispatch({ type: "MEMORY_OP", op: "MR" });
        e.preventDefault();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch]);

  return { mode: state.mode };
}
