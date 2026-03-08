interface CreateProxifyValueParams {
  deep: boolean;
  isPlainObject: (value: unknown) => value is Record<PropertyKey, unknown>;
  getHandler: () => ProxyHandler<object>;
}

export const createProxifyValue = ({
  deep,
  isPlainObject,
  getHandler,
}: CreateProxifyValueParams) => {
  const proxyCache = new WeakMap<object, unknown>();

  return (value: unknown): unknown => {
    if (!deep) {
      return value;
    }

    if (typeof value === "function") {
      const cached = proxyCache.get(value);
      if (cached) {
        return cached;
      }

      const proxied = new Proxy(value as object, getHandler());
      proxyCache.set(value, proxied);
      proxyCache.set(proxied as object, proxied);
      return proxied;
    }

    if (isPlainObject(value)) {
      const cached = proxyCache.get(value);
      if (cached) {
        return cached;
      }

      const proxied = new Proxy(value, getHandler());
      proxyCache.set(value, proxied);
      proxyCache.set(proxied as object, proxied);
      return proxied;
    }

    return value;
  };
};
