export const preprocessTarget = (
  partial: Record<PropertyKey, unknown>,
  deep: boolean,
  proxifyValue: (value: unknown) => unknown,
): Record<PropertyKey, unknown> => {
  if (!deep) {
    return partial;
  }

  for (const key of Reflect.ownKeys(partial)) {
    partial[key] = proxifyValue(partial[key]);
  }

  return partial;
};
