// engine/__tests__/precedence.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

describe("operator precedence", () => {
  it("multiplication before addition", () => {
    const r = calculate("2+3*4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("14");
  });

  it("parentheses override precedence", () => {
    const r = calculate("(2+3)*4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("20");
  });

  it("power is right-associative", () => {
    // 2^3^2 = 2^(3^2) = 2^9 = 512
    const r = calculate("2^3^2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("512");
  });

  it("unary minus binds tighter than power on left", () => {
    const r = calculate("-2^2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("-4");
  });

  it("nested parentheses", () => {
    const r = calculate("((1+2)*(3+4))");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("21");
  });

  it("implicit multiplication", () => {
    const r = calculate("2(3+4)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("14");
  });

  it("implicit multiplication with constant", () => {
    const r = calculate("2pi");
    expect(r.ok).toBe(true);
    if (r.ok) {
      const val = r.value.toNumber();
      expect(val).toBeCloseTo(2 * Math.PI, 10);
    }
  });

  it("chain of mixed operators", () => {
    // 1 + 2 * 3 - 4 / 2 = 1 + 6 - 2 = 5
    const r = calculate("1+2*3-4/2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("5");
  });
});
