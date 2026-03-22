import { createMockHandler } from "./createMockHandler";
import type { CreateMockOptions } from "./createOptions";
import { createOptions } from "./createOptions";
import { createProxifyValue } from "./createProxifyValue";
import { isPlainObject } from "./isPlainObject";
import type { ResolvedMockProxy } from "./mockProxyResolver";
import { preprocessTarget } from "./preprocessTarget";
import type { AnyFunction, MockFactory, PartialMockInput } from "./types";

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
    funcPropSupport: allOptions.funcPropSupport,
    isPlainObject,
    getHandler: () => handler,
  });

  handler = createMockHandler({
    ignoredProps,
    factory,
    deep: allOptions.deep,
    proxifyValue,
  });

  const createFromPartial = <T extends object>(
    partial: PartialMockInput<T>,
  ) => {
    const target = preprocessTarget(
      {
        ...(partial as Record<PropertyKey, unknown>),
      },
      allOptions.deep,
      proxifyValue,
    );

    return new Proxy(target, handler);
  };

  type BuildMock = {
    <T extends object>(): ResolvedMockProxy<T, TMockFn, TOptions, never>;
    withDefaults: <T extends object>() => <
      TProvided extends PartialMockInput<T>,
    >(
      partial: TProvided,
    ) => ResolvedMockProxy<T, TMockFn, TOptions, TProvided>;
  };

  const buildMock = (<T extends object>() =>
    createFromPartial<T>({} as PartialMockInput<T>) as ResolvedMockProxy<
      T,
      TMockFn,
      TOptions,
      never
    >) as BuildMock;

  buildMock.withDefaults =
    <T extends object>() =>
    <TProvided extends PartialMockInput<T>>(partial: TProvided) =>
      createFromPartial<T>(partial) as ResolvedMockProxy<
        T,
        TMockFn,
        TOptions,
        TProvided
      >;

  return buildMock;
};
