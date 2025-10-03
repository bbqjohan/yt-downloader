import z from "zod";
import { create, StateCreator } from "zustand";
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
  extends: <T extends TStoreState>(
    data?: TData
  ) => (...args: Parameters<ReturnType<typeof immer<T>>>) => TSlice;
};

export type StoreManager<TData, TStoreState> = {
  create: SliceCreator<TData, TStoreState, TStoreState>;
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

// =============================================================
// =============================================================
// =============================================================
// =============================================================
// =============================================================
// =============================================================
// =============================================================

export interface Value<TData, TStore> {
  value: TData;
  error: SliceValueError;
  setValue: (value: TData) => void;
  setError: (value: SliceValueError) => void;
  update: (value: TData) => void;
  validate: (value: any) => SliceValueError;
  compare: CompareFn<TStore>;
}

// export interface ValueComparable<TData, TStore> extends Value<TData> {
//   hasChanged: HasChangedFn<TStore>;
// }

export type ToValues<TData, TStore> = {
  [K in keyof TData]: Value<TData[K], TStore>;
};

// export type ToValuesComparable<T> = {
//   [K in keyof T]: ValueComparable<T[K]>;
// };

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
  compare: CompareFn<TStore>;
}

export type Slice<TData> = ToData<TData> &
  Hydrate<TData> &
  Merge<TData, Slice<TData>> &
  ToValues<TData, MyStore>;

export type Store<TData, TStore> = Hydrate<TData> &
  Merge<TData, TStore> &
  ToData<TData> &
  TStore;

interface MySliceData {
  quality: string;
}

type MySlice = Slice<MySliceData> & Compare<MyStore>;

const MySliceCreator: SliceCreatorFn<MySliceData, MySlice, MyStore> = (
  data
) => {
  return (set, get, store) => {
    const instance: MySlice = {
      quality: {
        value: "",
        error: null,
        setValue: () => {
          set((s) => {
            s.mySlice.quality.value = "sdf";
            return s;
          });
        },
        setError: () => {},
        update: () => {},
        validate: () => null,
        compare: (otherStore) => {
          return (
            get().mySlice.quality.value === otherStore.mySlice.quality.value
          );
        },
      },
      hydrate: (data) => {},
      merge: (slice, data) => slice,
      toData: () => data as any,
      compare: (otherStore) => {
        return get().mySlice.quality.compare(otherStore);
      },
    };

    return instance;
  };
};

interface MyStoreData {
  mySlice: MySliceData;
}

type MyStore = Store<
  MyStoreData,
  {
    mySlice: MySlice;
  }
>;

const b: MyStore = {
  mySlice: MySliceCreator()(1 as any, 2 as any, 3 as any),
  merge: (store, data) => {
    store.mySlice.merge(store.mySlice, data.mySlice);
    return store;
  },
} as MyStore;
b.merge(b, { mySlice: { quality: "asdf" } });

// ------------------------------------------- Store 2

type MySlice2 = MySlice & { what: () => false };

const MySliceCreator2: SliceCreatorFn<MySliceData, MySlice2, MyStore2> = (
  data: any
) => {
  return (set, get, store) => {
    const _slice = MySliceCreator(data)(set, get, store);

    const instance: MySlice2 = {
      ..._slice,
      quality: {
        ..._slice.quality,
        compare: () => false,
      },
      what: () => false,
    };

    return instance;
  };
};

interface MyStore2 extends MyStore {
  mySlice: MySlice2;
}

const Store2Creator = (store: MyStore, data: MyStoreData) => {
  return create<MyStore2>()(
    immer((...args) => {
      return {
        mySlice: MySliceCreator2(data.mySlice)(...args),
        merge: () => {
          return 123 as any;
        },
        hydrate: () => {},
        toData: () => {
          return 123 as any;
        },
      };
    })
  );
};
