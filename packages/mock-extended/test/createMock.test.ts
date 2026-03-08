import { describe, expect, test } from "bun:test";

import { createMock } from "../src";

type TestMockFn = ((...args: unknown[]) => unknown) & {
  calls: unknown[][];
  mockImplementation: (impl: (...args: unknown[]) => unknown) => TestMockFn;
  mockReturnValue: (value: unknown) => TestMockFn;
  mockReset: () => TestMockFn;
};

const createTestMockFunction = (): TestMockFn => {
  let implementation: (...args: unknown[]) => unknown = () => undefined;

  const mockFn = ((...args: unknown[]) => {
    mockFn.calls.push(args);
    return implementation(...args);
  }) as TestMockFn;

  mockFn.calls = [];

  mockFn.mockImplementation = (impl) => {
    implementation = impl;
    return mockFn;
  };

  mockFn.mockReturnValue = (value) => {
    implementation = () => value;
    return mockFn;
  };

  mockFn.mockReset = () => {
    mockFn.calls = [];
    implementation = () => undefined;
    return mockFn;
  };

  return mockFn;
};

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

    dep.doWork.mockReturnValue(42);

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

    dep.doWork = createTestMockFunction().mockReturnValue(
      12,
    ) as typeof dep.doWork;

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
});
