// engine/__tests__/statistics.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

const TOL = 1e-6;

describe("statistics", () => {
  it("mean(1,2,3,4,5) = 3", () => {
    const r = calculate("mean(1, 2, 3, 4, 5)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("3");
  });

  it("median(1,2,3) = 2", () => {
    const r = calculate("median(1, 2, 3)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("2");
  });

  it("median(1,2,3,4) = 2.5 (even count)", () => {
    const r = calculate("median(1, 2, 3, 4)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("2.5");
  });

  it("mode(1,2,2,3,3,3) = 3", () => {
    const r = calculate("mode(1, 2, 2, 3, 3, 3)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("3");
  });

  it("sum(1,2,3,4,5) = 15", () => {
    const r = calculate("sum(1, 2, 3, 4, 5)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("15");
  });

  it("min(5,3,7,1,9) = 1", () => {
    const r = calculate("min(5, 3, 7, 1, 9)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("max(5,3,7,1,9) = 9", () => {
    const r = calculate("max(5, 3, 7, 1, 9)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("9");
  });

  it("variance of [1,2,3,4,5] = 2.5 (sample)", () => {
    const r = calculate("variance(1, 2, 3, 4, 5)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(2.5, TOL);
  });

  it("stddev of [1,2,3,4,5] ~ 1.581138 (sample)", () => {
    const r = calculate("stddev(1, 2, 3, 4, 5)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(Math.sqrt(2.5), TOL);
  });

  it("hypot(3, 4) = 5", () => {
    const r = calculate("hypot(3, 4)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("5");
  });
});
