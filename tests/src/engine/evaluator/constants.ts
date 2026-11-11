// engine/evaluator/constants.ts
// Mathematical constants exposed to expressions.

import { Decimal } from "../precision/decimal-config";

export interface ConstantDef {
  name: string;
  value: Decimal;
  description: string;
}

export const CONSTANTS: Record<string, ConstantDef> = {
  pi: {
    name: "pi",
    value: new Decimal(Math.PI),
    description: "Ratio of a circle's circumference to its diameter",
  },
  e: {
    name: "e",
    value: new Decimal(Math.E),
    description: "Euler's number, base of natural logarithm",
  },
  phi: {
    name: "phi",
    value: new Decimal((1 + Math.sqrt(5)) / 2),
    description: "Golden ratio",
  },
  tau: {
    name: "tau",
    value: new Decimal(2 * Math.PI),
    description: "2*pi, ratio of circumference to radius",
  },
  gamma: {
    name: "gamma",
    value: new Decimal(0.5772156649015329),
    description: "Euler-Mascheroni constant",
  },
};

export function getConstant(name: string): ConstantDef | undefined {
  return CONSTANTS[name.toLowerCase()];
}
