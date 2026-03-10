import { createMock } from "mock-extended";

describe("mock-extended with Vitest", () => {
  type Dependency = {
    doWork: (arg: string) => number;
  };

  test("creates method mocks lazily from vi.fn() factory", () => {
    const factory = vi.fn(() => vi.fn());
    const mock = createMock(factory);

    const dep = mock<Dependency>();

    expect(factory).toHaveBeenCalledTimes(0);

    const method = dep.doWork;

    expect(typeof method).toBe("function");
    expect(dep.doWork).toBe(method);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  test("supports mockReturnValue on generated vi.fn() methods", () => {
    const factory = vi.fn(() => vi.fn());
    const mock = createMock(factory);
    const dep = mock<Dependency>();

    dep.doWork.mockReturnValue(42);

    expect(dep.doWork("abc")).toBe(42);
    expect(dep.doWork).toHaveBeenCalledTimes(1);
  });

  test("supports Vitest-specific matcher toHaveBeenCalledOnce", () => {
    const mock = createMock(() => vi.fn());
    const dep = mock<Dependency>();

    dep.doWork("abc");

    expect(dep.doWork).toHaveBeenCalledOnce();
  });

  test("exposes Vitest call metadata via mock.calls", () => {
    const mock = createMock(() => vi.fn());
    const dep = mock<Dependency>();

    dep.doWork("abc");
    dep.doWork("def");

    expect(dep.doWork).toHaveBeenNthCalledWith(1, "abc");
    expect(dep.doWork).toHaveBeenNthCalledWith(2, "def");
    expect(dep.doWork.mock.calls).toEqual([["abc"], ["def"]]);
  });

  test("ignores then by default", () => {
    const factory = vi.fn(() => vi.fn());
    const mock = createMock(factory);

    const dep = mock<{ then: () => void; doWork: () => void }>();

    expect(dep.then).toBeUndefined();

    dep.doWork;

    expect(factory).toHaveBeenCalledTimes(1);
  });

  test("supports deep recursive mocks", () => {
    const mock = createMock(() => vi.fn(), {
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

    dep.nested.service.run.mockReturnValue("ok");

    expect(dep.nested.service.run("x")).toBe("ok");
    expect(dep.nested.service.run).toHaveBeenCalledWith("x");
    expect(dep.nested).toBe(dep.nested);
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
    } as {
      nested: {
        run: () => number;
      };
    };

    const mock = createMock(() => vi.fn(), { deep: true });
    const dep = mock<{
      counter: Counter;
      plain: {
        nested: {
          run: () => number;
        };
      };
    }>({ counter, plain });

    dep.plain.nested.run.mockReturnValue(3);

    expect(dep.counter).toBe(counter);
    expect(dep.counter.current()).toBe(7);
    expect(dep.plain).not.toBe(plain);
    expect(dep.plain.nested.run()).toBe(3);
  });
});
