import z from "zod";
import { StateCreator } from "zustand";

/**
 * Represents a function that creates a slice of a store.
 *
 * @template TSlice The slice as a whole.
 * @template TStoreState The store state.
 */
export type ImmerSliceCreator<TSlice, TStoreState> = StateCreator<
  TStoreState,
  [["zustand/immer", never], never],
  [],
  TSlice
>;

export interface Value<TData> {
  value: TData;
  setValue: (value: TData) => void;
}

export interface ValueError {
  error: SliceValueError;
  setError: (value: SliceValueError) => void;
}

export type UpdateFn<TData> = (value: TData) => void;
export type ValidateFn = (value: any) => SliceValueError;
export type ToDataFn<T> = () => T;
export type MergeFn<TSlice, TData> = (slice: TSlice, data: TData) => TSlice;
export type HydrateFn<T> = (data: T) => void;
export type IsEqualFn<TStore> = <T extends TStore>(store: T) => boolean;
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

export interface isEqual<TStore> {
  isEqual: IsEqualFn<TStore>;
}

export interface Validate {
  validate: ValidateFn;
}

export interface Update<TData> {
  update: UpdateFn<TData>;
}

export type Store<TData, TStore> = Hydrate<TData> &
  Merge<TData, TStore> &
  ToData<TData> &
  TStore;

export function mergeSliceWithData<
  TSlice extends { [K in keyof Data]: Value<Data[K]> },
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

export interface ISingletonStore<TData, TStore, TStoreDef> {
  useStore: {
    (): TStore;
    <U>(fn: (state: TStore) => U): U;
  };
  getStoreDef: () => TStoreDef;
  create: (data?: TData) => void;
  isCreated: () => boolean;
}

export class SingletonStore<
  TStore,
  TStoreCreator extends (...args: any) => any
> {
  #boundStore: ReturnType<TStoreCreator> | undefined;
  #storeCreator: TStoreCreator;

  constructor(storeCreator: TStoreCreator) {
    this.#storeCreator = storeCreator;
  }

  #assertStore(
    boundStore: unknown
  ): asserts boundStore is ReturnType<TStoreCreator> {
    if (!boundStore) {
      throw Error("No store");
    }
  }

  useStore(): TStore;
  useStore<U>(fn?: (state: TStore) => U): U;
  useStore<U>(fn?: (state: TStore) => U): U | TStore {
    this.#assertStore(this.#boundStore);

    if (typeof fn === "function") {
      return this.#boundStore(fn);
    } else {
      return this.#boundStore();
    }
  }

  create(data?: Parameters<TStoreCreator>[0]): void {
    if (!this.#boundStore) {
      this.#boundStore = this.#storeCreator(data);
    }
  }

  isCreated(): boolean {
    return !!this.#boundStore;
  }

  getStoreDef(): ReturnType<TStoreCreator> {
    this.#assertStore(this.#boundStore);
    return this.#boundStore;
  }
}
