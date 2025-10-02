import { ImmerSliceCreator } from "../types";
import { ImmerFn, Slice } from "./types";
import { type StoreState } from "./settings-store";
import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface SliceData {
  outputPath: string;
}

export type GeneralSlice = Slice<SliceData>;
type SliceCreator = ImmerSliceCreator<GeneralSlice, StoreState>;

export const CreateGeneralSlice: <T>(
  data?: SliceData
) => ImmerFn<GeneralSlice, StoreState> = (data) => (set, get, store) => {
  const instance: GeneralSlice = {
    outputPath: {
      value: data?.outputPath ?? "C:\\Downloads",
      error: null,
      setValue: (value) => {
        set((s) => {
          s.general.outputPath.value = value;

          return s;
        });
      },
      setError: (value) => {
        set((s) => {
          s.general.outputPath.error = value;

          return s;
        });
      },
      validate: (value) => {
        return value !== "w" ? "Can only be worst quality at this time." : null;
      },
      update: (value) => {
        const state = get().general.outputPath;

        state.setValue(value);
        state.setError(state.validate(value));
      },
    },
    merge: (state, data, validate = true) => {
      state.outputPath.value = data.outputPath;

      if (validate) {
        state.outputPath.error = state.outputPath.validate(data.outputPath);
      }
    },
    hydrate: (data, validate = true) => {
      store.setState((s) => {
        s.general.merge(s.general, data, validate);

        return s;
      });
    },
  };

  return instance;
};
