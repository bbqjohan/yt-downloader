// Types for the result object with discriminated union
export type Ok<T> = {
  data: T;
  error: null;
};

export type Err<E> = {
  data: null;
  error: E;
};

export type Result<T, E = Error> = Ok<T> | Err<E>;

export async function tryCatchAsync<T, E = Error>(
  promise: Promise<T>,
  error?: E
): Promise<Result<T, E>> {
  try {
    return ok(await promise);
  } catch (e) {
    return err(error ?? (e as E));
  }
}

export function tryCatch<T, E = Error>(
  callback: () => T,
  error?: E
): Result<T, E> {
  try {
    return ok(callback());
  } catch (e) {
    return err(error ?? (e as E));
  }
}

export function ok<T>(data: T): Ok<T> {
  return { data, error: null };
}

export function err<E>(error: E): Err<E> {
  return { data: null, error };
}
