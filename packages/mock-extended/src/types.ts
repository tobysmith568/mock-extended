export type AnyFunction = (...args: never[]) => unknown;

export type MockFactory<TMockFn extends AnyFunction> = () => TMockFn;

export type MethodMock<
  TMethod extends AnyFunction,
  TMockFn extends AnyFunction,
> = TMockFn & ((...args: Parameters<TMethod>) => ReturnType<TMethod>);

export type MockProxy<T, TMockFn extends AnyFunction> = {
  [K in keyof T]: T[K] extends AnyFunction ? MethodMock<T[K], TMockFn> : T[K];
};
