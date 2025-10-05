import z from "zod";
import { StateCreator } from "zustand";

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

export interface Value<TData, TStore> {
  value: TData;
  error: SliceValueError;
  setValue: (value: TData) => void;
  setError: (value: SliceValueError) => void;
  update: (value: TData) => void;
  validate: (value: any) => SliceValueError;
  isEqual: CompareFn<TStore>;
}

export type ToValues<TData, TStore> = {
  [K in keyof TData]: Value<TData[K], TStore>;
};

export type ToDataFn<T> = () => T;
export type MergeFn<TSlice, TData> = (slice: TSlice, data: TData) => TSlice;
export type HydrateFn<T> = (data: T) => void;
export type CompareFn<TStore> = <T extends TStore>(store: T) => boolean;
export type SliceValueError = string | null;
export type SliceCreatorFn<TData, TSlice, TStore> = (
  data?: TData
) => <T extends TStore>(
  ...args: Parameters<ImmerSliceCreator<TSlice, T>>
) => TSlice;

export interface ToData<T> {
  toData: ToDataFn<T>;
}

export interface Merge<TData, TSlice> {
  merge: MergeFn<TSlice, TData>;
}

export interface Hydrate<T> {
  hydrate: HydrateFn<T>;
}

export interface Compare<TStore> {
  isEqual: CompareFn<TStore>;
}

export interface SliceArgs {
  compare: boolean;
  merge: boolean;
  hydrate: boolean;
  toData: boolean;
}

export type Slice<
  TData,
  TStore,
  TArgs extends SliceArgs = {
    compare: true;
    merge: true;
    hydrate: true;
    toData: true;
  }
> = (TArgs["compare"] extends true ? Compare<TStore> : unknown) &
  (TArgs["toData"] extends true ? ToData<TData> : unknown) &
  (TArgs["hydrate"] extends true ? Hydrate<TData> : unknown) &
  (TArgs["merge"] extends true
    ? Merge<TData, Slice<TData, TStore, TArgs>>
    : unknown) &
  ToValues<TData, TStore>;

export type Store<TData, TStore> = Hydrate<TData> &
  Merge<TData, TStore> &
  ToData<TData> &
  TStore;

export function mergeSliceWithData<
  TSlice extends Slice<Data, unknown>,
  Data,
  Schema extends z.ZodObject
>(slice: TSlice, validation: Schema, data?: Data): typeof slice {
  if (data) {
    validation.parse(data);

    for (const key of Object.keys(slice)) {
      slice[key as keyof Data].value = data[key as keyof Data];
    }
  }

  return slice;
}

export interface SingletonStore<
  TStore,
  TStoreCreator extends (...args: any) => TStore
> {
  /**
   * Creates the instance of the store that will be part of the singleton.
   */
  init(...args: Parameters<TStoreCreator>): void;

  useStore(): TStore;
  /**
   * Recreation of the call signature of zustands `UseBoundStore` interface.
   *
   * @param fn Optional. Returns a part of the state. If not provided, returns the entire state.
   */
  useStore<U>(fn?: (state: TStore) => U): U;

  /**
   * Whether the singleton has been initialized.
   */
  isInitialized(): boolean;

  /**
   * Returns the store bound instance.
   */
  getDef(): ReturnType<TStoreCreator>;
}

/**
 * This class represents a singleton interface for stores that must persist their data during a
 * session of the applicaton.
 */
export class SingletonStoreBase<
  TStore,
  TStoreCreator extends (...args: any) => any
> implements SingletonStore<TStore, TStoreCreator>
{
  #boundStore: ReturnType<TStoreCreator> | undefined;
  #storeCreator: TStoreCreator;

  constructor(storeCreator: TStoreCreator) {
    this.#storeCreator = storeCreator;
  }

  assertStore(
    boundStore: unknown
  ): asserts boundStore is ReturnType<TStoreCreator> {
    if (!boundStore) {
      throw Error("No store");
    }
  }

  useStore(): TStore;
  useStore<U>(fn?: (state: TStore) => U): U;
  useStore<U>(fn?: (state: TStore) => U): U | TStore {
    this.assertStore(this.#boundStore);

    return typeof fn === "function" ? this.#boundStore(fn) : this.#boundStore();
  }

  isInitialized() {
    return !!this.#boundStore;
  }

  init(...args: Parameters<TStoreCreator>) {
    if (!this.isInitialized()) {
      this.#boundStore = this.#storeCreator(...args);
    }
  }

  getDef() {
    this.assertStore(this.#boundStore);

    return this.#boundStore;
  }
}
