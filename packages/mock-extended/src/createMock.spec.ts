import { describe, expect, test } from "bun:test";
import { createMock } from ".";
import { createTestMockFunction } from "./test-utils/testMockFn";

describe("createMock", () => {
  test("creates methods lazily", () => {
    let factoryCalls = 0;
    const mock = createMock(() => {
      factoryCalls += 1;
      return createTestMockFunction();
    });

    const dep = mock<{ doWork: (arg: string) => number }>();

    expect(factoryCalls).toBe(0);

    dep.doWork;

    expect(factoryCalls).toBe(1);
  });

  test("returns the same method mock for repeated access", () => {
    const mock = createMock(createTestMockFunction);
    const dep = mock<{ doWork: (arg: string) => number }>();

    expect(dep.doWork).toBe(dep.doWork);
  });

  test("uses the mock function behavior provided by the factory", () => {
    const mock = createMock(createTestMockFunction);
    const dep = mock<{ doWork: (arg: string) => number }>();

    dep.doWork.setReturnValue(42);

    const result = dep.doWork("abc");

    expect(result).toBe(42);
    expect(dep.doWork.calls).toEqual([["abc"]]);
  });

  test("keeps partial values including false, null and undefined", () => {
    interface Dependency {
      enabled: boolean;
      data: string | null;
      value: string | undefined;
      doWork: (arg: string) => number;
    }

    const mock = createMock(createTestMockFunction);
    const dep = mock<Dependency>({
      enabled: false,
      data: null,
      value: undefined,
    });

    expect(dep.enabled).toBe(false);
    expect(dep.data).toBeNull();
    expect(dep.value).toBeUndefined();
  });

  test("supports assigning non-function properties", () => {
    const mock = createMock(createTestMockFunction);
    const dep = mock<{ count: number }>();

    dep.count = 2;

    expect(dep.count).toBe(2);
  });

  test("uses explicitly assigned method value", () => {
    const mock = createMock(createTestMockFunction);
    const dep = mock<{ doWork: (arg: string) => number }>();

    const method = createTestMockFunction();
    method.setReturnValue(12);
    dep.doWork = method as typeof dep.doWork;

    expect(dep.doWork("x")).toBe(12);
  });

  test("ignores then by default to avoid thenable behavior", () => {
    let factoryCalls = 0;

    const mock = createMock(() => {
      factoryCalls += 1;
      return createTestMockFunction();
    });

    const dep = mock<{ then: () => void; doWork: () => void }>();

    expect(dep.then).toBeUndefined();
    expect(factoryCalls).toBe(0);

    dep.doWork;

    expect(factoryCalls).toBe(1);
  });

  test("can opt in to mocking then", () => {
    const mock = createMock(createTestMockFunction, { ignoredProps: [] });
    const dep = mock<{ then: () => void }>();

    expect(typeof dep.then).toBe("function");
  });

  test("creates nested mocks recursively", () => {
    interface Dependency {
      nested: {
        service: {
          run: (arg: string) => number;
        };
      };
    }

    const mock = createMock(createTestMockFunction, { deep: true });
    const dep = mock<Dependency>();

    dep.nested.service.run.setReturnValue(9);

    expect(dep.nested.service.run("abc")).toBe(9);
    expect(dep.nested).toBe(dep.nested);
    expect(dep.nested.service).toBe(dep.nested.service);
    expect(dep.nested.service.run.calls).toEqual([["abc"]]);
  });

  test("deep partials preserve values and still mock missing nested methods", () => {
    interface Dependency {
      nested: {
        enabled: boolean;
        service: {
          run: () => string;
        };
      };
    }

    const mock = createMock(createTestMockFunction, { deep: true });
    const dep = mock<Dependency>({
      nested: {
        enabled: false,
        service: {},
      } as Dependency["nested"],
    });

    dep.nested.service.run.setReturnValue("ok");

    expect(dep.nested.enabled).toBe(false);
    expect(dep.nested.service.run()).toBe("ok");
  });

  test("deep mode supports callable function properties with nested members", () => {
    interface Dependency {
      tool: ((arg: string) => number) & {
        meta: {
          value: () => number;
        };
      };
    }

    const mock = createMock(createTestMockFunction, {
      deep: true,
      funcPropSupport: true,
    });
    const dep = mock<Dependency>();

    dep.tool.setReturnValue(3);
    dep.tool.meta.value.setReturnValue(11);

    expect(dep.tool("x")).toBe(3);
    expect(dep.tool.meta.value()).toBe(11);
  });

  test("deep mode does not proxy class and built-in instances", () => {
    class Counter {
      constructor(private readonly value: number) {}

      current() {
        return this.value;
      }
    }

    const createdAt = new Date("2026-03-08T00:00:00.000Z");
    const map = new Map<string, number>([["a", 1]]);
    const counter = new Counter(7);

    interface Dependency {
      createdAt: Date;
      values: Map<string, number>;
      counter: Counter;
    }

    const mock = createMock(createTestMockFunction, { deep: true });
    const dep = mock<Dependency>({
      createdAt,
      values: map,
      counter,
    });

    expect(dep.createdAt as unknown as Date).toBe(createdAt);
    expect((dep.createdAt as unknown as Date).getTime()).toBe(
      createdAt.getTime(),
    );
    expect(dep.values as unknown as Map<string, number>).toBe(map);
    expect((dep.values as unknown as Map<string, number>).get("a")).toBe(1);
    expect(dep.counter as unknown as Counter).toBe(counter);
    expect((dep.counter as unknown as Counter).current()).toBe(7);
  });
});
