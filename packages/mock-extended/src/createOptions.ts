export interface CreateMockOptions {
  /**
   * A list of property names that should not be mocked. This is useful for properties that are commonly accessed but should not have mock behavior, such as `then` for promises.
   *
   * @default ["then"]
   */
  ignoredProps?: readonly string[];
}

const defaultIgnoredProps = ["then"] as const;

const defaultOptions: Required<CreateMockOptions> = {
  ignoredProps: defaultIgnoredProps,
};

export const createOptions = (
  options: CreateMockOptions = {},
): Required<CreateMockOptions> => {
  return {
    ...defaultOptions,
    ...options,
  };
};
