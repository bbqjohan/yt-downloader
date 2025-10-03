import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { SliceManager, StoreSlice, StoreSliceData } from "./types";

interface StateData {
  url: string;
}

export type AppSliceData = StoreSliceData<StateData>;
export type AppSlice = StoreSlice<StateData, AppSliceData>;

interface StoreState {
  app: AppSlice;
}

const CreateAppSlice: SliceManager<StateData, AppSlice, StoreState> = {
  create: (data) => {
    return (...args) => {
      return CreateAppSlice.extends(data)(...args);
    };
  },

  extends: (data) => (set, get) => {
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
    };

    return slice;
  },
};

export function createStore(data?: StateData) {
  return create<StoreState>()(
    immer((...args) => {
      return {
        app: CreateAppSlice.create(data)(...args),
      };
    })
  );
}
