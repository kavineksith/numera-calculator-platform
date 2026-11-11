// engine/advanced/programmer.ts
// Pure helpers for the Advanced calculator's Programmer (base conversion +
// bitwise operations) section. Operates on 32-bit signed integers.

import { EvaluationError } from "../parser/errors";

const SIGNED_32_MIN = -2147483648;
const SIGNED_32_MAX = 2147483647;

function toInt32(n: number): number {
  if (!Number.isInteger(n)) {
    throw new EvaluationError(
      "DOMAIN_ERROR",
      "Programmer mode requires integers"
    );
  }
  if (n < SIGNED_32_MIN || n > SIGNED_32_MAX) {
    throw new EvaluationError(
      "DOMAIN_ERROR",
      "Value out of 32-bit signed integer range"
    );
  }
  return n | 0;
}

/** Parse a value with optional 0x/0b/0o prefix; returns the integer value. */
export function parsePrefixed(input: string): number {
  const s = input.trim().toLowerCase();
  if (!s) throw new EvaluationError("INVALID_ARGUMENT", "Empty input");
  let radix = 10;
  let rest = s;
  if (s.startsWith("0x")) {
    radix = 16;
    rest = s.slice(2);
  } else if (s.startsWith("0b")) {
    radix = 2;
    rest = s.slice(2);
  } else if (s.startsWith("0o")) {
    radix = 8;
    rest = s.slice(2);
  }
  if (!rest) {
    throw new EvaluationError("INVALID_ARGUMENT", "Empty value after prefix");
  }
  // Validate digits match the radix
  const valid: Record<number, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^-?\d+$/,
    16: /^[0-9a-f]+$/,
  };
  if (!valid[radix]!.test(rest)) {
    throw new EvaluationError(
      "INVALID_ARGUMENT",
      `Invalid digits for base ${radix}: '${rest}'`
    );
  }
  const n = parseInt(rest, radix);
  if (!Number.isFinite(n)) {
    throw new EvaluationError("INVALID_ARGUMENT", `Cannot parse '${input}'`);
  }
  return toInt32(n);
}

/** Convert an integer to a string representation in a given base. */
export function toBase(n: number, radix: 2 | 8 | 10 | 16): string {
  const v = toInt32(n);
  if (v < 0 && radix !== 10) {
    // For non-decimal bases, show unsigned 32-bit form for negatives.
    const unsigned = (v >>> 0).toString(radix).toUpperCase();
    return unsigned;
  }
  return v.toString(radix).toUpperCase();
}

export function bitwiseAnd(a: number, b: number): number {
  return toInt32(a) & toInt32(b);
}

export function bitwiseOr(a: number, b: number): number {
  return toInt32(a) | toInt32(b);
}

export function bitwiseXor(a: number, b: number): number {
  return toInt32(a) ^ toInt32(b);
}

export function bitwiseNot(a: number): number {
  return ~toInt32(a);
}

export function leftShift(a: number, b: number): number {
  return toInt32(toInt32(a) << toInt32(b));
}

export function rightShift(a: number, b: number): number {
  return toInt32(toInt32(a) >> toInt32(b));
}

export const programmer = {
  parsePrefixed,
  toBase,
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
  bitwiseNot,
  leftShift,
  rightShift,
};
