// engine/precision/decimal-config.ts
// Centralized Decimal.js configuration.
// All arithmetic in the engine should route through Decimal configured here.

import Decimal from "decimal.js";

// Internal calculation precision: 50 significant digits.
// Display precision is controlled by the formatter, not by Decimal.
Decimal.set({
  precision: 50,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -1e9,
  toExpPos: 1e9,
  minE: -1e9,
  maxE: 1e9,
  errors: true,
});

export { Decimal };
export default Decimal;

export const PRECISION_CONFIG = {
  internalPrecision: 50,
  displayPrecision: 12,
  roundingMode: "ROUND_HALF_UP",
  // Below this magnitude (in absolute terms) we treat results as "zero" for display.
  zeroTolerance: new Decimal("1e-30"),
  // Numerical tolerance for floating-point transcendental comparisons.
  floatTolerance: 1e-12,
  // Scientific notation thresholds for display.
  sciLowerExp: -9,
  sciUpperExp: 15,
} as const;

export type DecimalLike = Decimal;
