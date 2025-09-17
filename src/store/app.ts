import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ImmerStateCreator } from "./types";

type ImmerState<T> = ImmerStateCreator<T, StoreState>;

interface AppState {
  url: string;
}

interface AppActions {
  setUrl: (value: string) => void;
}

type AppSlice = AppState & AppActions;

interface StoreState {
  app: AppSlice;
}

const createAppSlice: (data?: AppState) => ImmerState<AppSlice> =
  (data) => (set) => ({
    url: data?.url || "",

    setUrl: (value: string) =>
      set((state) => {
        state.app.url = value;
      }),
  });

let _useStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createStore(data?: AppState) {
  _useStore = create<StoreState>()(
    immer((...args) => {
      return {
        app: createAppSlice(data)(...args),
      };
    })
  );

  return useStore;
}

export function useStore<U>(fn: (state: StoreState) => U): U {
  return _useStore(fn);
}
