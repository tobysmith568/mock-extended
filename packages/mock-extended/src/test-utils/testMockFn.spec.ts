import { describe, expect, test } from "bun:test";
import { createTestMockFunction } from "./testMockFn";

describe("createTestMockFunction", () => {
  test("returns undefined by default", () => {
    const fn = createTestMockFunction();

    const result = fn("a", 123);

    expect(result).toBeUndefined();
  });

  test("records calls and returns undefined by default", () => {
    const fn = createTestMockFunction();

    const _result = fn("a", 123);

    expect(fn.calls).toEqual([["a", 123]]);
  });

  test("uses custom implementation", () => {
    const fn = createTestMockFunction();

    fn.setImplementation((value: unknown) => `${String(value)}!`);

    expect(fn("ok")).toBe("ok!");
    expect(fn.calls).toEqual([["ok"]]);
  });

  test("uses return value helper", () => {
    const fn = createTestMockFunction();

    fn.setReturnValue(42);

    expect(fn("ignored")).toBe(42);
    expect(fn.calls).toEqual([["ignored"]]);
  });

  test("reset clears call history and implementation", () => {
    const fn = createTestMockFunction();

    fn.setReturnValue("x");
    fn("first");

    fn.reset();

    expect(fn.calls).toEqual([]);
    expect(fn("second")).toBeUndefined();
    expect(fn.calls).toEqual([["second"]]);
  });
});
