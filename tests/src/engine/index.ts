// engine/index.ts
// Public API of the calculator math engine.
//
// This module is 100% independent of React, Next.js, Prisma, and the browser.
// It exports pure functions that can be called both client- and server-side.

import { Decimal } from "./precision/decimal-config";
import { safeEvaluate, evaluateAst, formatResult, type EvaluateOptions } from "./evaluator/evaluator";
import { parseExpression } from "./parser/parser";
import { tokenize } from "./tokenizer/tokenizer";
import { getConstant, CONSTANTS } from "./evaluator/constants";
import { getFunction, listFunctions } from "./evaluator/functions";
import type { AngleUnit } from "./evaluator/operators";
import type { AstNode } from "./parser/ast";
import type { MathError } from "./parser/errors";
import { isMathError } from "./parser/errors";

export type {
  Token,
  TokenType,
} from "./tokenizer/token";
export type { AstNode } from "./parser/ast";
export type { MathErrorCode } from "./parser/errors";
export type { AngleUnit } from "./evaluator/operators";
export type { EvaluateOptions } from "./evaluator/evaluator";

export { tokenize } from "./tokenizer/tokenizer";
export { parseExpression, Parser } from "./parser/parser";
export { evaluateAst, safeEvaluate, formatResult } from "./evaluator/evaluator";
export { MathError, ParseError, EvaluationError, isMathError } from "./parser/errors";
export { Decimal } from "./precision/decimal-config";
export { CONSTANTS, getConstant } from "./evaluator/constants";
export { FUNCTIONS, getFunction, listFunctions } from "./evaluator/functions";

// Advanced-mode helpers (used by the Advanced calculator UI).
export { numberTheory } from "./advanced/number-theory";
export { statistics } from "./advanced/statistics";
export { programmer } from "./advanced/programmer";
export { fractions } from "./advanced/fractions";
export { units } from "./advanced/units";

// Convenience aliases used by the UI's CalculatorContext.
export { safeEvaluate as tryEvaluate } from "./evaluator/evaluator";
export { formatResult as formatDecimal } from "./evaluator/evaluator";

/**
 * Top-level convenience function: parse, evaluate, and format a single expression.
 * Never throws — returns either { ok: true, display } or { ok: false, error }.
 */
export function calculate(
  expression: string,
  options: EvaluateOptions = {}
): { ok: true; display: string; value: Decimal } | { ok: false; error: MathError } {
  const r = safeEvaluate(expression, options);
  if (r.ok && r.value) {
    return { ok: true, display: formatResult(r.value), value: r.value };
  }
  return { ok: false, error: r.error! };
}
