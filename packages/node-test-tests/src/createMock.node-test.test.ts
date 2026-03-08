import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { createMock } from "mock-extended";

describe("mock-extended with node:test mock.fn", () => {
  type Dependency = {
    doWork: (arg: string) => number;
  };

  const createMockFn = () => mock.fn((..._args: any[]): any => undefined);

  it("creates method mocks lazily from mock.fn() factory", () => {
    const factory = mock.fn(() => createMockFn());
    const create = createMock(factory);

    const dep = create<Dependency>();

    assert.equal(factory.mock.calls.length, 0);

    const method = dep.doWork;

    assert.equal(typeof method, "function");
    assert.equal(dep.doWork, method);
    assert.equal(factory.mock.calls.length, 1);
  });

  it("supports configurable return values on generated methods", () => {
    const create = createMock(createMockFn);
    const dep = create<Dependency>();

    const doWorkMock = mock.fn(() => 42);
    dep.doWork = doWorkMock as unknown as typeof dep.doWork;

    assert.equal(dep.doWork("abc"), 42);
    assert.equal(doWorkMock.mock.calls.length, 1);
  });

  it("exposes node:test mock call metadata", () => {
    const create = createMock(createMockFn);
    const dep = create<Dependency>();

    dep.doWork("abc");
    dep.doWork("def");

    const args = dep.doWork.mock.calls.map((call) => call.arguments);
    assert.deepEqual(args, [["abc"], ["def"]]);
  });

  it("ignores then by default", () => {
    const factory = mock.fn(() => createMockFn());
    const create = createMock(factory);

    const dep = create<{ then: () => void; doWork: () => void }>();

    assert.equal(dep.then, undefined);

    dep.doWork;

    assert.equal(factory.mock.calls.length, 1);
  });

  it("supports deep recursive mocks", () => {
    const create = createMock(createMockFn, { deep: true });

    const dep = create<{
      nested: {
        service: {
          run: (arg: string) => string;
        };
      };
    }>();
    const runMock = mock.fn(() => "ok");
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

    const create = createMock(createMockFn, { deep: true });
    const dep = create<{ counter: Counter; plain: typeof plain }>({
      counter,
      plain,
    });

    const runMock = mock.fn(() => 3);
    dep.plain.nested.run = runMock as unknown as typeof dep.plain.nested.run;

    assert.equal(dep.counter as unknown as Counter, counter);
    assert.equal((dep.counter as unknown as Counter).current(), 7);
    assert.notEqual(dep.plain, plain);
    assert.equal(dep.plain.nested.run(), 3);
    assert.equal(runMock.mock.calls.length, 1);
  });
});
