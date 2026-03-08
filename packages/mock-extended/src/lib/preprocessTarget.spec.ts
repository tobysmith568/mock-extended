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
    const key = Symbol("k");
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
});
