export class AssertIsDefinedError extends Error {
  constructor() {
    super();
  }
}

/**
 * Throws an AssertIsDefinedError if the given value is undefined or null.
 *
 * @param value The value to check.
 * @throws {AssertIsDefinedError} If the value is undefined or null.
 */
export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value == undefined) throw new AssertIsDefinedError();
}

/**
 * Ensure a value is defined.
 * If the value is undefined or null, an AssertIsDefinedError will be thrown.
 *
 * @param value The value to check and return.
 * @returns {NonNullable<T>} The provided value if it is not undefined or null.
 * @throws {AssertIsDefinedError} If the value is undefined or null.
 */
export function assertUnlessDefined<T>(value: T): NonNullable<T> {
  assertIsDefined(value);
  return value;
}

export class AssertValidValueError extends Error {
  constructor() {
    super();
  }
}
