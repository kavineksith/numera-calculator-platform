// engine/evaluator/evaluator.ts
// Walks an AST and produces a Decimal result.

import { Decimal } from "../precision/decimal-config";
import { AstNode } from "../parser/ast";
import { parseExpression } from "../parser/parser";
import {
  EvaluationError,
  MathError,
  ParseError,
  isMathError,
} from "../parser/errors";
import { applyBinary, applyUnary, AngleUnit } from "./operators";
import { getFunction } from "./functions";
import { getConstant } from "./constants";
import { PRECISION_CONFIG } from "../precision/decimal-config";

export interface EvaluateOptions {
  angleUnit?: AngleUnit;
  variables?: Record<string, Decimal>;
}

export interface EvaluateResult {
  value: Decimal;
  ok: true;
}

/** Evaluate an AST node. */
export function evaluateAst(node: AstNode, options: EvaluateOptions = {}): Decimal {
  const unit: AngleUnit = options.angleUnit ?? "rad";

  switch (node.type) {
    case "Number": {
      try {
        return new Decimal(node.value);
      } catch {
        throw new EvaluationError(
          "INVALID_ARGUMENT",
          `Invalid number literal '${node.value}'`
        );
      }
    }
    case "Constant": {
      const c = getConstant(node.name);
      if (!c) {
        throw new EvaluationError(
          "UNKNOWN_CONSTANT",
          `Unknown constant '${node.name}'`
        );
      }
      return c.value;
    }
    case "Variable": {
      const v = options.variables?.[node.name];
      if (v === undefined) {
        throw new EvaluationError(
          "UNKNOWN_VARIABLE",
          `Unknown variable '${node.name}'`
        );
      }
      return v;
    }
    case "UnaryOp": {
      const operand = evaluateAst(node.operand, options);
      return applyUnary(node.op, operand);
    }
    case "BinaryOp": {
      const left = evaluateAst(node.left, options);
      const right = evaluateAst(node.right, options);
      return applyBinary(node.op, left, right);
    }
    case "PostfixOp": {
      if (node.op === "!") {
        const operand = evaluateAst(node.operand, options);
        if (operand.isInteger()) {
          // factorial
          const k = operand.toNumber();
          if (k < 0) {
            throw new EvaluationError(
              "DOMAIN_ERROR",
              "Factorial of a negative number is undefined"
            );
          }
          if (k > 10000) {
            throw new EvaluationError("OVERFLOW", "Factorial too large");
          }
          let result = new Decimal(1);
          for (let i = 2; i <= k; i++) result = result.times(i);
          return result;
        }
        // gamma(x+1) for non-integers
        return gammaFn(operand.plus(1));
      }
      throw new EvaluationError(
        "INVALID_EXPRESSION",
        `Unknown postfix operator '${node.op}'`
      );
    }
    case "FunctionCall": {
      const def = getFunction(node.name);
      if (!def) {
        throw new EvaluationError(
          "UNKNOWN_FUNCTION",
          `Unknown function '${node.name}'`
        );
      }
      const allowedArities = Array.isArray(def.arity) ? def.arity : [def.arity];
      if (!allowedArities.includes(node.args.length)) {
        throw new EvaluationError(
          "ARITY_MISMATCH",
          `Function '${node.name}' expects ${formatArity(def.arity)} argument(s), got ${node.args.length}`
        );
      }
      const argValues = node.args.map((a) => evaluateAst(a, options));
      return def.apply(argValues, unit);
    }
  }
}

function formatArity(a: number | number[]): string {
  if (Array.isArray(a)) return a.join(" or ");
  return String(a);
}

// inline gamma to avoid circular import
function gammaFn(z: Decimal): Decimal {
  const x = z.toNumber();
  if (Number.isNaN(x) || !Number.isFinite(x)) {
    throw new EvaluationError("DOMAIN_ERROR", "Gamma function undefined for this input");
  }
  if (x < 0.5) {
    const pi = Math.PI;
    const result = pi / (Math.sin(pi * x) * gammaFn(new Decimal(1 - x)).toNumber());
    return new Decimal(result);
  }
  const g = 7;
  const c = [
    0.99999999999980793,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  let xm1 = x - 1;
  let a = c[0];
  for (let i = 1; i < g + 2; i++) {
    a += c[i] / (xm1 + i);
  }
  const t = xm1 + g + 0.5;
  const result = Math.sqrt(2 * Math.PI) * Math.pow(t, xm1 + 0.5) * Math.exp(-t) * a;
  return new Decimal(result);
}

export interface SafeEvaluateResult {
  ok: boolean;
  value?: Decimal;
  text?: string; // formatted display string (alias for outcome.text used by /api/evaluate)
  error?: MathError;
}

/** Parse + evaluate, catching all engine errors. Never throws. */
export function safeEvaluate(
  expression: string,
  options: EvaluateOptions = {}
): SafeEvaluateResult {
  try {
    const ast = parseExpression(expression);
    const value = evaluateAst(ast, options);
    if (!value.isFinite()) {
      return {
        ok: false,
        error: new EvaluationError("UNDEFINED_RESULT", "Result is not finite"),
      };
    }
    return { ok: true, value, text: formatResult(value) };
  } catch (e) {
    if (isMathError(e)) return { ok: false, error: e };
    return {
      ok: false,
      error: new EvaluationError(
        "INVALID_EXPRESSION",
        e instanceof Error ? e.message : "Unknown error"
      ),
    };
  }
}

/** Format a Decimal result for display. */
export function formatResult(value: Decimal): string {
  if (value.isNaN()) return "NaN";
  if (!value.isFinite()) return value.isNegative() ? "-Infinity" : "Infinity";

  // Use scientific notation for very large / very small magnitudes.
  // Decimal.js stores the base-10 exponent of the most significant digit in `e`.
  const exp = value.isZero() ? 0 : (value as unknown as { e: number }).e;
  if (
    exp < PRECISION_CONFIG.sciLowerExp ||
    exp > PRECISION_CONFIG.sciUpperExp
  ) {
    // Decimal's toExponential with limited digits
    return value.toExponential(PRECISION_CONFIG.displayPrecision - 1);
  }
  // Otherwise: regular notation with up to displayPrecision significant digits
  const str = value.toPrecision(PRECISION_CONFIG.displayPrecision);
  // strip trailing zeros after decimal point
  if (str.includes(".") && !str.includes("e") && !str.includes("E")) {
    return str.replace(/\.?0+$/, "") || "0";
  }
  return str;
}

export { ParseError, MathError };
