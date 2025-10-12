import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import * as StoreLib from "../lib/store";
import z from "zod";

type StoreValue<TData> = StoreLib.Value<TData> &
  StoreLib.ValueError &
  StoreLib.Update<TData> &
  StoreLib.Validate;

type StoreSlice<TData> = StoreLib.ToData<TData> &
  StoreLib.Merge<TData, StoreSlice<TData>> &
  StoreLib.Hydrate<TData> & {
    [K in keyof TData]: StoreValue<TData[K]>;
  };

type DownloadSliceDataSchema = z.infer<typeof DownloadSliceDataSchema>;
const DownloadSliceDataSchema = z.object({
  url: z.email(),
});

export class DownloadSliceData implements DownloadSliceDataSchema {
  url: string;

  constructor({ url }: DownloadSliceDataSchema) {
    this.url = url;

    DownloadSliceDataSchema.parse(this);
  }
}

export type DownloadSlice = StoreSlice<DownloadSliceData>;

const DownloadSliceCreator: StoreLib.SliceCreatorFn<
  DownloadSliceData,
  DownloadSlice,
  AppStore
> = (data) => (set, get) => {
  const slice: DownloadSlice = {
    url: {
      value: data?.url ?? "",
      error: null,
      setValue: (value) => {
        set((s) => {
          s.download.url.value = value;
        });
      },
      setError: (value) => {
        set((s) => {
          s.download.url.error = value;
        });
      },
      update: (value) => {
        const state = get().download;

        state.url.setValue(value);
        state.url.setError(state.url.validate(value));
      },
      validate: (value) => {
        return typeof value !== "string" ? "Invalid url" : null;
      },
    },

    toData: () => {
      const state = get().download;

      return {
        url: state.url.value,
      };
    },

    merge: (state, data) => {
      state.url.value = data.url;

      return state;
    },

    hydrate: (data) => {
      set((s) => {
        slice.merge(s.download, data);
      });
    },
  };

  return slice;
};

type AppStoreSchema = z.infer<typeof AppStoreSchema>;
const AppStoreSchema = z.object({
  download: DownloadSliceDataSchema,
});

export class AppStoreData implements AppStoreSchema {
  download: DownloadSliceData;

  constructor({ download }: AppStoreSchema) {
    this.download = download;

    AppStoreSchema.parse(this);
  }
}

interface StoreSlices {
  download: DownloadSlice;
}

export type AppStore = StoreLib.Hydrate<AppStoreData> &
  StoreLib.ToData<AppStoreData> &
  StoreLib.Merge<AppStoreData, AppStore> &
  StoreSlices;

export function AppStoreCreator(data?: AppStoreData) {
  return create<AppStore>()(
    immer((set, get, store) => {
      const instance: AppStore = {
        download: DownloadSliceCreator(data?.download)(set, get, store),
        toData: () => {
          const state = get();

          return {
            download: state.download.toData(),
          };
        },
        merge: (state, data) => {
          state.download = state.download.merge(state.download, data.download);

          return state;
        },
        hydrate: (data) => {
          set((s) => {
            get().merge(s, data);
          });
        },
      };

      return instance;
    })
  );
}
