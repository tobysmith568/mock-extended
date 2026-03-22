<p align="center">
  <img src="https://raw.githubusercontent.com/tobysmith568/mock-extended/main/assets/mock_extended_banner.svg" alt="mock-extended banner" width="820" />
</p>

<p align="center">
  Framework-agnostic TypeScript mocks for interfaces and classes.
</p>

<p align="center">
  <code>mock-extended</code> is not coupled to a specific test runner. You provide a mock function factory (for example <code>jest.fn</code> or <code>vi.fn</code>), and <code>mock-extended</code> handles lazy property-based mock creation with strong types.
</p>

## Why use it?

- No hard dependency on Jest/Vitest/Bun/etc.
- Lazy mock creation per accessed method.
- Fully typed method mocks from your factory function.
- Optional partial input for fixed values plus lazy mocks.
- Optional deep recursive mocking for nested objects.

Inspired by:

- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)
- [vitest-mock-extended](https://github.com/eratio08/vitest-mock-extended)

## Installation

```bash
npm install --save-dev mock-extended
```

## Usage examples

### Jest

```ts
import { createMock } from "mock-extended";

type User = { id: string };
interface UserRepo {
  findById: (id: string) => User | null;
}

const mock = createMock(() => jest.fn());

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = mock<UserRepo>();

    repo.findById.mockReturnValue({ id: "123" });

    expect(repo.findById("123")).toEqual({ id: "123" });
    expect(repo.findById).toHaveBeenCalledWith("123");
  });
});
```

<details>
<summary>Vitest</summary>

```ts
import { createMock } from "mock-extended";
import { describe, expect, it, vi } from "vitest";

type User = { id: string };
interface UserRepo {
  findById: (id: string) => User | null;
}

const mock = createMock(() => vi.fn());

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = mock<UserRepo>();

    repo.findById.mockReturnValue({ id: "123" });

    expect(repo.findById("123")).toEqual({ id: "123" });
    expect(repo.findById).toHaveBeenCalledWith("123");
  });
});
```

</details>

<details>
<summary>Bun</summary>

```ts
import { describe, expect, it, mock as bunMock } from "bun:test";
import { createMock } from "mock-extended";

type User = { id: string };
interface UserRepo {
  findById: (id: string) => User | null;
}

const mock = createMock(() => bunMock());

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = mock<UserRepo>();

    repo.findById.mockReturnValue({ id: "123" });

    expect(repo.findById("123")).toEqual({ id: "123" });
    expect(repo.findById).toHaveBeenCalledWith("123");
  });
});
```

</details>

<details>
<summary>Sinon</summary>

```ts
import { describe, expect, it } from "bun:test";
import sinon from "sinon";
import { createMock } from "mock-extended";

type User = { id: string };
interface UserRepo {
  findById: (id: string) => User | null;
}

const mock = createMock(() => sinon.stub());

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = mock<UserRepo>();

    repo.findById.returns({ id: "123" });

    expect(repo.findById("123")).toEqual({ id: "123" });
    expect(repo.findById.calledWithExactly("123")).toBe(true);
  });
});
```

</details>

<details>
<summary>Node test runner (node:test)</summary>

```ts
import assert from "node:assert/strict";
import { describe, it, mock as nodeMock } from "node:test";
import { createMock } from "mock-extended";

type User = { id: string };
interface UserRepo {
  findById: (id: string) => User | null;
}

const createNodeMock = () => nodeMock.fn((..._args: any[]): any => undefined);
const mock = createMock(createNodeMock);

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = mock<UserRepo>();

    const findByIdMock = nodeMock.fn(() => ({ id: "123" }));
    repo.findById = findByIdMock as unknown as typeof repo.findById;

    assert.deepEqual(repo.findById("123"), { id: "123" });
    assert.equal(findByIdMock.mock.calls.length, 1);
  });
});
```

</details>

## API

### `createMock(factory, options?)`

Creates a typed mock builder.

- `factory`: `() => TMockFn`
- returns:
  - `<T>() => MockProxy<T, TMockFn>` for fully lazy mocks
  - `withDefaults<T>()(partial)` for partial initialization with provided-value-aware typing (or deep variants depending on options)

#### Options

| Option            | Type                | Default    | Description                                                            |
| ----------------- | ------------------- | ---------- | ---------------------------------------------------------------------- |
| `ignoredProps`    | `readonly string[]` | `['then']` | Property names that should not be mocked lazily.                       |
| `deep`            | `boolean`           | `false`    | Enables deep recursive mocking for nested plain objects.               |
| `funcPropSupport` | `boolean`           | `false`    | With `deep`, allows function properties to expose deep mocked members. |

## Partial input

Use `withDefaults` to seed known values while leaving missing methods lazily
mocked.

```ts
interface ConfigRepo {
  enabled: boolean;
  tag?: string;
  load: () => string;
}

const mock = createMock(() => jest.fn());
const repo = mock.withDefaults<ConfigRepo>()({
  enabled: false,
  tag: undefined,
});

repo.load.mockReturnValue("ok");

expect(repo.enabled).toBe(false);
expect(repo.tag).toBeUndefined();
expect(repo.load()).toBe("ok");
```

### Preserve provided function default types

`withDefaults` preserves explicitly provided function defaults as their own
function type instead of exposing them as `MethodMock`:

```ts
interface ConfigRepo {
  enabled: boolean;
  load: (id: string) => string;
}

const mock = createMock(() => jest.fn());

const repo = mock.withDefaults<ConfigRepo>()({
  enabled: false,
  load: (_id: string) => "ready",
});

// Works
expect(repo.load("123")).toBe("ready");

// Type error: `load` is a provided function, not a generated mock function
// repo.load.mockReturnValue("next");
```

## Deep mocks

```ts
import { createMock } from "mock-extended";

interface Service {
  nested: {
    client: {
      run: (id: string) => string;
    };
  };
}

const mock = createMock(() => jest.fn(), {
  deep: true,
  funcPropSupport: true,
});
const service = mock<Service>();

service.nested.client.run.mockReturnValue("ok");

expect(service.nested.client.run("123")).toBe("ok");
```

The `deep` option in combination with `funcPropSupport` will also mock out some internals set by some mocking libraries (for example the `calls` array on Jest mocks). This can be useful for testing, but it also means you can't access those internals on deep mocked functions.
To avoid this, you can specify properties to ignore with the `ignoredProps` option.

```ts
const mock = createMock(() => jest.fn(), {
  deep: true,
  funcPropSupport: true,
  ignoredProps: ["calls"],
});

const service = mock<Service>();

service.nested.client.run("123");

// Not mocked, so this is the real calls array
const calls = service.nested.client.run.mock.calls;
expect(calls).toEqual([["123"]]);
```

## Promises

- `then` is ignored by default to avoid promise-like behaviour traps. You can allow `then` to be mocked by setting `ignoredProps: []`.
