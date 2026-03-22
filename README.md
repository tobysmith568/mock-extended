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
- Optional deep recursive mocking for nested objects.

## Monorepo

This is a monorepo. See [./packages/mock-extended/README.md](./packages/mock-extended/README.md) for the full readme for the published package.

## Repo Structure

- `apps/` — application projects (e.g. website)
- `packages/` — reusable/publishable packages

## Getting started

This repo uses the Bun package manager and runtime. See [https://bun.sh](https://bun.sh) for installation instructions. (Some tests also require Node.JS).

Install dependencies:

```bash
bun install
```

Run quality checks:

```bash
bun run lint
bun run typecheck
```

Run tests:

```bash
bun run test
```

Run build where available:

```bash
bun run build
```

Run spec typechecks where defined:

```bash
bun run typecheck:test
```

### Turbo filters

This monorepo uses TurboRepo.

Run tasks only for a single package:

```bash
bunx turbo run test --filter=mock-extended
```

Run tasks for all packages in apps (future website, etc.):

```bash
bunx turbo run dev --filter=./apps/*
```
