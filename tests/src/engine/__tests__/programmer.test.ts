// engine/__tests__/programmer.test.ts
import { describe, it, expect } from "vitest";
import { calculate } from "../index";

describe("programmer: bitwise operations (32-bit signed)", () => {
  it("5 AND 3 = 1", () => {
    const r = calculate("5 and 3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("1");
  });

  it("5 OR 3 = 7", () => {
    const r = calculate("5 or 3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("7");
  });

  it("5 XOR 3 = 6", () => {
    const r = calculate("5 xor 3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("6");
  });

  it("NOT 0 = -1 (32-bit signed)", () => {
    const r = calculate("not 0");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("-1");
  });

  it("1 << 3 = 8", () => {
    const r = calculate("1 << 3");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("8");
  });

  it("256 >> 2 = 64", () => {
    const r = calculate("256 >> 2");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("64");
  });

  it("NOT 5 = -6 (signed complement)", () => {
    const r = calculate("not 5");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("-6");
  });

  it("complex: (0xFF and 0x0F) = 15", () => {
    // 0xFF = 255, 0x0F = 15, AND = 15
    const r = calculate("255 and 15");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("15");
  });
});

describe("programmer: large numbers handled correctly", () => {
  it("0xFFFFFFFF (4294967295) NOT = 0 (after toInt32 wrapping)", () => {
    // 0xFFFFFFFF -> toInt32 -> -1 -> NOT -> 0
    const r = calculate("not 4294967295");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.toString()).toBe("0");
  });
});
