import type { CreateMockOptions } from ".";
import { createOptions } from "./createOptions";
import type { AnyFunction, MockFactory, MockProxy } from "./types";

export const createMock = <TMockFn extends AnyFunction>(
  factory: MockFactory<TMockFn>,
  options: CreateMockOptions = {},
) => {
  const allOptions = createOptions(options);
  const ignoredProps = new Set(allOptions.ignoredProps);

  return <T extends object>(
    partial: Partial<MockProxy<T, TMockFn>> = {},
  ): MockProxy<T, TMockFn> => {
    const target = { ...partial } as Record<PropertyKey, unknown>;

    return new Proxy(target, {
      get(obj, prop, receiver) {
        if (typeof prop === "symbol") {
          return Reflect.get(obj, prop, receiver);
        }

        if (ignoredProps.has(prop)) {
          return undefined;
        }

        if (Reflect.has(obj, prop)) {
          return Reflect.get(obj, prop, receiver);
        }

        const fn = factory();
        Reflect.set(obj, prop, fn, receiver);
        return fn;
      },
    }) as MockProxy<T, TMockFn>;
  };
};
