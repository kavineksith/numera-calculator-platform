// engine/evaluator/functions.ts
// Mathematical functions exposed to expressions.
//
// Implementation note: trigonometric and logarithmic functions in JavaScript
// rely on double-precision floating point. The engine preserves Decimal for
// arithmetic, but uses native Math for transcendental functions. The result
// is then wrapped back in Decimal. This means results of transcendental
// functions are accurate to roughly 1e-15 relative error, which is documented
// in ARCHITECTURE.md.

import Decimal from "../precision/decimal-config";
import { EvaluationError } from "../parser/errors";
import { toRadians, toDegrees, AngleUnit } from "./operators";

export interface FunctionDef {
  name: string;
  arity: number | number[]; // exact arity or list of allowed arities
  description: string;
  apply: (args: Decimal[], unit: AngleUnit) => Decimal;
}

// factorial with arbitrary-precision result
function factorial(n: Decimal): Decimal {
  if (!n.isInteger() || n.isNegative()) {
    throw new EvaluationError(
      "DOMAIN_ERROR",
      "Factorial is only defined for non-negative integers"
    );
  }
  const k = n.toNumber();
  if (k > 10000) {
    throw new EvaluationError("OVERFLOW", "Factorial too large to compute");
  }
  let result = new Decimal(1);
  for (let i = 2; i <= k; i++) {
    result = result.times(i);
  }
  return result;
}

// gamma function (Lanczos approximation) for non-integer inputs to factorial
function gamma(z: Decimal): Decimal {
  const x = z.toNumber();
  if (Number.isNaN(x) || !Number.isFinite(x)) {
    throw new EvaluationError("DOMAIN_ERROR", "Gamma function undefined for this input");
  }
  if (x < 0.5) {
    // reflection formula
    const pi = Math.PI;
    const result =
      pi / (Math.sin(pi * x) * gamma(new Decimal(1 - x)).toNumber());
    return new Decimal(result);
  }
  // Lanczos
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

// greatest common divisor
function gcd(a: Decimal, b: Decimal): Decimal {
  const aN = Math.abs(a.toNumber());
  const bN = Math.abs(b.toNumber());
  if (!Number.isInteger(aN) || !Number.isInteger(bN)) {
    throw new EvaluationError(
      "DOMAIN_ERROR",
      "GCD is only defined for integers"
    );
  }
  let x = aN;
  let y = bN;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return new Decimal(x);
}

function lcm(a: Decimal, b: Decimal): Decimal {
  const g = gcd(a, b);
  if (g.isZero()) return new Decimal(0);
  return a.times(b).abs().div(g).truncated();
}

function isPrime(n: Decimal): Decimal {
  const k = n.toNumber();
  if (!Number.isInteger(k) || k < 2) return new Decimal(0);
  if (k === 2 || k === 3) return new Decimal(1);
  if (k % 2 === 0 || k % 3 === 0) return new Decimal(0);
  for (let i = 5; i * i <= k; i += 6) {
    if (k % i === 0 || k % (i + 2) === 0) return new Decimal(0);
  }
  return new Decimal(1);
}

function primeFactorization(n: Decimal): Decimal[] {
  let k = n.toNumber();
  if (!Number.isInteger(k) || k < 2) {
    throw new EvaluationError(
      "DOMAIN_ERROR",
      "Prime factorization requires integer >= 2"
    );
  }
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
  return factors.map((f) => new Decimal(f));
}

// statistics helpers
function parseDataset(args: Decimal[]): Decimal[] {
  return args;
}
function mean(ds: Decimal[]): Decimal {
  if (ds.length === 0) throw new EvaluationError("INVALID_ARGUMENT", "Empty dataset");
  let s = new Decimal(0);
  for (const x of ds) s = s.plus(x);
  return s.div(ds.length);
}
function median(ds: Decimal[]): Decimal {
  if (ds.length === 0) throw new EvaluationError("INVALID_ARGUMENT", "Empty dataset");
  const sorted = [...ds].sort((a, b) => a.cmp(b));
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return sorted[mid - 1].plus(sorted[mid]).div(2);
  }
  return sorted[mid];
}
function mode(ds: Decimal[]): Decimal[] {
  if (ds.length === 0) return [];
  const counts = new Map<string, { count: number; value: Decimal }>();
  for (const x of ds) {
    const key = x.toString();
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { count: 1, value: x });
  }
  let maxCount = 0;
  for (const v of counts.values()) if (v.count > maxCount) maxCount = v.count;
  return [...counts.values()].filter((v) => v.count === maxCount).map((v) => v.value);
}
function variance(ds: Decimal[], sample: boolean): Decimal {
  if (ds.length < (sample ? 2 : 1)) {
    throw new EvaluationError("INVALID_ARGUMENT", "Dataset too small for variance");
  }
  const m = mean(ds);
  let s = new Decimal(0);
  for (const x of ds) s = s.plus(x.minus(m).pow(2));
  return s.div(sample ? ds.length - 1 : ds.length);
}

function permutations(n: Decimal, k: Decimal): Decimal {
  const nN = n.toNumber();
  const kN = k.toNumber();
  if (!Number.isInteger(nN) || !Number.isInteger(kN) || kN < 0 || kN > nN) {
    throw new EvaluationError("DOMAIN_ERROR", "Invalid arguments to P(n,k)");
  }
  let result = new Decimal(1);
  for (let i = 0; i < kN; i++) {
    result = result.times(nN - i);
  }
  return result;
}

function combinations(n: Decimal, k: Decimal): Decimal {
  const nN = n.toNumber();
  const kN = k.toNumber();
  if (!Number.isInteger(nN) || !Number.isInteger(kN) || kN < 0 || kN > nN) {
    throw new EvaluationError("DOMAIN_ERROR", "Invalid arguments to C(n,k)");
  }
  // n! / (k! (n-k)!)
  let result = new Decimal(1);
  const smallK = Math.min(kN, nN - kN);
  for (let i = 0; i < smallK; i++) {
    result = result.times(nN - i).div(i + 1);
  }
  return result;
}

// function registry — name (lowercase) -> definition
export const FUNCTIONS: Record<string, FunctionDef> = {
  // Trigonometric (input in selected angle unit)
  sin: {
    name: "sin",
    arity: 1,
    description: "Sine",
    apply: ([x], unit) => new Decimal(Math.sin(toRadians(x, unit).toNumber())),
  },
  cos: {
    name: "cos",
    arity: 1,
    description: "Cosine",
    apply: ([x], unit) => new Decimal(Math.cos(toRadians(x, unit).toNumber())),
  },
  tan: {
    name: "tan",
    arity: 1,
    description: "Tangent",
    apply: ([x], unit) => {
      const r = toRadians(x, unit).toNumber();
      const t = Math.tan(r);
      if (!Number.isFinite(t)) {
        throw new EvaluationError("UNDEFINED_RESULT", "tan is undefined at this input");
      }
      return new Decimal(t);
    },
  },
  asin: {
    name: "asin",
    arity: 1,
    description: "Arc sine (result in selected unit)",
    apply: ([x], unit) => toDegrees(new Decimal(Math.asin(clampUnit(x).toNumber())), unit),
  },
  acos: {
    name: "acos",
    arity: 1,
    description: "Arc cosine",
    apply: ([x], unit) => toDegrees(new Decimal(Math.acos(clampUnit(x).toNumber())), unit),
  },
  atan: {
    name: "atan",
    arity: 1,
    description: "Arc tangent",
    apply: ([x], unit) => toDegrees(new Decimal(Math.atan(x.toNumber())), unit),
  },
  atan2: {
    name: "atan2",
    arity: 2,
    description: "atan2(y, x) — 4-quadrant arc tangent",
    apply: ([y, x], unit) =>
      toDegrees(new Decimal(Math.atan2(y.toNumber(), x.toNumber())), unit),
  },
  sinh: {
    name: "sinh",
    arity: 1,
    description: "Hyperbolic sine",
    apply: ([x]) => new Decimal(Math.sinh(x.toNumber())),
  },
  cosh: {
    name: "cosh",
    arity: 1,
    description: "Hyperbolic cosine",
    apply: ([x]) => new Decimal(Math.cosh(x.toNumber())),
  },
  tanh: {
    name: "tanh",
    arity: 1,
    description: "Hyperbolic tangent",
    apply: ([x]) => new Decimal(Math.tanh(x.toNumber())),
  },
  asinh: {
    name: "asinh",
    arity: 1,
    description: "Inverse hyperbolic sine",
    apply: ([x]) => new Decimal(Math.asinh(x.toNumber())),
  },
  acosh: {
    name: "acosh",
    arity: 1,
    description: "Inverse hyperbolic cosine",
    apply: ([x]) => {
      const n = x.toNumber();
      if (n < 1) throw new EvaluationError("DOMAIN_ERROR", "acosh requires x >= 1");
      return new Decimal(Math.acosh(n));
    },
  },
  atanh: {
    name: "atanh",
    arity: 1,
    description: "Inverse hyperbolic tangent",
    apply: ([x]) => {
      const n = x.toNumber();
      if (Math.abs(n) >= 1) throw new EvaluationError("DOMAIN_ERROR", "atanh requires |x| < 1");
      return new Decimal(Math.atanh(n));
    },
  },

  // Powers and roots
  sqrt: {
    name: "sqrt",
    arity: 1,
    description: "Square root",
    apply: ([x]) => {
      if (x.isNegative()) {
        throw new EvaluationError("DOMAIN_ERROR", "Square root of a negative number is not a real number");
      }
      return x.sqrt();
    },
  },
  cbrt: {
    name: "cbrt",
    arity: 1,
    description: "Cube root",
    apply: ([x]) => {
      const n = x.toNumber();
      return new Decimal(Math.cbrt(n));
    },
  },
  root: {
    name: "root",
    arity: 2,
    description: "nth root — root(x, n)",
    apply: ([x, n]) => {
      if (x.isNegative() && !n.isInteger()) {
        throw new EvaluationError("DOMAIN_ERROR", "Negative base with non-integer root is not real");
      }
      if (x.isNegative() && n.isInteger() && n.mod(2).isZero()) {
        throw new EvaluationError("DOMAIN_ERROR", "Even root of a negative number is not real");
      }
      const result = x.toNumber() ** (1 / n.toNumber());
      if (!Number.isFinite(result)) {
        throw new EvaluationError("OVERFLOW", "Root computation overflowed");
      }
      return new Decimal(result);
    },
  },
  abs: {
    name: "abs",
    arity: 1,
    description: "Absolute value",
    apply: ([x]) => x.abs(),
  },
  pow: {
    name: "pow",
    arity: 2,
    description: "pow(base, exponent)",
    apply: ([base, exp]) => {
      if (base.isNegative() && !exp.isInteger()) {
        throw new EvaluationError("DOMAIN_ERROR", "Negative base with non-integer exponent is not real");
      }
      return base.pow(exp);
    },
  },
  sqr: {
    name: "sqr",
    arity: 1,
    description: "Square (x^2)",
    apply: ([x]) => x.pow(2),
  },
  cube: {
    name: "cube",
    arity: 1,
    description: "Cube (x^3)",
    apply: ([x]) => x.pow(3),
  },
  inv: {
    name: "inv",
    arity: 1,
    description: "Reciprocal (1/x)",
    apply: ([x]) => {
      if (x.isZero()) {
        throw new EvaluationError("DIVISION_BY_ZERO", "Reciprocal of zero is undefined");
      }
      return new Decimal(1).div(x);
    },
  },
  nthroot: {
    name: "nthroot",
    arity: 2,
    description: "nth root — nthroot(x, n)",
    apply: ([x, n]) => {
      if (x.isNegative() && !n.isInteger()) {
        throw new EvaluationError("DOMAIN_ERROR", "Negative base with non-integer root is not real");
      }
      if (x.isNegative() && n.isInteger() && n.mod(2).isZero()) {
        throw new EvaluationError("DOMAIN_ERROR", "Even root of a negative number is not real");
      }
      const result = x.toNumber() ** (1 / n.toNumber());
      if (!Number.isFinite(result)) {
        throw new EvaluationError("OVERFLOW", "Root computation overflowed");
      }
      return new Decimal(result);
    },
  },
  log10: {
    name: "log10",
    arity: 1,
    description: "Common logarithm (base 10) — alias of log()",
    apply: ([x]) => {
      if (x.isZero() || x.isNegative()) {
        throw new EvaluationError("DOMAIN_ERROR", "Logarithm of zero or negative number is undefined");
      }
      return new Decimal(Math.log10(x.toNumber()));
    },
  },
  exp: {
    name: "exp",
    arity: 1,
    description: "e^x",
    apply: ([x]) => {
      const n = x.toNumber();
      if (n > 700) throw new EvaluationError("OVERFLOW", "exp overflowed");
      return new Decimal(Math.exp(n));
    },
  },

  // Factorial & gamma
  fact: {
    name: "fact",
    arity: 1,
    description: "Factorial",
    apply: ([x]) => (x.isInteger() ? factorial(x) : gamma(x.plus(1))),
  },
  gamma: {
    name: "gamma",
    arity: 1,
    description: "Gamma function",
    apply: ([x]) => gamma(x),
  },

  // Logarithms
  log: {
    name: "log",
    arity: 1,
    description: "Common logarithm (base 10)",
    apply: ([x]) => {
      if (x.isZero() || x.isNegative()) {
        throw new EvaluationError(
          "DOMAIN_ERROR",
          "Logarithm of zero or negative number is undefined"
        );
      }
      return new Decimal(Math.log10(x.toNumber()));
    },
  },
  ln: {
    name: "ln",
    arity: 1,
    description: "Natural logarithm (base e)",
    apply: ([x]) => {
      if (x.isZero() || x.isNegative()) {
        throw new EvaluationError(
          "DOMAIN_ERROR",
          "Natural log of zero or negative number is undefined"
        );
      }
      return new Decimal(Math.log(x.toNumber()));
    },
  },
  logb: {
    name: "logb",
    arity: 2,
    description: "Logarithm with arbitrary base — logb(x, base)",
    apply: ([x, base]) => {
      if (x.isZero() || x.isNegative() || base.isZero() || base.isNegative() || base.eq(1)) {
        throw new EvaluationError("DOMAIN_ERROR", "Invalid logb arguments");
      }
      return new Decimal(Math.log(x.toNumber()) / Math.log(base.toNumber()));
    },
  },

  // Rounding
  floor: {
    name: "floor",
    arity: 1,
    description: "Floor",
    apply: ([x]) => x.floor(),
  },
  ceil: {
    name: "ceil",
    arity: 1,
    description: "Ceiling",
    apply: ([x]) => x.ceil(),
  },
  round: {
    name: "round",
    arity: 1,
    description: "Round to nearest integer",
    apply: ([x]) => x.round(),
  },
  trunc: {
    name: "trunc",
    arity: 1,
    description: "Truncate toward zero",
    apply: ([x]) => x.truncated(),
  },
  sign: {
    name: "sign",
    arity: 1,
    description: "Sign function (-1, 0, or 1)",
    apply: ([x]) => {
      if (x.isZero()) return new Decimal(0);
      return x.isNegative() ? new Decimal(-1) : new Decimal(1);
    },
  },

  // Number theory
  gcd: {
    name: "gcd",
    arity: [2, 3, 4, 5],
    description: "Greatest common divisor",
    apply: (args) => args.reduce((acc, x) => gcd(acc, x)),
  },
  lcm: {
    name: "lcm",
    arity: [2, 3, 4, 5],
    description: "Least common multiple",
    apply: (args) => args.reduce((acc, x) => lcm(acc, x)),
  },
  isprime: {
    name: "isprime",
    arity: 1,
    description: "Returns 1 if prime, 0 otherwise",
    apply: ([x]) => isPrime(x),
  },
  pfact: {
    name: "pfact",
    arity: 1,
    description: "Prime factorization (returns product of prime factors)",
    apply: ([x]) => primeFactorization(x).reduce((acc, p) => acc.times(p), new Decimal(1)),
  },
  p: {
    name: "p",
    arity: 2,
    description: "Permutations P(n, k)",
    apply: ([n, k]) => permutations(n, k),
  },
  c: {
    name: "c",
    arity: 2,
    description: "Combinations C(n, k)",
    apply: ([n, k]) => combinations(n, k),
  },

  // Statistics (variadic)
  mean: {
    name: "mean",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Arithmetic mean",
    apply: (args) => mean(parseDataset(args)),
  },
  median: {
    name: "median",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Median",
    apply: (args) => median(parseDataset(args)),
  },
  mode: {
    name: "mode",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: "Mode (first mode returned if multiple)",
    apply: (args) => {
      const modes = mode(parseDataset(args));
      return modes[0] ?? new Decimal(0);
    },
  },
  variance: {
    name: "variance",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Sample variance",
    apply: (args) => variance(parseDataset(args), true),
  },
  stddev: {
    name: "stddev",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Sample standard deviation",
    apply: (args) => variance(parseDataset(args), true).sqrt(),
  },
  sum: {
    name: "sum",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Sum of values",
    apply: (args) => args.reduce((acc, x) => acc.plus(x), new Decimal(0)),
  },
  min: {
    name: "min",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Minimum",
    apply: (args) => args.reduce((acc, x) => (acc.lt(x) ? acc : x)),
  },
  max: {
    name: "max",
    arity: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    description: "Maximum",
    apply: (args) => args.reduce((acc, x) => (acc.gt(x) ? acc : x)),
  },

  // Other
  rand: {
    name: "rand",
    arity: 0,
    description: "Random number in [0, 1)",
    apply: () => new Decimal(Math.random()),
  },
  hypot: {
    name: "hypot",
    arity: [1, 2, 3, 4, 5],
    description: "sqrt(sum of squares)",
    apply: (args) => {
      let s = new Decimal(0);
      for (const x of args) s = s.plus(x.pow(2));
      return s.sqrt();
    },
  },
};

function clampUnit(x: Decimal): Decimal {
  const n = x.toNumber();
  if (n < -1 || n > 1) {
    throw new EvaluationError("DOMAIN_ERROR", "Inverse trig argument must be in [-1, 1]");
  }
  return x;
}

export function getFunction(name: string): FunctionDef | undefined {
  return FUNCTIONS[name.toLowerCase()];
}

export function listFunctions(): string[] {
  return Object.keys(FUNCTIONS).sort();
}
