// engine/__tests__/edge-cases.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

describe("edge cases: division by zero", () => {
  it("1/0 -> DIVISION_BY_ZERO error", () => {
    const r = calculate("1/0");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DIVISION_BY_ZERO");
  });

  it("0/0 -> DIVISION_BY_ZERO error (not NaN)", () => {
    const r = calculate("0/0");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DIVISION_BY_ZERO");
  });

  it("modulo by zero -> error", () => {
    const r = calculate("5%0");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DIVISION_BY_ZERO");
  });
});

describe("edge cases: domain errors", () => {
  it("sqrt(-1) -> DOMAIN_ERROR", () => {
    const r = calculate("sqrt(-1)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });

  it("log(0) -> DOMAIN_ERROR", () => {
    const r = calculate("log(0)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });

  it("log(-5) -> DOMAIN_ERROR", () => {
    const r = calculate("log(-5)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });

  it("ln(-1) -> DOMAIN_ERROR", () => {
    const r = calculate("ln(-1)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });

  it("(-1)! -> DOMAIN_ERROR", () => {
    const r = calculate("(-1)!");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });

  it("asin(2) out of domain", () => {
    const r = calculate("asin(2)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });

  it("acosh(0.5) out of domain", () => {
    const r = calculate("acosh(0.5)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });

  it("negative base with fractional exponent", () => {
    const r = calculate("(-8)^(1/3)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("DOMAIN_ERROR");
  });
});

describe("edge cases: parse errors", () => {
  it("double operator '2**3' is invalid (parsed as power)", () => {
    // 2**3 tokenizes as 2 * * 3 -> not a valid expression for our grammar
    // (we use ^ for power, so ** is malformed)
    const r = calculate("2**3");
    expect(r.ok).toBe(false);
  });

  it("unbalanced parens '((2+3)' is invalid", () => {
    const r = calculate("((2+3)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("PARSE_ERROR");
  });

  it("extra closing paren '(2+3))' is invalid", () => {
    const r = calculate("(2+3))");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("PARSE_ERROR");
  });

  it("empty string is invalid", () => {
    const r = calculate("");
    expect(r.ok).toBe(false);
  });

  it("just operators '+' is invalid", () => {
    const r = calculate("+");
    expect(r.ok).toBe(false);
  });

  it("unknown function 'foo(3)' is invalid", () => {
    const r = calculate("foo(3)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_FUNCTION");
  });

  it("unknown constant 'xyz' is invalid", () => {
    const r = calculate("xyz");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("UNKNOWN_VARIABLE");
  });

  it("unexpected character '@'", () => {
    const r = calculate("2 @ 3");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("TOKENIZE_ERROR");
  });
});

describe("edge cases: overflow & large numbers", () => {
  it("very large factorial overflows or raises domain", () => {
    // 50000! should overflow due to our 100k cap -> raises OVERFLOW
    const r = calculate("50000!");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(["OVERFLOW", "DOMAIN_ERROR"]).toContain(r.error.code);
    }
  });

  it("exp(1000) overflows", () => {
    const r = calculate("exp(1000)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("OVERFLOW");
  });
});

describe("edge cases: arity mismatch", () => {
  it("sin() with no args", () => {
    const r = calculate("sin()");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("ARITY_MISMATCH");
  });

  it("sqrt(1, 2) with too many args", () => {
    const r = calculate("sqrt(1, 2)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("ARITY_MISMATCH");
  });
});
