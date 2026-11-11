// engine/__tests__/number-theory.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

describe("number theory", () => {
  it("gcd(12, 18) = 6", () => {
    const r = calculate("gcd(12, 18)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("6");
  });

  it("gcd(12, 18, 24) = 6 (variadic)", () => {
    const r = calculate("gcd(12, 18, 24)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("6");
  });

  it("lcm(4, 6) = 12", () => {
    const r = calculate("lcm(4, 6)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("12");
  });

  it("isprime(7) = 1", () => {
    const r = calculate("isprime(7)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("isprime(8) = 0", () => {
    const r = calculate("isprime(8)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("0");
  });

  it("isprime(2) = 1", () => {
    const r = calculate("isprime(2)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("isprime(1) = 0", () => {
    const r = calculate("isprime(1)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("0");
  });

  it("pfact(12) = 2*2*3 = 12 (product of primes)", () => {
    const r = calculate("pfact(12)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("12");
  });

  it("P(5, 2) = 20 permutations", () => {
    const r = calculate("p(5, 2)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("20");
  });

  it("C(5, 2) = 10 combinations", () => {
    const r = calculate("c(5, 2)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("10");
  });

  it("C(10, 0) = 1", () => {
    const r = calculate("c(10, 0)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("C(10, 10) = 1", () => {
    const r = calculate("c(10, 10)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("C(20, 10) = 184756", () => {
    const r = calculate("c(20, 10)");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("184756");
  });
});
