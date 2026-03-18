import type { AnyFunction, MockFactory } from "./types";

interface CreateMockHandlerParams<TMockFn extends AnyFunction> {
  ignoredProps: Set<string>;
  factory: MockFactory<TMockFn>;
  deep: boolean;
  proxifyValue: (value: unknown) => unknown;
}

export const createMockHandler = <TMockFn extends AnyFunction>({
  ignoredProps,
  factory,
  deep,
  proxifyValue,
}: CreateMockHandlerParams<TMockFn>): ProxyHandler<object> => {
  return {
    get(obj, prop, receiver) {
      if (typeof prop === "symbol") {
        return Reflect.get(obj, prop, receiver);
      }

      if (Reflect.has(obj, prop)) {
        const existing = Reflect.get(obj, prop, receiver);

        // ECMAScript Proxy invariant: own non-configurable, non-writable data
        // properties must be returned as their exact stored value.
        if (hasImmutableOwnDataProperty(obj, prop)) {
          return existing;
        }

        const proxied = proxifyValue(existing);

        if (proxied !== existing) {
          Reflect.set(obj, prop, proxied, receiver);
        }

        return proxied;
      }

      if (ignoredProps.has(prop)) {
        return undefined;
      }

      const fn = factory();
      const value = deep ? proxifyValue(fn) : fn;
      Reflect.set(obj, prop, value, receiver);
      return value;
    },
    set(obj, prop, value, receiver) {
      return Reflect.set(obj, prop, proxifyValue(value), receiver);
    },
  };
};

const hasImmutableOwnDataProperty = (obj: object, prop: string): boolean => {
  const ownDescriptor = Reflect.getOwnPropertyDescriptor(obj, prop);

  return !!(
    ownDescriptor &&
    !ownDescriptor.configurable &&
    "value" in ownDescriptor &&
    !ownDescriptor.writable
  );
};
