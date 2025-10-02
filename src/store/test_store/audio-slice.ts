import { ImmerSliceCreator } from "../types";
import { Slice } from "./types";
import { type StoreState } from "./settings-store";

export interface SliceData {
  quality: string;
}

export type AudioSlice = Slice<SliceData>;
type SliceCreator = ImmerSliceCreator<AudioSlice, StoreState>;

export const CreateAudioSlice: (data?: SliceData) => SliceCreator =
  (data) => (set, get, store) => {
    const instance: AudioSlice = {
      quality: {
        value: data?.quality ?? "",
        error: null,
        setValue: (value) => {
          set((s) => {
            s.audio.quality.value = value;
          });
        },
        setError: (value) => {
          set((s) => {
            s.audio.quality.error = value;
          });
        },
        validate: (value) => {
          return value !== "w"
            ? "Can only be worst quality at this time."
            : null;
        },
        update: (value) => {
          const state = get().audio.quality;

          state.setValue(value);
          state.setError(state.validate(value));
        },
      },
      merge: (state, data, validate = true) => {
        state.quality.value = data.quality;

        if (validate) {
          state.quality.error = state.quality.validate(data.quality);
        }
      },
      hydrate: (data, validate = true) => {
        store.setState((s) => {
          s.audio.merge(s.audio, data, validate);
        });
      },
    };

    return instance;
  };
