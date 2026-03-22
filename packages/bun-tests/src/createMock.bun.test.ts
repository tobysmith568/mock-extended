import { mock as bunMock, describe, expect, test } from "bun:test";
import { createMock } from "mock-extended";

describe("mock-extended with Bun", () => {
  type Dependency = {
    doWork: (arg: string) => number;
  };

  test("creates method mocks lazily from Bun mock() factory", () => {
    const factory = bunMock(() => bunMock());
    const mock = createMock(factory);

    const dep = mock<Dependency>();

    expect(factory).toHaveBeenCalledTimes(0);

    const method = dep.doWork;

    expect(typeof method).toBe("function");
    expect(dep.doWork).toBe(method);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  test("supports Bun mockReturnValue on generated methods", () => {
    const mock = createMock(() => bunMock());
    const dep = mock<Dependency>();

    dep.doWork.mockReturnValue(42);

    expect(dep.doWork("abc")).toBe(42);
    expect(dep.doWork).toHaveBeenCalledTimes(1);
  });

  test("exposes Bun call metadata via mock.calls", () => {
    const mock = createMock(() => bunMock());
    const dep = mock<Dependency>();

    dep.doWork("abc");
    dep.doWork("def");

    expect(dep.doWork.mock.calls).toEqual([["abc"], ["def"]]);
  });

  test("ignores then by default", () => {
    const factory = bunMock(() => bunMock());
    const mock = createMock(factory);

    const dep = mock<{ then: () => void; doWork: () => void }>();

    expect(dep.then).toBeUndefined();

    dep.doWork;

    expect(factory).toHaveBeenCalledTimes(1);
  });

  test("supports deep recursive mocks", () => {
    const mock = createMock(() => bunMock(), {
      deep: true,
      funcPropSupport: true,
    });

    type DeepDependency = {
      nested: {
        service: {
          run: (arg: string) => string;
        };
      };
    };

    const dep = mock<DeepDependency>();
    const runMock = bunMock();

    runMock.mockReturnValue("ok");
    dep.nested.service.run = runMock as typeof dep.nested.service.run;

    expect(dep.nested.service.run("x")).toBe("ok");
    expect(runMock).toHaveBeenCalledWith("x");
    expect(dep.nested).toBe(dep.nested);
  });

  describe("withDefaults", () => {
    test("keeps provided method defaults as plain function types", () => {
      const mock = createMock(() => bunMock());
      const dep = mock.withDefaults<Dependency>()({
        doWork: (_arg: string) => 123,
      });

      expect(dep.doWork("abc")).toBe(123);

      const __typecheckOnly = () => {
        // @ts-expect-error Provided function defaults should not expose Bun mock APIs.
        dep.doWork.mockReturnValue(6);
      };
      void __typecheckOnly;
    });

    test("does not proxy class instances in deep mode", () => {
      class Counter {
        constructor(private readonly value: number) {}

        current() {
          return this.value;
        }
      }

      const counter = new Counter(7);
      const plain = {
        nested: {},
      };

      const mock = createMock(() => bunMock(), { deep: true });
      const dep = mock.withDefaults<{
        counter: Counter;
        plain: {
          nested: {
            run: () => number;
          };
        };
      }>()({ counter, plain });
      const runMock = bunMock();

      runMock.mockReturnValue(3);
      dep.plain.nested.run = runMock as typeof dep.plain.nested.run;

      expect(dep.counter as unknown as Counter).toBe(counter);
      expect((dep.counter as unknown as Counter).current()).toBe(7);
      expect(dep.plain).not.toBe(plain);
      expect(dep.plain.nested.run()).toBe(3);
    });

    describe("partial values", () => {
      type PartialDependency = {
        enabled: boolean;
        count: number;
        note: string | undefined;
        nested: {
          service: {
            run: () => string;
          };
        };
      };

      test("preserves explicit partial values", () => {
        const mock = createMock(() => bunMock(), { deep: true });
        const dep = mock.withDefaults<PartialDependency>()({
          enabled: false,
          count: 0,
          note: undefined,
          nested: { service: {} },
        });

        expect(dep.enabled).toBe(false);
        expect(dep.count).toBe(0);
        expect(dep.note).toBeUndefined();
      });

      test("lazy-mocks missing deep methods from partial input", () => {
        const mock = createMock(() => bunMock(), { deep: true });
        const dep = mock.withDefaults<PartialDependency>()({
          enabled: false,
          count: 0,
          note: undefined,
          nested: { service: {} },
        });
        const runMock = bunMock().mockReturnValue("ok");

        dep.nested.service.run = runMock as typeof dep.nested.service.run;

        expect(dep.nested.service.run()).toBe("ok");
      });
    });
  });
});
