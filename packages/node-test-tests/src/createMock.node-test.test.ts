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
    } as {
      nested: {
        run: () => number;
      };
    };

    const mock = createMock(createMockFn, { deep: true });
    const dep = mock<{ counter: Counter; plain: typeof plain }>({
      counter,
      plain,
    });

    const runMock = nodeMock.fn(() => 3);
    dep.plain.nested.run = runMock as unknown as typeof dep.plain.nested.run;

    assert.equal(dep.counter as unknown as Counter, counter);
    assert.equal((dep.counter as unknown as Counter).current(), 7);
    assert.notEqual(dep.plain, plain);
    assert.equal(dep.plain.nested.run(), 3);
    assert.equal(runMock.mock.calls.length, 1);
  });
});
