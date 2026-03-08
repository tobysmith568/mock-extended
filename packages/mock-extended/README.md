# Mock-Extended

Mock TypeScript interfaces and classes with ease.

Requires **zero** dependencies on your testing framework, and works with any/all of them. Allowing you to move freely between different versions and whole frameworks without worrying about your mocks breaking.

Based on & inspired by:

- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
- [vitest-mock-extended](https://github.com/eratio08/vitest-mock-extended)

## Installation

```bash
npm install --save-dev mock-extended
```

## Usage

### Jest

```typescript
import { createMock } from "mock-extended";

const mock = createMock(() => jest.fn());

interface SomeDependency {
  someMethod: (arg: string) => number;
}

const mockedDependency = mock<SomeDependency>();

mockedDependency.someMethod.mockReturnValue(42);

const result = mockedDependency.someMethod("test");

expect(result).toBe(42);
expect(mockedDependency.someMethod).toHaveBeenCalledWith("test");
```

### Vitest

```typescript
import { createMock } from "mock-extended";

const mock = createMock(() => vi.fn());

interface SomeDependency {
  someMethod: (arg: string) => number;
}

const mockedDependency = mock<SomeDependency>();

mockedDependency.someMethod.mockReturnValue(42);

const result = mockedDependency.someMethod("test");

expect(result).toBe(42);
expect(mockedDependency.someMethod).toHaveBeenCalledWith("test");
```

## Notes

- `createMock()` only needs a factory function. It does not depend on Jest, Vitest, or any assertion library directly.
- The behavior of each generated method mock comes from your factory implementation.
- If you want fallback behavior for unconfigured calls, configure it in your factory (for example, in `() => jest.fn(...)` or `() => vi.fn(...)`).
- `then` is ignored by default to avoid accidental Promise/thenable behavior.
