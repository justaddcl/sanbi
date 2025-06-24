import { clamp } from "@lib/numbers";

describe("clamp()", () => {
  it("returns the minimum when value is below the min", () => {
    expect(clamp(-5, { min: 0, max: 10 })).toBe(0);
    expect(clamp(0, { min: 5, max: 15 })).toBe(5);
  });

  it("returns the maximum when value is above the max", () => {
    expect(clamp(20, { min: 0, max: 10 })).toBe(10);
    expect(clamp(100, { min: 50, max: 75 })).toBe(75);
  });

  it("returns the original value when within [min, max]", () => {
    expect(clamp(5, { min: 0, max: 10 })).toBe(5);
    expect(clamp(50, { min: 0, max: 100 })).toBe(50);
  });

  it("allows value exactly equal to min or max", () => {
    expect(clamp(0, { min: 0, max: 10 })).toBe(0);
    expect(clamp(10, { min: 0, max: 10 })).toBe(10);
  });

  it("works with non-integer values", () => {
    expect(clamp(2.5, { min: 1.2, max: 3.4 })).toBeCloseTo(2.5);
    expect(clamp(0.5, { min: 1.2, max: 3.4 })).toBeCloseTo(1.2);
    expect(clamp(5.6, { min: 1.2, max: 3.4 })).toBeCloseTo(3.4);
  });

  it("handles Infinity and -Infinity correctly", () => {
    expect(clamp(Infinity, { min: -100, max: 100 })).toBe(100);
    expect(clamp(-Infinity, { min: -100, max: 100 })).toBe(-100);
  });

  it("propagates NaN", () => {
    expect(Number.isNaN(clamp(NaN, { min: 0, max: 10 }))).toBe(true);
  });

  it("when min === max always returns that bound", () => {
    expect(clamp(5, { min: 7, max: 7 })).toBe(7);
    expect(clamp(-3, { min: 7, max: 7 })).toBe(7);
  });

  it("if min > max it still applies min-then-max order", () => {
    // Math.max( value, min ) → at least min,
    // then Math.min(..., max) → at most max
    // so when min > max, result is always max:
    expect(clamp(5, { min: 10, max: 0 })).toBe(0);
    expect(clamp(-5, { min: 10, max: 0 })).toBe(0);
    expect(clamp(15, { min: 10, max: 0 })).toBe(0);
  });
});
