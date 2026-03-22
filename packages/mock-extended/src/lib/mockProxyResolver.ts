import type { CreateMockOptions } from "./createOptions";
import type {
  AnyFunction,
  DeepMockProxy,
  DeepMockProxyWithFuncPropSupport,
  MockProxy,
  PartialMockInput,
} from "./types";

export type ResolvedMockProxy<
  T,
  TMockFn extends AnyFunction,
  TOptions extends CreateMockOptions,
  TProvided extends PartialMockInput<T> = never,
> = TOptions["deep"] extends true
  ? TOptions["funcPropSupport"] extends true
    ? DeepMockProxyWithFuncPropSupport<T, TMockFn, TProvided>
    : DeepMockProxy<T, TMockFn, TProvided>
  : MockProxy<T, TMockFn, TProvided>;
