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

  test("returns undefined for ignored properties and calls", () => {
    const handler = createMockHandler({
      ignoredProps: new Set(["then"]),
      factory: () => () => undefined,
      deep: false,
      proxifyValue: (value) => value,
    });

    const proxy = new Proxy({}, handler) as { then?: unknown; calls?: unknown };

    expect(proxy.then).toBeUndefined();
    expect(proxy.calls).toBeUndefined();
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
