import { createMockHandler } from "./createMockHandler";
import type { CreateMockOptions } from "./createOptions";
import { createOptions } from "./createOptions";
import { createProxifyValue } from "./createProxifyValue";
import { isPlainObject } from "./isPlainObject";
import type { ResolvedMockProxy } from "./mockProxyResolver";
import { preprocessTarget } from "./preprocessTarget";
import type { AnyFunction, MockFactory } from "./types";

export const createMock = <
  TMockFn extends AnyFunction,
  TOptions extends CreateMockOptions = CreateMockOptions,
>(
  factory: MockFactory<TMockFn>,
  options: TOptions = {} as TOptions,
) => {
  const allOptions = createOptions(options);
  const ignoredProps = new Set(allOptions.ignoredProps);
  let handler: ProxyHandler<object>;

  const proxifyValue = createProxifyValue({
    deep: allOptions.deep,
    isPlainObject,
    getHandler: () => handler,
  });

  handler = createMockHandler({
    ignoredProps,
    factory,
    deep: allOptions.deep,
    proxifyValue,
  });

  return <T extends object>(
    partial: Partial<T> = {},
  ): ResolvedMockProxy<T, TMockFn, TOptions> => {
    const target = preprocessTarget(
      {
        ...(partial as Record<PropertyKey, unknown>),
      },
      allOptions.deep,
      proxifyValue,
    );

    return new Proxy(target, handler) as ResolvedMockProxy<
      T,
      TMockFn,
      TOptions
    >;
  };
};
