export const getFieldValue = <T>(
  getterOrKey: keyof T | ((row: T) => T[keyof T]),
  object: T,
) =>
  typeof getterOrKey === "function" ? getterOrKey(object) : object[getterOrKey];
