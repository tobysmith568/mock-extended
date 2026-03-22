export type AnyFunction = (...args: never[]) => unknown;

export type MockFactory<TMockFn extends AnyFunction> = () => TMockFn;

export type MethodMock<
  TMethod extends AnyFunction,
  TMockFn extends AnyFunction,
> = TMethod & TMockFn;

export type PartialMockInput<T> = T extends AnyFunction
  ? ((...args: Parameters<T>) => ReturnType<T>) & {
      [K in keyof T]?: PartialMockInput<T[K]>;
    }
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [K in keyof T]?: PartialMockInput<T[K]> }
      : T;

type RequiredKeys<T> = {
  [K in keyof T]-?: Pick<T, K> extends Required<Pick<T, K>> ? K : never;
}[keyof T];

type HasProvidedValue<TProvided, K extends PropertyKey> =
  K extends RequiredKeys<TProvided> ? true : false;

type ProvidedValue<TProvided, K extends PropertyKey> = K extends keyof TProvided
  ? TProvided[K]
  : never;

export type MockProxy<
  T,
  TMockFn extends AnyFunction,
  TProvided extends PartialMockInput<T> = never,
> = {
  [K in keyof T]: HasProvidedValue<TProvided, K> extends true
    ? ProvidedValue<TProvided, K>
    : T[K] extends AnyFunction
      ? MethodMock<T[K], TMockFn>
      : T[K];
};

export type DeepMockProxy<
  T,
  TMockFn extends AnyFunction,
  TProvided = never,
> = T extends AnyFunction
  ? [TProvided] extends [never]
    ? MethodMock<T, TMockFn>
    : TProvided
  : T extends object
    ? {
        [K in keyof T]: HasProvidedValue<TProvided, K> extends true
          ? DeepMockProxy<T[K], TMockFn, ProvidedValue<TProvided, K>>
          : DeepMockProxy<T[K], TMockFn>;
      } & T
    : T;

type _DeepMockProxyWithFuncPropSupport<
  T,
  TMockFn extends AnyFunction,
  TProvided = never,
> = {
  [K in keyof T]: HasProvidedValue<TProvided, K> extends true
    ? DeepMockProxyWithFuncPropSupport<
        T[K],
        TMockFn,
        ProvidedValue<TProvided, K>
      >
    : T[K] extends AnyFunction
      ? MethodMock<T[K], TMockFn> &
          DeepMockProxyWithFuncPropSupport<T[K], TMockFn>
      : DeepMockProxyWithFuncPropSupport<T[K], TMockFn>;
};

export type DeepMockProxyWithFuncPropSupport<
  T,
  TMockFn extends AnyFunction,
  TProvided = never,
> = T extends AnyFunction
  ? [TProvided] extends [never]
    ? MethodMock<T, TMockFn> & _DeepMockProxyWithFuncPropSupport<T, TMockFn>
    : TProvided & _DeepMockProxyWithFuncPropSupport<T, TMockFn, TProvided>
  : T extends object
    ? _DeepMockProxyWithFuncPropSupport<T, TMockFn, TProvided> & T
    : T;
