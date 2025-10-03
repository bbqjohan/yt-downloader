import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Slice, Store, SliceCreatorFn, CompareFn } from "./types";

export interface AppSliceData {
  url: string;
}

export type AppSlice = Slice<AppSliceData, AppStore>;

const AppSliceCreator: SliceCreatorFn<AppSliceData, AppSlice, AppStore> =
  (data) => (set, get) => {
    const slice: AppSlice = {
      url: {
        value: data?.url ?? "",
        error: null,
        setValue: (value) => {
          set((s) => {
            s.app.url.value = value;
            return s;
          });
        },
        setError: (value) => {
          set((s) => {
            s.app.url.error = value;
            return s;
          });
        },
        update: (value) => {
          const state = get().app;

          state.url.setValue(value);
          state.url.setError(state.url.validate(value));
        },
        validate: (value) => {
          return typeof value !== "string" ? "Invalid url" : null;
        },
        isEqual: () => false,
      },

      toData: () => {
        const state = get().app;

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
          s.app = slice.merge(s.app, data);
          return s;
        });
      },

      isEqual: () => false,
    };

    return slice;
  };

interface StoreData {
  app: AppSliceData;
}

export type AppStore = Store<
  StoreData,
  {
    app: AppSlice;
    compare: CompareFn<AppStore>;
  }
>;

export function AppStoreCreator(data?: StoreData) {
  return create<AppStore>()(
    immer((set, get, store) => {
      const instance: AppStore = {
        app: AppSliceCreator(data?.app)(set, get, store),
        toData: () => {
          const state = get();

          return {
            app: state.app.toData(),
          };
        },
        merge: (state, data) => {
          state.app = state.app.merge(state.app, data.app);

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
