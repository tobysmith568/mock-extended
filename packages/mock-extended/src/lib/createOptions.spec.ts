import { describe, expect, test } from "bun:test";
import { createOptions } from "./createOptions";

describe("createOptions", () => {
  test("returns defaults when no options are provided", () => {
    const options = createOptions();

    expect(options).toEqual({
      ignoredProps: ["then"],
      deep: false,
      funcPropSupport: false,
    });
  });

  test("merges provided options over defaults", () => {
    const options = createOptions({
      deep: true,
      funcPropSupport: true,
      ignoredProps: ["then", "custom"],
    });

    expect(options).toEqual({
      ignoredProps: ["then", "custom"],
      deep: true,
      funcPropSupport: true,
    });
  });

  test("keeps unspecified options at default values", () => {
    const options = createOptions({ deep: true });

    expect(options).toEqual({
      ignoredProps: ["then"],
      deep: true,
      funcPropSupport: false,
    });
  });
});
