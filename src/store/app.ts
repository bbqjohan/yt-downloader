import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Slice, Store, SliceCreatorFn, CompareFn } from "../lib/store";
import z from "zod";

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

export type DownloadSlice = Slice<DownloadSliceData, AppStore>;

const AppSliceCreator: SliceCreatorFn<
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
          return s;
        });
      },
      setError: (value) => {
        set((s) => {
          s.download.url.error = value;
          return s;
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
      isEqual: () => false,
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
        s.download = slice.merge(s.download, data);
        return s;
      });
    },

    isEqual: () => false,
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

export type AppStore = Store<
  AppStoreData,
  {
    download: DownloadSlice;
    compare: CompareFn<AppStore>;
  }
>;

export function AppStoreCreator(data?: AppStoreData) {
  return create<AppStore>()(
    immer((set, get, store) => {
      const instance: AppStore = {
        download: AppSliceCreator(data?.download)(set, get, store),
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
        compare: () => false,
      };

      return instance;
    })
  );
}
