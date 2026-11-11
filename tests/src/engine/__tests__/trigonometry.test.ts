// engine/__tests__/trigonometry.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

const TOL = 1e-10;

describe("trigonometry in degrees", () => {
  it("sin(0deg) = 0", () => {
    const r = calculate("sin(0)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(0, TOL);
  });

  it("sin(90deg) = 1", () => {
    const r = calculate("sin(90)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });

  it("cos(0deg) = 1", () => {
    const r = calculate("cos(0)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });

  it("cos(180deg) = -1", () => {
    const r = calculate("cos(180)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(-1, TOL);
  });

  it("tan(45deg) = 1", () => {
    const r = calculate("tan(45)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });

  it("asin(1)deg = 90", () => {
    const r = calculate("asin(1)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(90, TOL);
  });

  it("atan(1)deg = 45", () => {
    const r = calculate("atan(1)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(45, TOL);
  });

  it("atan2(1,1)deg = 45", () => {
    const r = calculate("atan2(1, 1)", { angleUnit: "deg" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(45, TOL);
  });
});

describe("trigonometry in radians", () => {
  it("sin(pi/2) = 1", () => {
    const r = calculate("sin(pi/2)", { angleUnit: "rad" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });

  it("cos(pi) = -1", () => {
    const r = calculate("cos(pi)", { angleUnit: "rad" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(-1, TOL);
  });

  it("asin(1)rad = pi/2", () => {
    const r = calculate("asin(1)", { angleUnit: "rad" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(Math.PI / 2, TOL);
  });
});

describe("hyperbolic functions", () => {
  it("sinh(0) = 0", () => {
    const r = calculate("sinh(0)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(0, TOL);
  });

  it("cosh(0) = 1", () => {
    const r = calculate("cosh(0)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });

  it("tanh(0) = 0", () => {
    const r = calculate("tanh(0)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(0, TOL);
  });

  it("asinh(sinh(1)) = 1", () => {
    const r = calculate("asinh(sinh(1))");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toNumber()).toBeCloseTo(1, TOL);
  });
});
