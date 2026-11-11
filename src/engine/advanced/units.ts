// engine/advanced/units.ts
// Simple length / mass / temperature unit conversion.
// Independent of React/Next/Prisma/browser.

import { EvaluationError } from "../parser/errors";

type Category = "length" | "mass" | "temperature";

// Conversion factors to a base unit (length -> meters, mass -> grams, temperature -> Celsius)
const LENGTH_TO_M: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const MASS_TO_G: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  t: 1_000_000,
  oz: 28.349523125,
  lb: 453.59237,
};

function toCelsius(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case "c":
      return value;
    case "f":
      return (value - 32) * (5 / 9);
    case "k":
      return value - 273.15;
    default:
      throw new EvaluationError("INVALID_ARGUMENT", `Unknown temperature unit: ${unit}`);
  }
}

function fromCelsius(celsius: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case "c":
      return celsius;
    case "f":
      return celsius * (9 / 5) + 32;
    case "k":
      return celsius + 273.15;
    default:
      throw new EvaluationError("INVALID_ARGUMENT", `Unknown temperature unit: ${unit}`);
  }
}

export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: Category
): number {
  if (!Number.isFinite(value)) {
    throw new EvaluationError("INVALID_ARGUMENT", "Value must be a finite number");
  }
  if (category === "temperature") {
    const c = toCelsius(value, fromUnit);
    return fromCelsius(c, toUnit);
  }
  const table = category === "length" ? LENGTH_TO_M : MASS_TO_G;
  const f = table[fromUnit.toLowerCase()];
  const t = table[toUnit.toLowerCase()];
  if (!f) {
    throw new EvaluationError("INVALID_ARGUMENT", `Unknown ${category} unit: ${fromUnit}`);
  }
  if (!t) {
    throw new EvaluationError("INVALID_ARGUMENT", `Unknown ${category} unit: ${toUnit}`);
  }
  return (value * f) / t;
}

export const units = {
  convert,
  LENGTH_TO_M,
  MASS_TO_G,
};
