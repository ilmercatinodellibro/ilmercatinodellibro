export const getFieldValue = <T>(
  // Quasar types the column field as optional, QTable reads row[undefined] when it's missing
  getterOrKey: keyof T | ((row: T) => T[keyof T]) | undefined,
  object: T,
) => {
  if (getterOrKey === undefined) {
    return;
  }

  return typeof getterOrKey === "function"
    ? getterOrKey(object)
    : object[getterOrKey];
};

// To be imported into table components that use the #body slot
export function getColValue(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cols: { name: string; value: any }[],
  colName: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-return
  return cols.find(({ name }) => name === colName)!.value;
}
