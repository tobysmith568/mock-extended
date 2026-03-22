import { describe, expect, test } from "bun:test";
import { createMock } from "..";
import { createTestMockFunction } from "../test-utils/testMockFn";

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

  test("keeps generated methods as mock-typed", () => {
    interface Dependency {
      doWork: (arg: string) => number;
    }

    const mock = createMock(createTestMockFunction);
    const dep = mock<Dependency>();

    dep.doWork.setReturnValue(6);

    expect(dep.doWork("x")).toBe(6);
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

    const mock = createMock(createTestMockFunction, {
      deep: true,
      funcPropSupport: true,
    });
    const dep = mock<Dependency>();

    dep.nested.service.run.setReturnValue(9);

    expect(dep.nested.service.run("abc")).toBe(9);
    expect(dep.nested).toBe(dep.nested);
    expect(dep.nested.service).toBe(dep.nested.service);
    expect(dep.nested.service.run.calls).toEqual([["abc"]]);
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

  test("deep mode does not deep-mock function properties by default", () => {
    interface Dependency {
      tool: ((arg: string) => number) & {
        meta: {
          value: () => number;
        };
      };
    }

    const mock = createMock(createTestMockFunction, { deep: true });
    const dep = mock<Dependency>();

    expect(typeof dep.tool).toBe("function");
    expect(dep.tool.meta).toBeUndefined();
  });

  describe("withDefaults", () => {
    test("keeps partial values including false, null and undefined", () => {
      interface Dependency {
        enabled: boolean;
        data: string | null;
        value: string | undefined;
        doWork: (arg: string) => number;
      }

      const mock = createMock(createTestMockFunction);
      const dep = mock.withDefaults<Dependency>()({
        enabled: false,
        data: null,
        value: undefined,
      });

      expect(dep.enabled).toBe(false);
      expect(dep.data).toBeNull();
      expect(dep.value).toBeUndefined();
    });

    test("keeps additional falsy partial values like 0, empty string, and NaN", () => {
      interface Dependency {
        attempts: number;
        label: string;
        score: number;
        doWork: () => number;
      }

      const mock = createMock(createTestMockFunction);
      const dep = mock.withDefaults<Dependency>()({
        attempts: 0,
        label: "",
        score: Number.NaN,
      });

      expect(dep.attempts).toBe(0);
      expect(dep.label).toBe("");
      expect(dep.score).toBeNaN();
    });

    test("preserves symbol-keyed partial values", () => {
      const flag = Symbol("flag");
      const mock = createMock(createTestMockFunction);
      const dep = mock.withDefaults<{ [flag]: number; doWork: () => number }>()(
        {
          [flag]: 42,
        } as { [flag]: number; doWork: () => number },
      );

      expect(dep[flag]).toBe(42);
    });

    test("keeps provided method defaults as plain function types", () => {
      interface Dependency {
        doWork: (arg: string) => number;
        count: number;
      }

      const mock = createMock(createTestMockFunction);
      const dep = mock.withDefaults<Dependency>()({
        count: 5,
        doWork: (_arg: string) => 123,
      });

      expect(dep.count).toBe(5);
      expect(dep.doWork("x")).toBe(123);

      const __typecheckOnly = () => {
        // @ts-expect-error Provided function defaults should not expose mock APIs.
        dep.doWork.setReturnValue(6);
      };
      void __typecheckOnly;
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
      const dep = mock.withDefaults<Dependency>()({
        nested: {
          enabled: false,
          service: {},
        },
      });

      dep.nested.service.run.setReturnValue("ok");

      expect(dep.nested.enabled).toBe(false);
      expect(dep.nested.service.run()).toBe("ok");
    });

    test("deep partials support nested values beyond two levels", () => {
      interface Dependency {
        nested: {
          level2: {
            enabled: boolean;
            level3: {
              run: () => string;
            };
          };
        };
      }

      const mock = createMock(createTestMockFunction, { deep: true });
      const dep = mock.withDefaults<Dependency>()({
        nested: {
          level2: {
            enabled: false,
            level3: {},
          },
        },
      });

      dep.nested.level2.level3.run.setReturnValue("deep-ok");

      expect(dep.nested.level2.enabled).toBe(false);
      expect(dep.nested.level2.level3.run()).toBe("deep-ok");
    });

    test("deep partials keep arrays as plain values", () => {
      interface Dependency {
        values: number[];
        nested: {
          run: () => number;
        };
      }

      const values = [1, 2, 3];
      const mock = createMock(createTestMockFunction, { deep: true });
      const dep = mock.withDefaults<Dependency>()({
        values,
        nested: {},
      });

      dep.nested.run.setReturnValue(8);

      expect(dep.values).toBe(values);
      expect(dep.nested.run()).toBe(8);
    });

    test("deep mode with funcPropSupport preserves partial function members", () => {
      interface Dependency {
        tool: ((arg: string) => number) & {
          meta: {
            enabled: boolean;
            value: () => number;
          };
        };
      }

      const tool = Object.assign((_arg: string) => 0, {
        meta: {
          enabled: false,
        },
      });

      const mock = createMock(createTestMockFunction, {
        deep: true,
        funcPropSupport: true,
      });
      const dep = mock.withDefaults<Dependency>()({ tool });

      dep.tool.meta.value.setReturnValue(10);

      expect(dep.tool.meta.enabled).toBe(false);
      expect(dep.tool("x")).toBe(0);
      expect(dep.tool.meta.value()).toBe(10);

      const __typecheckOnly = () => {
        // @ts-expect-error Provided function defaults should not expose mock APIs.
        dep.tool.setReturnValue(5);
      };
      void __typecheckOnly;
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
      const dep = mock.withDefaults<Dependency>()({
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
});
