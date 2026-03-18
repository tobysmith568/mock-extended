import { describe, expect, test } from "bun:test";
import { createMockHandler } from "./createMockHandler";

describe("createMockHandler", () => {
  test("creates and stores a lazy method mock", () => {
    let calls = 0;
    const createdFn = () => 1;

    const handler = createMockHandler({
      ignoredProps: new Set(["then"]),
      factory: () => {
        calls += 1;
        return createdFn;
      },
      deep: false,
      proxifyValue: (value) => value,
    });

    const target = {} as Record<PropertyKey, unknown>;
    const proxy = new Proxy(target, handler);

    expect((proxy as { run: unknown }).run).toBe(createdFn);
    expect((proxy as { run: unknown }).run).toBe(createdFn);
    expect(calls).toBe(1);
  });

  test("returns undefined for ignored properties", () => {
    const handler = createMockHandler({
      ignoredProps: new Set(["then"]),
      factory: () => () => undefined,
      deep: false,
      proxifyValue: (value) => value,
    });

    const proxy = new Proxy({}, handler) as { then?: unknown };

    expect(proxy.then).toBeUndefined();
  });

  test("keeps explicitly assigned undefined instead of creating a lazy mock", () => {
    let calls = 0;
    const handler = createMockHandler({
      ignoredProps: new Set(),
      factory: () => {
        calls += 1;
        return () => undefined;
      },
      deep: false,
      proxifyValue: (value) => value,
    });

    const proxy = new Proxy(
      {
        maybe: undefined,
      },
      handler,
    ) as { maybe: unknown };

    expect(proxy.maybe).toBeUndefined();
    expect(calls).toBe(0);
  });

  test("returns explicit value for ignored prop when present on target", () => {
    const handler = createMockHandler({
      ignoredProps: new Set(["ignoredProp"]),
      factory: () => () => undefined,
      deep: false,
      proxifyValue: (value) => value,
    });

    const proxy = new Proxy(
      {
        ignoredProp: "value",
      },
      handler,
    ) as { ignoredProp: unknown };

    expect(proxy.ignoredProp).toBe("value");
  });

  test("proxifies existing and assigned values", () => {
    const marker = Symbol("proxied");
    const proxifyValue = (value: unknown) => {
      if (typeof value === "object" && value !== null) {
        return { ...(value as object), [marker]: true };
      }

      return value;
    };

    const target = { nested: { a: 1 } } as Record<PropertyKey, unknown>;

    const handler = createMockHandler({
      ignoredProps: new Set(),
      factory: () => () => undefined,
      deep: true,
      proxifyValue,
    });

    const proxy = new Proxy(target, handler) as {
      nested: Record<PropertyKey, unknown>;
      assigned: Record<PropertyKey, unknown>;
    };

    expect(proxy.nested[marker]).toBe(true);

    proxy.assigned = { b: 2 };

    expect(proxy.assigned[marker]).toBe(true);
  });
});
