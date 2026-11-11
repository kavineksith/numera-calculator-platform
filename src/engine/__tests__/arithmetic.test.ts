// engine/__tests__/arithmetic.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

describe("arithmetic: basic operations", () => {
  it("adds two integers", () => {
    const r = calculate("2+3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("5");
  });

  it("subtracts", () => {
    const r = calculate("10-4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("6");
  });

  it("multiplies", () => {
    const r = calculate("6*7");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("42");
  });

  it("divides evenly", () => {
    const r = calculate("20/4");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("5");
  });

  it("divides with decimal result", () => {
    const r = calculate("7/2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("3.5");
  });

  it("handles decimals", () => {
    const r = calculate("0.1+0.2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("0.3");
  });

  it("handles negative numbers", () => {
    const r = calculate("-5+3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("-2");
  });

  it("handles large numbers via Decimal precision", () => {
    const r = calculate("99999999999999999999+1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("100000000000000000000");
  });

  it("handles unary chaining", () => {
    const r = calculate("--5");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("5");
  });
});

describe("arithmetic: percentage and modulo", () => {
  it("modulo positive", () => {
    const r = calculate("10%3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("mod keyword", () => {
    const r = calculate("17 mod 5");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("2");
  });
});
