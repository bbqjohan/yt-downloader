import { ImmerSliceCreator } from "../types";
import { Slice } from "./types";
import { type StoreState } from "./settings-store";

export interface SliceData {
  height: string;
  heightConstraint: string;
}

export type VideoSlice = Slice<SliceData>;
type SliceCreator = ImmerSliceCreator<VideoSlice, StoreState>;

export const CreateVideoSlice: (data?: SliceData) => SliceCreator =
  (data) => (set, get, store) => {
    const instance: VideoSlice = {
      height: {
        value: data?.height ?? "",
        error: null,
        setValue: (value) => {
          set((s) => {
            s.video.height.value = value;
          });
        },
        setError: (value) => {
          set((s) => {
            s.video.height.error = value;
          });
        },
        validate: (value) => {
          return value !== "w"
            ? "Can only be worst quality at this time."
            : null;
        },
        update: (value, validate = true) => {
          const state = get().video.height;

          state.setValue(value);

          if (validate) {
            state.setError(state.validate(value));
          }
        },
      },

      heightConstraint: {
        value: data?.heightConstraint ?? "",
        error: null,
        setValue: (value) => {
          set((s) => {
            s.video.heightConstraint.value = value;
          });
        },
        setError: (value) => {
          set((s) => {
            s.video.heightConstraint.error = value;
          });
        },
        validate: (value) => {
          return value !== "w"
            ? "Can only be worst quality at this time."
            : null;
        },
        update: (value) => {
          const state = get().video.heightConstraint;

          state.setValue(value);
          state.setError(state.validate(value));
        },
      },
      merge: (state, data, validate = true) => {
        state.height.value = data.height;
        state.heightConstraint.value = data.heightConstraint;

        if (validate) {
          state.height.error = state.height.validate(data.height);
          state.heightConstraint.error = state.height.validate(
            data.heightConstraint
          );
        }
      },
      hydrate: (data, validate = true) => {
        store.setState((s) => {
          s.video.merge(s.video, data, validate);
        });
      },
    };

    return instance;
  };
