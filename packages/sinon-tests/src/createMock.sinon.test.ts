import { describe, expect, test } from "bun:test";
import { createMock } from "mock-extended";
import sinon from "sinon";

describe("mock-extended with Sinon", () => {
  type Dependency = {
    doWork: (arg: string) => number;
  };

  test("creates method stubs lazily from sinon.stub() factory", () => {
    const factory = sinon.spy(() => sinon.stub());
    const mock = createMock(factory);

    const dep = mock<Dependency>();

    expect(factory.callCount).toBe(0);

    const method = dep.doWork;

    expect(typeof method).toBe("function");
    expect(dep.doWork).toBe(method);
    expect(factory.callCount).toBe(1);
  });

  test("supports sinon stub returns", () => {
    const factory = sinon.spy(() => sinon.stub());
    const mock = createMock(factory);
    const dep = mock<Dependency>();

    dep.doWork.returns(42);

    expect(dep.doWork("abc")).toBe(42);
    expect(dep.doWork.calledOnce).toBe(true);
  });

  test("supports sinon calledWithExactly", () => {
    const factory = sinon.spy(() => sinon.stub());
    const mock = createMock(factory);
    const dep = mock<Dependency>();

    dep.doWork("abc");

    expect(dep.doWork.calledWithExactly("abc")).toBe(true);
  });

  test("exposes Sinon call metadata via getCalls", () => {
    const mock = createMock(() => sinon.stub());
    const dep = mock<Dependency>();

    dep.doWork("abc");
    dep.doWork("def");

    const args = dep.doWork.getCalls().map((call) => call.args);
    expect(args).toEqual([["abc"], ["def"]]);
  });

  test("ignores then by default", () => {
    const factory = sinon.spy(() => sinon.stub());
    const mock = createMock(factory);

    const dep = mock<{ then: () => void; doWork: () => void }>();

    expect(dep.then).toBeUndefined();

    dep.doWork;

    expect(factory.callCount).toBe(1);
  });

  test("supports deep recursive mocks", () => {
    const mock = createMock(() => sinon.stub(), {
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
    const runStub = sinon.stub().returns("ok");

    dep.nested.service.run = runStub as typeof dep.nested.service.run;

    expect(dep.nested.service.run("x")).toBe("ok");
    expect(runStub.calledWithExactly("x")).toBe(true);
    expect(dep.nested).toBe(dep.nested);
  });

  test("does not proxy class instances in deep mode", () => {
    class Counter {
      private readonly value: number;

      constructor(value: number) {
        this.value = value;
      }

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

    const mock = createMock(() => sinon.stub(), { deep: true });
    const dep = mock<{
      counter: Counter;
      plain: {
        nested: {
          run: () => number;
        };
      };
    }>({ counter, plain });
    const runStub = sinon.stub().returns(3);

    dep.plain.nested.run = runStub as typeof dep.plain.nested.run;

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
      const mock = createMock(() => sinon.stub(), { deep: true });
      const dep = mock<PartialDependency>({
        enabled: false,
        count: 0,
        note: undefined,
        nested: { service: {} },
      } as Partial<PartialDependency>);

      expect(dep.enabled).toBe(false);
      expect(dep.count).toBe(0);
      expect(dep.note).toBeUndefined();
    });

    test("lazy-mocks missing deep methods from partial input", () => {
      const mock = createMock(() => sinon.stub(), { deep: true });
      const dep = mock<PartialDependency>({
        enabled: false,
        count: 0,
        note: undefined,
        nested: { service: {} },
      } as Partial<PartialDependency>);
      const runStub = sinon.stub().returns("ok");

      dep.nested.service.run = runStub as typeof dep.nested.service.run;

      expect(dep.nested.service.run()).toBe("ok");
    });
  });
});
