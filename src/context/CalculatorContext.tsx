// src/context/CalculatorContext.tsx
// Central calculator state. Provides the reducer-backed state machine plus
// side-effects (history persistence + recovery snapshots) to all consumers.

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { tryEvaluate, formatDecimal, type AngleUnit } from "@/engine";

export type CalcMode = "standard" | "scientific" | "advanced";

export interface CalcState {
  expression: string;
  result: string;
  mode: CalcMode;
  angleUnit: AngleUnit;
  memory: number;
  error: string | null;
  justEvaluated: boolean;
  lastOp: string | null;
  lastOperand: string | null;
  starred: boolean;
}

export type CalcAction =
  | { type: "INPUT"; token: string }
  | { type: "CLEAR_ALL" }
  | { type: "CLEAR_ENTRY" }
  | { type: "BACKSPACE" }
  | { type: "EVALUATE" }
  | { type: "SET_MODE"; mode: CalcMode }
  | { type: "SET_ANGLE"; unit: AngleUnit }
  | { type: "MEMORY_OP"; op: "MC" | "MR" | "M+" | "M-" | "MS" }
  | { type: "APPLY_FUNCTION"; name: string; wrap?: boolean }
  | { type: "LOAD_EXPRESSION"; expression: string; result?: string }
  | { type: "TOGGLE_SIGN" }
  | { type: "SET_RESULT"; result: string }
  | { type: "CLEAR_ERROR" };

const INITIAL: CalcState = {
  expression: "",
  result: "0",
  mode: "standard",
  angleUnit: "rad",
  memory: 0,
  error: null,
  justEvaluated: false,
  lastOp: null,
  lastOperand: null,
  starred: false,
};

const OPERATORS = ["+", "-", "*", "/", "%", "^"];

function isOperatorToken(t: string): boolean {
  return OPERATORS.includes(t);
}

function isDigitToken(t: string): boolean {
  return /^[0-9.]$/.test(t);
}

function compute(expression: string, angleUnit: AngleUnit): { value: string; error: string | null } {
  const r = tryEvaluate(expression, { angleUnit });
  if (r.ok) return { value: formatDecimal(r.value), error: null };
  return { value: "Error", error: r.error.message };
}

/** Find the last top-level binary operator in an expression (ignoring
 * parentheses and functions). Returns the index of the operator char, or -1. */
function findLastTopLevelOperator(expr: string): number {
  let depth = 0;
  let last = -1;
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && isOperatorToken(c)) {
      // skip unary minus at start or after another operator
      const prev = expr[i - 1];
      if (
        (c === "-" || c === "+") &&
        (i === 0 || prev === "(" || isOperatorToken(prev))
      ) {
        continue;
      }
      last = i;
    }
  }
  return last;
}

function reducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case "INPUT": {
      const token = action.token;
      // If a previous evaluation just completed...
      if (state.justEvaluated) {
        if (isOperatorToken(token)) {
          // Continue from the result.
          return {
            ...state,
            expression: state.result + token,
            justEvaluated: false,
            error: null,
          };
        }
        if (isDigitToken(token) || token === "(") {
          // Start a fresh expression.
          return { ...state, expression: token, justEvaluated: false, error: null };
        }
        // Functions / constants: start fresh, prefixed.
        return {
          ...state,
          expression: token,
          justEvaluated: false,
          error: null,
        };
      }
      return { ...state, expression: state.expression + token, error: null };
    }
    case "CLEAR_ALL":
      return { ...INITIAL, mode: state.mode, angleUnit: state.angleUnit, memory: state.memory };
    case "CLEAR_ENTRY": {
      // Remove the trailing number / token group.
      const expr = state.expression;
      if (expr.length === 0) return { ...state, result: "0" };
      // Drop trailing contiguous number.
      const m = expr.match(/(\d*\.?\d*(?:[eE][+-]?\d+)?)$/);
      if (m && m[0]) {
        return { ...state, expression: expr.slice(0, expr.length - m[0].length) };
      }
      return { ...state, expression: expr.slice(0, -1) };
    }
    case "BACKSPACE": {
      if (state.justEvaluated) {
        return { ...state, justEvaluated: false };
      }
      return { ...state, expression: state.expression.slice(0, -1), error: null };
    }
    case "EVALUATE": {
      const expr = state.expression.trim();
      if (!expr) return state;
      // Repeat-equals: if just evaluated and we have a last op+operand, apply.
      if (state.justEvaluated && state.lastOp && state.lastOperand) {
        const nextExpr = `${state.result}${state.lastOp}${state.lastOperand}`;
        const { value, error } = compute(nextExpr, state.angleUnit);
        return {
          ...state,
          expression: nextExpr,
          result: value,
          error,
          justEvaluated: true,
        };
      }
      const { value, error } = compute(expr, state.angleUnit);
      // Capture last op + operand for repeat-equals.
      const idx = findLastTopLevelOperator(expr);
      let lastOp: string | null = null;
      let lastOperand: string | null = null;
      if (idx >= 0) {
        lastOp = expr[idx]!;
        lastOperand = expr.slice(idx + 1).trim();
      }
      return {
        ...state,
        result: value,
        error,
        justEvaluated: true,
        lastOp,
        lastOperand,
      };
    }
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_ANGLE":
      return { ...state, angleUnit: action.unit };
    case "MEMORY_OP": {
      const current = Number(state.result);
      switch (action.op) {
        case "MC":
          return { ...state, memory: 0 };
        case "MR":
          return {
            ...state,
            expression: state.justEvaluated
              ? String(state.memory)
              : state.expression + String(state.memory),
            justEvaluated: false,
          };
        case "M+":
          return { ...state, memory: state.memory + (Number.isFinite(current) ? current : 0) };
        case "M-":
          return { ...state, memory: state.memory - (Number.isFinite(current) ? current : 0) };
        case "MS":
          return { ...state, memory: Number.isFinite(current) ? current : 0 };
        default:
          return state;
      }
    }
    case "APPLY_FUNCTION": {
      const name = action.name;
      if (action.wrap) {
        // Wrap the current expression: name(expr)
        if (state.justEvaluated || !state.expression) {
          return {
            ...state,
            expression: `${name}(${state.result})`,
            justEvaluated: false,
            error: null,
          };
        }
        return {
          ...state,
          expression: `${name}(${state.expression})`,
          error: null,
        };
      }
      // Append a function call with empty args placeholder.
      return {
        ...state,
        expression: (state.justEvaluated ? "" : state.expression) + `${name}(`,
        justEvaluated: false,
        error: null,
      };
    }
    case "LOAD_EXPRESSION":
      return {
        ...state,
        expression: action.expression,
        result: action.result ?? state.result,
        justEvaluated: false,
        error: null,
      };
    case "TOGGLE_SIGN": {
      const expr = state.justEvaluated ? state.result : state.expression;
      // Try to wrap the whole expression in -( ... ) if non-empty.
      if (!expr) return state;
      if (expr.startsWith("-(") && expr.endsWith(")")) {
        return { ...state, expression: expr.slice(2, -1), justEvaluated: false };
      }
      return { ...state, expression: `-(${expr})`, justEvaluated: false };
    }
    case "SET_RESULT":
      return { ...state, result: action.result, justEvaluated: true };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

interface CalculatorContextValue {
  state: CalcState;
  dispatch: React.Dispatch<CalcAction>;
  preview: { value: string; error: string | null } | null;
  saveToHistory: () => Promise<void>;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live preview of the current expression (only when it would differ from
  // the committed result).
  const preview =
    state.expression.trim().length === 0 || state.justEvaluated
      ? null
      : (() => {
          const r = tryEvaluate(state.expression, { angleUnit: state.angleUnit });
          return r.ok
            ? { value: formatDecimal(r.value), error: null }
            : { value: "", error: r.error.message };
        })();

  // Persist a recovery snapshot (debounced 500ms).
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const payload = {
        expression: state.expression,
        result: state.result,
        mode: state.mode,
        angleUnit: state.angleUnit,
        memory: state.memory,
        lastOperator: state.lastOp,
        ts: Date.now(),
      };
      try {
        fetch("/api/recovery", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch {
        // Offline — ignore.
      }
      try {
        localStorage.setItem("calc.recovery", JSON.stringify(payload));
      } catch {
        // ignore
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state.expression, state.result, state.mode, state.angleUnit, state.memory, state.lastOp]);

  const saveToHistory = useCallback(async () => {
    const expr = state.expression.trim();
    if (!expr) return;
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expression: expr,
          mode: state.mode,
          angleUnit: state.angleUnit,
        }),
      });
    } catch {
      // offline — queue in localStorage
      try {
        const q = JSON.parse(localStorage.getItem("calc.history.queue") ?? "[]");
        q.push({ expression: expr, mode: state.mode, angleUnit: state.angleUnit });
        localStorage.setItem("calc.history.queue", JSON.stringify(q));
      } catch {
        /* ignore */
      }
    }
  }, [state.expression, state.mode, state.angleUnit]);

  // On evaluate, save to history.
  useEffect(() => {
    if (state.justEvaluated && state.expression && !state.error) {
      saveToHistory();
    }
  }, [state.justEvaluated, state.expression, state.error, saveToHistory]);

  return (
    <CalculatorContext.Provider value={{ state, dispatch, preview, saveToHistory }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator(): CalculatorContextValue {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error("useCalculator must be used within CalculatorProvider");
  return ctx;
}
