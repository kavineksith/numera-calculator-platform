// engine/evaluator/operators.ts
// Binary and unary operators implemented with Decimal.js where appropriate.
// Bitwise operators operate on 32-bit signed integers (programmer mode).

import Decimal from "../precision/decimal-config";
import { EvaluationError } from "../parser/errors";

export type AngleUnit = "deg" | "rad";

// We avoid Decimal.PI (which doesn't exist in decimal.js by default) and
// instead create the constant from Math.PI once. This is sufficient because
// the trig functions ultimately call Math.sin/cos which use floating point.
const PI_DECIMAL = new Decimal(Math.PI);

/** Convert degrees to radians. */
export function toRadians(deg: Decimal, unit: AngleUnit): Decimal {
  if (unit === "deg") {
    return deg.times(PI_DECIMAL).div(180);
  }
  return deg;
}

/** Convert radians to degrees. */
export function toDegrees(rad: Decimal, unit: AngleUnit): Decimal {
  if (unit === "deg") {
    return rad.times(180).div(PI_DECIMAL);
  }
  return rad;
}

/** Apply a binary operator. */
export function applyBinary(op: string, left: Decimal, right: Decimal): Decimal {
  switch (op) {
    case "+":
      return left.plus(right);
    case "-":
      return left.minus(right);
    case "*":
      return left.times(right);
    case "/":
      if (right.isZero()) {
        throw new EvaluationError(
          "DIVISION_BY_ZERO",
          "Division by zero is undefined"
        );
      }
      return left.div(right);
    case "%":
      // mathematical modulo, follows sign of dividend (matches Decimal.mod)
      if (right.isZero()) {
        throw new EvaluationError("DIVISION_BY_ZERO", "Modulo by zero is undefined");
      }
      return left.mod(right);
    case "mod":
      // mathematical modulo always non-negative when divisor is positive
      if (right.isZero()) {
        throw new EvaluationError("DIVISION_BY_ZERO", "Modulo by zero is undefined");
      }
      return left.mod(right).plus(right).mod(right);
    case "^":
      // Decimal supports arbitrary exponent. Negative base + fractional exponent
      // produces NaN — detect and raise.
      if (left.isNegative() && !right.isInteger()) {
        throw new EvaluationError(
          "DOMAIN_ERROR",
          "Negative base with non-integer exponent is not a real number"
        );
      }
      if (left.isZero() && right.isNegative()) {
        throw new EvaluationError(
          "DOMAIN_ERROR",
          "Zero raised to a negative power is undefined"
        );
      }
      return left.pow(right);
    // Bitwise (32-bit signed)
    case "and":
      return new Decimal(toInt32(left) & toInt32(right));
    case "or":
      return new Decimal(toInt32(left) | toInt32(right));
    case "xor":
      return new Decimal(toInt32(left) ^ toInt32(right));
    case "<<":
      return new Decimal(toInt32(left) << toInt32(right));
    case ">>":
      return new Decimal(toInt32(left) >> toInt32(right));
    default:
      throw new EvaluationError(
        "INVALID_EXPRESSION",
        `Unknown operator '${op}'`
      );
  }
}

/** Apply a unary prefix operator. */
export function applyUnary(op: "-" | "+" | "not", operand: Decimal): Decimal {
  switch (op) {
    case "-":
      return operand.negated();
    case "+":
      return operand;
    case "not":
      return new Decimal(~toInt32(operand));
  }
}

/** Truncate to signed 32-bit integer (programmer mode). */
export function toInt32(d: Decimal): number {
  const n = d.truncated().toNumber();
  if (!Number.isSafeInteger(n)) {
    throw new EvaluationError(
      "DOMAIN_ERROR",
      "Operand out of 32-bit integer range for bitwise operation"
    );
  }
  return n | 0;
}
