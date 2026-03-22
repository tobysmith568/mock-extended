import assert from "node:assert/strict";
import { describe, it, mock as nodeMock } from "node:test";
import { createMock } from "mock-extended";

describe("mock-extended with node:test mock.fn", () => {
  type Dependency = {
    doWork: (arg: string) => number;
  };

  const createMockFn = () =>
    nodeMock.fn((..._args: unknown[]): unknown => undefined);

  it("creates method mocks lazily from mock.fn() factory", () => {
    const factory = nodeMock.fn(() => createMockFn());
    const mock = createMock(factory);

    const dep = mock<Dependency>();

    assert.equal(factory.mock.calls.length, 0);

    const method = dep.doWork;

    assert.equal(typeof method, "function");
    assert.equal(dep.doWork, method);
    assert.equal(factory.mock.calls.length, 1);
  });

  it("supports configurable return values on generated methods", () => {
    const mock = createMock(createMockFn);
    const dep = mock<Dependency>();

    const doWorkMock = nodeMock.fn(() => 42);
    dep.doWork = doWorkMock as unknown as typeof dep.doWork;

    assert.equal(dep.doWork("abc"), 42);
    assert.equal(doWorkMock.mock.calls.length, 1);
  });

  it("exposes node:test mock call metadata", () => {
    const mock = createMock(createMockFn);
    const dep = mock<Dependency>();

    dep.doWork("abc");
    dep.doWork("def");

    const args = dep.doWork.mock.calls.map((call) => call.arguments);
    assert.deepEqual(args, [["abc"], ["def"]]);
  });

  it("ignores then by default", () => {
    const factory = nodeMock.fn(() => createMockFn());
    const mock = createMock(factory);

    const dep = mock<{ then: () => void; doWork: () => void }>();

    assert.equal(dep.then, undefined);

    dep.doWork;

    assert.equal(factory.mock.calls.length, 1);
  });

  it("supports deep recursive mocks", () => {
    const mock = createMock(createMockFn, {
      deep: true,
      funcPropSupport: true,
    });

    const dep = mock<{
      nested: {
        service: {
          run: (arg: string) => string;
        };
      };
    }>();
    const runMock = nodeMock.fn(() => "ok");
    dep.nested.service.run =
      runMock as unknown as typeof dep.nested.service.run;

    assert.equal(dep.nested.service.run("x"), "ok");
    assert.equal(dep.nested, dep.nested);
    assert.equal(runMock.mock.calls.length, 1);
    assert.deepEqual(runMock.mock.calls[0]?.arguments, ["x"]);
  });

  describe("withDefaults", () => {
    it("keeps provided method defaults as plain function types", () => {
      const mock = createMock(createMockFn);
      const dep = mock.withDefaults<Dependency>()({
        doWork: (_arg: string) => 123,
      });

      assert.equal(dep.doWork("abc"), 123);

      const __typecheckOnly = () => {
        // @ts-expect-error Provided function defaults should not expose node:test mock metadata.
        dep.doWork.mock.calls;
      };
      void __typecheckOnly;
    });

    it("does not proxy class instances in deep mode", () => {
      class Counter {
        #value: number;

        constructor(value: number) {
          this.#value = value;
        }

        current() {
          return this.#value;
        }
      }

      const counter = new Counter(7);
      const plain = {
        nested: {},
      };

      const mock = createMock(createMockFn, { deep: true });
      const dep = mock.withDefaults<{
        counter: Counter;
        plain: {
          nested: {
            run: () => number;
          };
        };
      }>()({ counter, plain });

      const runMock = nodeMock.fn(() => 3);
      dep.plain.nested.run = runMock as unknown as typeof dep.plain.nested.run;

      assert.equal(dep.counter as unknown as Counter, counter);
      assert.equal((dep.counter as unknown as Counter).current(), 7);
      assert.notEqual(dep.plain, plain);
      assert.equal(dep.plain.nested.run(), 3);
      assert.equal(runMock.mock.calls.length, 1);
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

      it("preserves explicit partial values", () => {
        const mock = createMock(createMockFn, { deep: true });
        const dep = mock.withDefaults<PartialDependency>()({
          enabled: false,
          count: 0,
          note: undefined,
          nested: { service: {} },
        });

        assert.equal(dep.enabled, false);
        assert.equal(dep.count, 0);
        assert.equal(dep.note, undefined);
      });

      it("lazy-mocks missing deep methods from partial input", () => {
        const mock = createMock(createMockFn, { deep: true });
        const dep = mock.withDefaults<PartialDependency>()({
          enabled: false,
          count: 0,
          note: undefined,
          nested: { service: {} },
        });
        const runMock = nodeMock.fn(() => "ok");

        dep.nested.service.run =
          runMock as unknown as typeof dep.nested.service.run;

        assert.equal(dep.nested.service.run(), "ok");
      });
    });
  });
});
