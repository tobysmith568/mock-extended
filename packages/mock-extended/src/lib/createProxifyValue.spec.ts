import { describe, expect, test } from "bun:test";
import { createProxifyValue } from "./createProxifyValue";
import { isPlainObject } from "./isPlainObject";

describe("createProxifyValue", () => {
  test("passes through values when deep is disabled", () => {
    const proxifyValue = createProxifyValue({
      deep: false,
      funcPropSupport: false,
      isPlainObject,
      getHandler: () => ({}),
    });

    const input = { a: 1 };

    expect(proxifyValue(input)).toBe(input);
  });

  test("proxies and caches plain objects when deep is enabled", () => {
    const handler = {} as ProxyHandler<object>;
    const proxifyValue = createProxifyValue({
      deep: true,
      funcPropSupport: false,
      isPlainObject,
      getHandler: () => handler,
    });

    const obj = { a: 1 };

    const proxiedObjFirst = proxifyValue(obj);
    const proxiedObjSecond = proxifyValue(obj);
    const rewrappedObj = proxifyValue(proxiedObjFirst);

    expect(proxiedObjFirst).toBe(proxiedObjSecond);
    expect(proxiedObjFirst).toBe(rewrappedObj);
    expect(proxiedObjFirst).not.toBe(obj);
  });

  test("proxies and caches functions when funcPropSupport is enabled", () => {
    const handler = {} as ProxyHandler<object>;
    const proxifyValue = createProxifyValue({
      deep: true,
      funcPropSupport: true,
      isPlainObject,
      getHandler: () => handler,
    });

    const fn = () => 1;

    const proxiedFnFirst = proxifyValue(fn);
    const proxiedFnSecond = proxifyValue(fn);
    const rewrappedFn = proxifyValue(proxiedFnFirst);

    expect(proxiedFnFirst).toBe(proxiedFnSecond);
    expect(proxiedFnFirst).toBe(rewrappedFn);
    expect(proxiedFnFirst).not.toBe(fn);
  });

  test("does not proxy class or built-in instances", () => {
    class Counter {
      readonly value = 1;
    }

    const proxifyValue = createProxifyValue({
      deep: true,
      funcPropSupport: true,
      isPlainObject,
      getHandler: () => ({}),
    });

    const date = new Date();
    const map = new Map<string, number>();
    const counter = new Counter();

    expect(proxifyValue(date)).toBe(date);
    expect(proxifyValue(map)).toBe(map);
    expect(proxifyValue(counter)).toBe(counter);
  });
});
