# Testing

## Test runner

The project uses **Vitest 5** for the math engine test suite. Tests live in `src/engine/__tests__/`.

Configuration: `vitest.config.ts`
```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    environment: "node",
    include: ["src/engine/__tests__/**/*.test.ts"],
    globals: true,
  },
});
```

## Running tests

```bash
bun run test          # run all tests once
bun run test:watch    # watch mode (re-runs on file change)
```

## Test coverage

**109 tests across 8 test files**, all passing:

| Suite                     | Tests | File                                              |
| ------------------------- | ----- | ------------------------------------------------- |
| Basic arithmetic          | 10    | `src/engine/__tests__/arithmetic.test.ts`         |
| Operator precedence       | 8     | `src/engine/__tests__/precedence.test.ts`         |
| Scientific functions      | 20    | `src/engine/__tests__/scientific.test.ts`        |
| Trigonometry (deg + rad) | 15    | `src/engine/__tests__/trigonometry.test.ts`       |
| Edge cases                | 23    | `src/engine/__tests__/edge-cases.test.ts`         |
| Number theory             | 13    | `src/engine/__tests__/number-theory.test.ts`      |
| Statistics                | 10    | `src/engine/__tests__/statistics.test.ts`         |
| Programmer / bitwise      | 9     | `src/engine/__tests__/programmer.test.ts`         |

## What's covered

### Arithmetic (`arithmetic.test.ts`)
- Addition, subtraction, multiplication, division (integer and decimal results)
- Decimal precision: `0.1 + 0.2 === 0.3` (passes because of Decimal.js)
- Negative numbers, unary chaining
- Large numbers (50+ significant digits preserved)
- Modulo (operator and keyword form)

### Precedence (`precedence.test.ts`)
- Multiplication before addition (`2+3*4 === 14`)
- Parentheses override (`(2+3)*4 === 20`)
- Right-associative power (`2^3^2 === 512`, not 64)
- Unary minus binds tighter than power on the left (`-2^2 === -4`)
- Nested parentheses
- Implicit multiplication (`2(3+4) === 14`, `2π === 2*π`)
- Mixed operator chains

### Scientific (`scientific.test.ts`)
- Powers, roots (square, cube, n-th)
- Absolute value
- Factorial (integer and large values: `20!`)
- Logarithms (log10, ln, logb with custom base)
- Constants (π, e, φ, τ, γ)
- Function composition (`sqrt(pow(3,2) + pow(4,2)) === 5`)

### Trigonometry (`trigonometry.test.ts`)
- sin/cos/tan in degrees and radians
- Inverse trig (asin, acos, atan, atan2)
- Hyperbolic functions (sinh, cosh, tanh, asinh, acosh, atanh)
- Domain validation (asin(2) → DOMAIN_ERROR)

### Edge cases (`edge-cases.test.ts`)
- Division by zero (1/0, 0/0, 5%0)
- Domain errors: √(-1), log(0), log(-1), ln(-1), (-1)!, asin(2), acosh(0.5), negative base with fractional exponent
- Parse errors: `**`, unbalanced parens, empty string, lone operators, unknown functions, unknown constants, unexpected characters
- Overflow: `exp(1000)`, `50000!`
- Arity mismatch: `sin()`, `sqrt(1, 2)`

### Number theory (`number-theory.test.ts`)
- gcd (binary and variadic)
- lcm
- isPrime (positive and negative cases, edge cases 1, 2, 3)
- primeFactorization (product form)
- Permutations P(n, k)
- Combinations C(n, k) including C(n, 0), C(n, n), large values

### Statistics (`statistics.test.ts`)
- mean, median (odd and even count), mode, sum, min, max
- variance (sample)
- stddev (sample)
- hypot

### Programmer (`programmer.test.ts`)
- Bitwise AND, OR, XOR, NOT
- Left shift, right shift
- Signed 32-bit integer wrapping
- Magic-byte parsing of `0xFFFFFFFF`

## Test patterns

### Direct engine calls
```typescript
import { calculate } from "../index";

it("5! = 120", () => {
  const r = calculate("5!");
  expect(r.ok).toBe(true);
  if (r.ok) expect(r.value.toString()).toBe("120");
});
```

### Error assertions
```typescript
it("sqrt(-1) -> DOMAIN_ERROR", () => {
  const r = calculate("sqrt(-1)");
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
});
```

### Tolerance-based floating-point
```typescript
const TOL = 1e-10;
it("sin(90deg) = 1", () => {
  const r = calculate("sin(90)", { angleUnit: "deg" });
  expect(r.ok).toBe(true);
  if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
});
```

## Lint

```bash
bun run lint
```

ESLint with `eslint-config-next` plus React Hooks rules. The project enforces 0 errors (warnings are accepted for unused eslint-disable directives).

## Manual browser verification

After running `bun run dev`, open the application in the preview panel and verify:

1. **Standard mode**: type `5 + 3 =` → display shows `8`.
2. **Scientific mode**: switch tabs, set DEG, click `sin`, `(`, `9`, `0`, `)`, `=` → display shows `1`.
3. **Advanced mode**: switch tabs, with default inputs `12` and `18`, click GCD → display shows `6`.
4. **History**: open the History panel — recent calculations appear.
5. **Themes**: open the theme picker — all 10 themes appear; clicking one changes the calculator colors.
6. **Settings**: open the Settings dialog — all 15 categories render.
7. **Keyboard**: type `2 + 2 Enter` → display updates.

## Future test work

The following test suites are recommended but not yet implemented:

- **React component tests** (React Testing Library) — button interactions, mode switching, display updates, theme changes, settings persistence.
- **Backend integration tests** — Route Handlers, Prisma repositories, transactions, validation, rate limiting, file uploads, error handling.
- **End-to-end tests** (Playwright) — open the application, perform standard calculations, switch to scientific mode, save calculations, refresh and recover, customize themes, upload an image, export/import themes, export/import history, operate offline.
- **Security tests** — SQL injection, XSS, CSRF, SSRF, path traversal, OS command injection, prototype pollution, malicious theme imports, malformed JSON, malicious image uploads, unauthorized access.
- **Property-based tests** (fast-check) — for the math engine: e.g. `forall a, b: gcd(a, b) === gcd(b, a)`, `forall n: n! === n * (n-1)!` for `n > 0`.
- **Differential testing** — compare engine output against WolframAlpha / bc / Python's `decimal` module for a corpus of expressions.
