export function filterUndefined<T>(value: T): value is NonNullable<T> {
  return value != undefined;
}
