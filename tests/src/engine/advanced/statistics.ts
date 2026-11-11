// engine/advanced/statistics.ts
// Pure helpers for the Advanced calculator's Statistics section.

import Decimal from "../precision/decimal-config";
import { EvaluationError } from "../parser/errors";

export interface DatasetStats {
  count: number;
  sum: string;
  mean: string;
  median: string;
  mode: string;
  min: string;
  max: string;
  range: string;
  varianceSample: number;
  stddevSample: number;
  variancePopulation: number;
  stddevPopulation: number;
}

export function parseNumberList(input: string): number[] {
  const parts = input
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const xs: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n)) {
      throw new EvaluationError("INVALID_ARGUMENT", `Not a number: '${p}'`);
    }
    xs.push(n);
  }
  if (xs.length === 0) {
    throw new EvaluationError("INVALID_ARGUMENT", "Empty dataset");
  }
  return xs;
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!;
}

function mode(xs: number[]): string {
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  let maxCount = 0;
  for (const c of counts.values()) if (c > maxCount) maxCount = c;
  const modes = [...counts.entries()].filter(([, c]) => c === maxCount).map(([v]) => v);
  return modes.join(", ");
}

function variance(xs: number[], sample: boolean): number {
  const m = mean(xs);
  const ss = xs.reduce((acc, x) => acc + (x - m) ** 2, 0);
  return ss / (sample ? xs.length - 1 : xs.length);
}

export function describeAll(xs: number[]): DatasetStats {
  const count = xs.length;
  const sum = xs.reduce((a, b) => a + b, 0);
  const mn = mean(xs);
  const med = median(xs);
  const mo = mode(xs);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  const vSample = variance(xs, true);
  const vPop = variance(xs, false);
  // Format sum / mean / median using Decimal to keep precision
  const fmt = (n: number) => {
    try {
      const d = new Decimal(n);
      return d.toPrecision(12).replace(/\.?0+$/, "") || "0";
    } catch {
      return String(n);
    }
  };
  return {
    count,
    sum: fmt(sum),
    mean: fmt(mn),
    median: fmt(med),
    mode: mo,
    min: fmt(min),
    max: fmt(max),
    range: fmt(max - min),
    varianceSample: vSample,
    stddevSample: Math.sqrt(vSample),
    variancePopulation: vPop,
    stddevPopulation: Math.sqrt(vPop),
  };
}

export const statistics = {
  parseNumberList,
  describeAll,
};
