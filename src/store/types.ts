import z from "zod";
import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

/**
 * This type represents a function that creates a slice of a store.
 *
 * @template TSlice The type that describes the slice as a whole.
 * @template TStoreState The type of the store state.
 */
export type ImmerSliceCreator<TSlice, TStoreState> = StateCreator<
  TStoreState,
  [["zustand/immer", never], never],
  [],
  TSlice
>;

/**
 * This interface represents a single value in a store.
 *
 * @template T The type of the value.
 */
export interface StateValue<T> {
  /**
   * The real value.
   */
  value: T;

  /**
   * An error message. If null, there is no error.
   */
  error: string | null;

  /**
   * Sets the real value.
   *
   * @param value The new value to set.
   */
  setValue: (value: T) => void;

  setError: (value: StateValue<T>["error"]) => void;

  update: (value: T) => void;

  /**
   * Validates the given value and returns whether it's valid.
   *
   * @param value The value to validate.
   * @returns Whether the value is valid.
   */
  validate: (value: any) => StateValue<T>["error"];
}

/**
 * This type represents a slice of a store, where each property is a StateValue.
 *
 * @template T The type of the data in the slice.
 */
export type StoreSliceData<T> = {
  [K in keyof T]: StateValue<T[K]>;
};

export type StoreSlice<TData, TSlice> = TSlice & {
  toData: () => TData;
  merge: (
    state: StoreSlice<TData, TSlice>,
    data: TData
  ) => StoreSlice<TData, TSlice>;
  hydrate: (data: TData) => void;
};

/**
 * A function that creates a slice of a store.
 *
 * @template TData The type of the data used to create the slice.
 * @template TSlice The type that describes the slice as a whole.
 * @template TStoreState The type of the store state.
 */
export type SliceCreator<TData, TSlice, TStoreState> = (
  data?: TData
) => ImmerSliceCreator<TSlice, TStoreState>;

/**
 * Manages a slice of a store, providing methods to create, convert, replace, merge, and extend
 * the slice.
 *
 * @template TData The type of the data used to create the slice.
 * @template TSlice The type that describes the slice as a whole.
 * @template TStoreState The type of the store state.
 */
export type SliceManager<TData, TSlice, TStoreState> = {
  create: SliceCreator<TData, TSlice, TStoreState>;
  // toData: (state?: TStoreState) => TData;
  // replace: (data: TData) => void;
  // merge: (data: TData) => TSlice;
  extends: <T extends TStoreState>(
    data?: TData
  ) => (...args: Parameters<ReturnType<typeof immer<T>>>) => TSlice;
};

export type StoreManager<TData, TStoreState> = {
  create: SliceCreator<TData, TStoreState, TStoreState>;
  // to: (state?: TStoreState) => TData;
  // replace: (data: TData) => void;
  // merge: (data: TData) => TStoreState;
};

export function mergeSliceWithData<
  Slice extends StoreSliceData<Data>,
  Data,
  Schema extends z.ZodObject
>(slice: Slice, validation: Schema, data?: Data): typeof slice {
  if (data) {
    validation.parse(data);

    for (const key of Object.keys(slice)) {
      slice[key as keyof Data].value = data[key as keyof Data];
    }
  }

  return slice;
}

export function createSliceManager() {}
