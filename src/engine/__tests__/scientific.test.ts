// engine/__tests__/scientific.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

const TOL = 1e-10;

describe("scientific: powers and roots", () => {
  it("2^10 = 1024", () => {
    const r = calculate("2^10");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1024");
  });

  it("sqrt(16) = 4", () => {
    const r = calculate("sqrt(16)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("4");
  });

  it("cbrt(27) = 3", () => {
    const r = calculate("cbrt(27)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(3, TOL);
  });

  it("root(16, 4) = 2", () => {
    const r = calculate("root(16, 4)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(2, TOL);
  });

  it("abs(-7) = 7", () => {
    const r = calculate("abs(-7)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("7");
  });

  it("pow(2, 10) = 1024", () => {
    const r = calculate("pow(2, 10)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1024");
  });

  it("exp(0) = 1", () => {
    const r = calculate("exp(0)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });
});

describe("scientific: factorial and gamma", () => {
  it("5! = 120", () => {
    const r = calculate("5!");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("120");
  });

  it("0! = 1", () => {
    const r = calculate("0!");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("fact(10) = 3628800", () => {
    const r = calculate("fact(10)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("3628800");
  });

  it("large factorial: 20! = 2432902008176640000", () => {
    const r = calculate("20!");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("2432902008176640000");
  });
});

describe("scientific: logarithms", () => {
  it("log(1000) = 3", () => {
    const r = calculate("log(1000)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(3, TOL);
  });

  it("ln(e) = 1", () => {
    const r = calculate("ln(e)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });

  it("logb(8, 2) = 3", () => {
    const r = calculate("logb(8, 2)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(3, TOL);
  });
});

describe("scientific: constants", () => {
  it("pi is approximately 3.14159...", () => {
    const r = calculate("pi");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(Math.PI, TOL);
  });

  it("e is approximately 2.71828...", () => {
    const r = calculate("e");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(Math.E, TOL);
  });

  it("phi is approximately 1.61803...", () => {
    const r = calculate("phi");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo((1 + Math.sqrt(5)) / 2, TOL);
  });

  it("tau = 2 * pi", () => {
    const r = calculate("tau");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(2 * Math.PI, TOL);
  });
});

describe("scientific: function composition", () => {
  it("sqrt(pow(3, 2) + pow(4, 2)) = 5", () => {
    const r = calculate("sqrt(pow(3, 2) + pow(4, 2))");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("5");
  });

  it("abs(ln(0.5)) = ln(2)", () => {
    const r = calculate("abs(ln(0.5))");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(Math.log(2), TOL);
  });
});
