export type AnyFunction = (...args: never[]) => unknown;

export type MockFactory<TMockFn extends AnyFunction> = () => TMockFn;

export type MethodMock<
  TMethod extends AnyFunction,
  TMockFn extends AnyFunction,
> = TMethod & TMockFn;

export type MockProxy<T, TMockFn extends AnyFunction> = {
  [K in keyof T]: T[K] extends AnyFunction ? MethodMock<T[K], TMockFn> : T[K];
};

export type DeepMockProxy<
  T,
  TMockFn extends AnyFunction,
> = T extends AnyFunction
  ? MethodMock<T, TMockFn>
  : T extends object
    ? {
        [K in keyof T]: T[K] extends AnyFunction
          ? MethodMock<T[K], TMockFn>
          : DeepMockProxy<T[K], TMockFn>;
      } & T
    : T;

type _DeepMockProxyWithFuncPropSupport<T, TMockFn extends AnyFunction> = {
  [K in keyof T]: T[K] extends AnyFunction
    ? MethodMock<T[K], TMockFn> &
        DeepMockProxyWithFuncPropSupport<T[K], TMockFn>
    : DeepMockProxyWithFuncPropSupport<T[K], TMockFn>;
};

export type DeepMockProxyWithFuncPropSupport<
  T,
  TMockFn extends AnyFunction,
> = T extends AnyFunction
  ? MethodMock<T, TMockFn> & _DeepMockProxyWithFuncPropSupport<T, TMockFn>
  : T extends object
    ? _DeepMockProxyWithFuncPropSupport<T, TMockFn> & T
    : T;
