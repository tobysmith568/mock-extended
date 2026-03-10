import type { CreateMockOptions } from "./createOptions";
import type {
  AnyFunction,
  DeepMockProxy,
  DeepMockProxyWithFuncPropSupport,
  MockProxy,
} from "./types";

export type ResolvedMockProxy<
  T,
  TMockFn extends AnyFunction,
  TOptions extends CreateMockOptions,
> = TOptions["deep"] extends true
  ? TOptions["funcPropSupport"] extends true
    ? DeepMockProxyWithFuncPropSupport<T, TMockFn>
    : DeepMockProxy<T, TMockFn>
  : MockProxy<T, TMockFn>;
