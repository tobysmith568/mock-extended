export interface CreateMockOptions {
  /**
   * A list of property names that should not be mocked. This is useful for properties that are commonly accessed but should not have mock behavior, such as `then` for promises.
   *
   * @default ["then"]
   */
  ignoredProps?: readonly string[];

  /**
   * When true, nested property access will also be mocked recursively.
   *
   * @default false
   */
  deep?: boolean;

  /**
   * When true (with `deep`), function properties can also expose deep mocked
   * nested members.
   *
   * @default false
   */
  funcPropSupport?: boolean;
}

const defaultIgnoredProps = ["then"] as const;

const defaultOptions: Required<CreateMockOptions> = {
  ignoredProps: defaultIgnoredProps,
  deep: false,
  funcPropSupport: false,
};

export const createOptions = (
  options: CreateMockOptions = {},
): Required<CreateMockOptions> => {
  return {
    ...defaultOptions,
    ...options,
  };
};
