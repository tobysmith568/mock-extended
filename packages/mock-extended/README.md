# mock-extended

Framework-agnostic TypeScript mocks for interfaces and classes.

`mock-extended` is not coupled to a specific test runner. You provide a mock function factory (for example `jest.fn` or `vi.fn`), and `mock-extended` handles lazy property-based mock creation with strong types.

## Why use it?

- No hard dependency on Jest/Vitest/Bun/etc.
- Lazy mock creation per accessed method.
- Fully typed method mocks from your factory function.
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
import { describe, expect, it, mock } from "bun:test";
import { createMock } from "mock-extended";

type User = { id: string };
interface UserRepo {
  findById: (id: string) => User | null;
}

const create = createMock(() => mock());

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = create<UserRepo>();

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

const create = createMock(() => sinon.stub());

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = create<UserRepo>();

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
import { describe, it, mock } from "node:test";
import { createMock } from "mock-extended";

type User = { id: string };
interface UserRepo {
  findById: (id: string) => User | null;
}

const createNodeMock = () => mock.fn((..._args: any[]): any => undefined);
const create = createMock(createNodeMock);

describe("UserService", () => {
  it("returns a user by id", () => {
    const repo = create<UserRepo>();

    const findByIdMock = mock.fn(() => ({ id: "123" }));
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
- returns: `<T>(partial?: Partial<T>) => MockProxy<T, TMockFn>` (or deep variants depending on options)

#### Options

| Option            | Type                | Default    | Description                                                            |
| ----------------- | ------------------- | ---------- | ---------------------------------------------------------------------- |
| `ignoredProps`    | `readonly string[]` | `['then']` | Property names that should not be mocked lazily.                       |
| `deep`            | `boolean`           | `false`    | Enables deep recursive mocking for nested plain objects.               |
| `funcPropSupport` | `boolean`           | `false`    | With `deep`, allows function properties to expose deep mocked members. |

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

const create = createMock(() => vi.fn(), { deep: true });
const service = create<Service>();

service.nested.client.run.mockReturnValue("ok");

expect(service.nested.client.run("123")).toBe("ok");
```

## Promises

- `then` is ignored by default to avoid promise-like behaviour traps. You can allow `then` to be mocked by setting `ignoredProps: []`.
