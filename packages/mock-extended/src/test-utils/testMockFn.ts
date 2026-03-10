// This file contains our own simple mock function, mimicking some of the
// features of popular libraries. This should not be relied on for testing the
// library itself, but is useful for testing the integration of mock functions
// with the createMock utility.

export type TestMockFn = ((...args: unknown[]) => unknown) & {
  calls: unknown[][];
  setImplementation: (impl: (...args: unknown[]) => unknown) => void;
  setReturnValue: (value: unknown) => void;
  reset: () => void;
};

export const createTestMockFunction = (): TestMockFn => {
  let implementation: (...args: unknown[]) => unknown = () => undefined;

  const mockFn = ((...args: unknown[]) => {
    mockFn.calls.push(args);
    return implementation(...args);
  }) as TestMockFn;

  mockFn.calls = [];

  mockFn.setImplementation = (impl) => {
    implementation = impl;
  };

  mockFn.setReturnValue = (value) => {
    implementation = () => value;
  };

  mockFn.reset = () => {
    mockFn.calls = [];
    implementation = () => undefined;
  };

  return mockFn;
};
