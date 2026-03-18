import { describe, expect, test } from "bun:test";
import { preprocessTarget } from "./preprocessTarget";

describe("preprocessTarget", () => {
  test("returns same object without deep mode", () => {
    const partial = { a: 1 } as Record<PropertyKey, unknown>;

    const proxifyValue = () => {
      throw new Error("should not be called");
    };

    const result = preprocessTarget(partial, false, proxifyValue);

    expect(result).toBe(partial);
  });

  test("applies proxify to all own keys in deep mode", () => {
    const key = Symbol("key");
    const partial = {
      a: 1,
      [key]: 2,
    } as Record<PropertyKey, unknown>;

    const result = preprocessTarget(
      partial,
      true,
      (value) => `v:${String(value)}`,
    );

    expect(result.a).toBe("v:1");
    expect(result[key]).toBe("v:2");
  });

  test("calls proxify exactly once per own key in deep mode", () => {
    const symbolKey = Symbol("key");
    const proxifyCalls: unknown[] = [];
    const partial = {
      a: 1,
      b: undefined,
      [symbolKey]: 3,
    } as Record<PropertyKey, unknown>;

    preprocessTarget(partial, true, (value) => {
      proxifyCalls.push(value);
      return value;
    });

    expect(proxifyCalls).toEqual([1, undefined, 3]);
  });
});
