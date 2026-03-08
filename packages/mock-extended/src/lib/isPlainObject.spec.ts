import { describe, expect, test } from "bun:test";
import { isPlainObject } from "./isPlainObject";

describe("isPlainObject", () => {
  test("returns true for plain objects", () => {
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  test("returns false for non-plain objects", () => {
    class A {}

    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new A())).toBe(false);
    expect(isPlainObject(() => undefined)).toBe(false);
    expect(isPlainObject(null)).toBe(false);
  });
});
