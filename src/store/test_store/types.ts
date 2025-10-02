// export type Value<T> = {
//   value: T;
//   setValue: (value: T) => void;
// };

import { immer } from "zustand/middleware/immer";

// export type Error = {
//   error: string | null;
//   setError: (error: Error["error"]) => void;
// };

// export type Validate = (value: any) => Error["error"];

// export type Update<T> = (value: T) => void;

// export type HasChanged = () => boolean;

export type SliceValue<T> = {
  value: T;
  error: string | null;
  setValue: (value: T) => void;
  setError: (error: string | null) => void;
  validate: (value: any) => string | null;
  update: (value: T) => void;
};

export type Slice<T> = {
  [K in keyof T]: SliceValue<T[K]>;
} & {
  merge: (state: Slice<T>, data: T, validate?: boolean) => void;
  hydrate: (data: T, validate?: boolean) => void;
};

export type ImmerFn<TSlice, TStoreState> = <T extends TStoreState>(
  ...args: Parameters<ReturnType<typeof immer<T>>>
) => TSlice;
