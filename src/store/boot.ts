import { create } from "zustand";
import { FileError } from "../lib/fs/error";
import * as StoreLib from "../lib/store";
import { immer } from "zustand/middleware/immer";

type StoreValue<TData> = StoreLib.Value<TData>;

type StoreSlice<TData> = {
  [K in keyof TData]: StoreValue<TData[K]>;
};

export class BootSliceData {
  readSettings: FileError | null = null;

  constructor(readSettings: FileError) {
    this.readSettings = readSettings;
  }
}

export type BootSlice = StoreSlice<BootSliceData>;

const BootSliceCreator: StoreLib.SliceCreatorFn<
  BootSliceData,
  BootSlice,
  BootSlice
> = (data) => (set) => {
  const slice: BootSlice = {
    readSettings: {
      value: data?.readSettings ?? null,
      setValue: (value) => {
        set((s) => {
          s.readSettings.value = value;
        });
      },
    },
  };

  return slice;
};

type BootStore = StoreLib.Hydrate<BootSliceData> &
  StoreLib.Merge<BootSliceData, BootStore> &
  BootSlice;

export function BootStoreCreator(data?: BootSliceData) {
  return create<BootStore>()(
    immer((set, get, store) => {
      return {
        ...BootSliceCreator(data)(set, get, store),
        merge: (state, data) => {
          state.readSettings.value = data.readSettings;

          return state;
        },
        hydrate: (data) => {
          set((s) => {
            get().merge(s, data);
          });
        },
      };
    })
  );
}
