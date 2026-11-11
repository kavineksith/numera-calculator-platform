// engine/advanced/number-theory.ts
// Pure helpers for the Advanced calculator's Number Theory section.
// Independent of React/Next/Prisma/browser.

import Decimal from "../precision/decimal-config";
import { EvaluationError } from "../parser/errors";

export function gcd(a: number, b: number): number {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new EvaluationError("DOMAIN_ERROR", "GCD requires integer inputs");
  }
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  const g = gcd(a, b);
  return Math.abs(a * b) / g;
}

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function primeFactorization(n: number): number[] {
  if (!Number.isInteger(n) || n < 2) return [];
  let k = n;
  const factors: number[] = [];
  while (k % 2 === 0) {
    factors.push(2);
    k /= 2;
  }
  for (let i = 3; i * i <= k; i += 2) {
    while (k % i === 0) {
      factors.push(i);
      k /= i;
    }
  }
  if (k > 1) factors.push(k);
  return factors;
}

export function primeFactorizationString(n: number): string {
  const factors = primeFactorization(n);
  if (factors.length === 0) return `${n} is not factorable`;
  // group repeated factors
  const counts = new Map<number, number>();
  for (const f of factors) counts.set(f, (counts.get(f) ?? 0) + 1);
  return [...counts.entries()]
    .map(([p, e]) => (e === 1 ? String(p) : `${p}^${e}`))
    .join(" × ");
}

export function perm(n: number, k: number): Decimal {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) {
    throw new EvaluationError("DOMAIN_ERROR", "Invalid arguments to P(n,k)");
  }
  let result = new Decimal(1);
  for (let i = 0; i < k; i++) result = result.times(n - i);
  return result;
}

export function comb(n: number, k: number): Decimal {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) {
    throw new EvaluationError("DOMAIN_ERROR", "Invalid arguments to C(n,k)");
  }
  const smallK = Math.min(k, n - k);
  let result = new Decimal(1);
  for (let i = 0; i < smallK; i++) {
    result = result.times(n - i).div(i + 1);
  }
  return result;
}

export const numberTheory = {
  gcd,
  lcm,
  isPrime,
  primeFactorization,
  primeFactorizationString,
  perm,
  comb,
};
