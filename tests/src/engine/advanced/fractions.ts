// engine/advanced/fractions.ts
// Convert a decimal to a fraction using continued-fraction expansion.
// Independent of React/Next/Prisma/browser.

import Decimal from "../precision/decimal-config";
import { EvaluationError } from "../parser/errors";

const MAX_DENOMINATOR = 1_000_000;

/** Convert a Decimal to a {numerator, denominator} pair (reduced). */
export function toFraction(d: Decimal): { numerator: string; denominator: string } {
  if (!d.isFinite()) {
    throw new EvaluationError("DOMAIN_ERROR", "Cannot convert infinity/NaN to fraction");
  }
  const sign = d.isNegative() ? -1 : 1;
  const abs = d.abs();
  const intPart = abs.floor();
  const fracPart = abs.minus(intPart);

  // Continued fraction expansion of the fractional part.
  let h0 = 0n, h1 = 1n;
  let k0 = 1n, k1 = 0n;
  let x = fracPart;
  for (let i = 0; i < 30; i++) {
    if (x.isZero()) break;
    const inv = new Decimal(1).div(x);
    const a = BigInt(inv.floor().toString());
    const h = a * h1 + h0;
    const k = a * k1 + k0;
    h0 = h1; h1 = h;
    k0 = k1; k1 = k;
    if (k > BigInt(MAX_DENOMINATOR)) {
      // Back off — use the previous best
      h1 = h0; k1 = k0;
      break;
    }
    x = inv.minus(inv.floor());
  }

  const denom = k1 === 0n ? 1n : k1;
  const whole = BigInt(intPart.toString());
  const num = sign * (whole * denom + h1);
  return {
    numerator: num.toString(),
    denominator: denom.toString(),
  };
}

export function toFractionString(d: Decimal): string {
  const { numerator, denominator } = toFraction(d);
  if (denominator === "1") return numerator;
  return `${numerator}/${denominator}`;
}

export function toMixedNumberString(d: Decimal): string {
  const sign = d.isNegative() ? "-" : "";
  const abs = d.abs();
  const whole = abs.floor();
  const frac = abs.minus(whole);
  if (frac.isZero()) return d.toString();
  const { numerator, denominator } = toFraction(frac);
  return `${sign}${whole.toString()} ${numerator}/${denominator}`;
}

export const fractions = {
  toFraction,
  toFractionString,
  toMixedNumberString,
};
