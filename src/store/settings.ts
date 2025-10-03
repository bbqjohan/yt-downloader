import {
  AudioSettings,
  AudioSettingsSchema,
  GeneralSettings,
  GeneralSettingsSchema,
  Settings,
  VideoSettings,
  VideoSettingsSchema,
} from "../lib/fs/settings";
import {
  CompareFn,
  mergeSliceWithData,
  Slice,
  SliceCreatorFn,
  Store,
} from "./types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type AudioSlice = Slice<AudioSettings, SettingsStore>;

export const AudioSliceCreator: SliceCreatorFn<
  AudioSettings,
  AudioSlice,
  SettingsStore
> = (data) => (set, get) => {
  const slice: AudioSlice = {
    quality: {
      value: "",
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
        return !AudioSettingsSchema.shape.quality.safeParse(value).success
          ? "Not quality enough"
          : null;
      },
      update: (value) => {
        const state = get().audio;

        state.quality.setValue(value);
        state.quality.setError(state.quality.validate(value));
      },
      compare: (otherStore) => {
        return get().audio.quality.value === otherStore.audio.quality.value;
      },
    },
    merge: (state, data) => {
      state.quality.value = data.quality;

      return state;
    },
    toData: () => {
      const state = get().audio;

      return new AudioSettings({
        quality: state.quality.value,
      });
    },
    hydrate: (data) => {
      set((s) => {
        s.audio.merge(s.audio, data);
      });
    },
    compare: (otherStore) => {
      return get().audio.quality.compare(otherStore);
    },
  };

  return mergeSliceWithData(slice, AudioSettingsSchema, data);
};

type VideoSlice = Slice<VideoSettings, SettingsStore>;

export const VideoSliceCreator: SliceCreatorFn<
  VideoSettings,
  VideoSlice,
  SettingsStore
> = (data) => (set, get) => {
  const slice: VideoSlice = {
    height: {
      value: "144",
      error: null,
      setValue: (value) =>
        set((s) => {
          s.video.height.value = value;
        }),
      setError: (value) =>
        set((s) => {
          s.video.height.error = value;
        }),
      validate: (value) => {
        return !VideoSettingsSchema.shape.height.safeParse(value).success
          ? "Not a valid height"
          : null;
      },
      update: (value) => {
        const state = get().video;

        state.height.setValue(value);
        state.height.setError(state.height.validate(value));
      },
      compare: (otherStore) => {
        return get().video.height.value === otherStore.video.height.value;
      },
    },
    heightConstraint: {
      value: "=",
      error: null,
      setValue: (value) =>
        set((s) => {
          s.video.heightConstraint.value = value;
        }),
      setError: (value) =>
        set((s) => {
          s.video.heightConstraint.error = value;
        }),
      validate: (value) => {
        return !VideoSettingsSchema.shape.heightConstraint.safeParse(value)
          .success
          ? "Not a valid constraint"
          : null;
      },
      update: (value) => {
        const state = get().video;

        state.heightConstraint.setValue(value);
        state.heightConstraint.setError(state.heightConstraint.validate(value));
      },
      compare: (otherStore) => {
        return (
          get().video.heightConstraint.value ===
          otherStore.video.heightConstraint.value
        );
      },
    },
    merge: (state, data) => {
      state.height.value = data.height;
      state.heightConstraint.value = data.heightConstraint;

      return state;
    },
    toData: () => {
      const state = get().video;

      return new VideoSettings({
        height: state.height.value,
        heightConstraint: state.heightConstraint.value,
      });
    },
    hydrate: (data) => {
      set((s) => {
        s.video = s.video.merge(s.video, data);
      });
    },
    compare: (otherStore) => {
      return (
        get().video.height.compare(otherStore) ||
        get().video.heightConstraint.compare(otherStore)
      );
    },
  };

  return mergeSliceWithData(slice, VideoSettingsSchema, data);
};

type GeneralSlice = Slice<GeneralSettings, SettingsStore>;

export const GeneralSliceCreator: SliceCreatorFn<
  GeneralSettings,
  GeneralSlice,
  SettingsStore
> = (data) => (set, get) => {
  const slice: GeneralSlice = {
    outputPath: {
      value: "",
      error: null,
      setValue: (value) =>
        set((s) => {
          s.general.outputPath.value = value;
        }),
      setError: (value) =>
        set((s) => {
          s.general.outputPath.error = value;
        }),
      validate: (value) => {
        return !GeneralSettingsSchema.shape.outputPath.safeParse(value).success
          ? "Not a valid output path."
          : null;
      },
      update: (value) => {
        const state = get().general;

        state.outputPath.setValue(value);
        state.outputPath.setError(state.outputPath.validate(value));
      },
      compare: (otherStore) => {
        return (
          get().general.outputPath.value === otherStore.general.outputPath.value
        );
      },
    },
    merge: (state, data) => {
      state.outputPath.value = data.outputPath;

      return state;
    },
    toData: () => {
      const state = get().general;

      return new GeneralSettings({
        outputPath: state.outputPath.value,
      });
    },
    hydrate: (data) => {
      set((s) => {
        s.general = s.general.merge(s.general, data);
      });
    },
    compare: (otherStore) => {
      return get().general.outputPath.compare(otherStore);
    },
  };

  return mergeSliceWithData(slice, GeneralSettingsSchema, data);
};

export type SettingsStore = Store<
  Settings,
  {
    audio: AudioSlice;
    video: VideoSlice;
    general: GeneralSlice;
    compare: CompareFn<SettingsStore>;
  }
>;

export function SettingsStoreCreator(data?: Settings) {
  return create<SettingsStore>()(
    immer((set, get, store) => {
      const instance: SettingsStore = {
        audio: AudioSliceCreator(data?.audio)(set, get, store),
        video: VideoSliceCreator(data?.video)(set, get, store),
        general: GeneralSliceCreator(data?.general)(set, get, store),
        toData: () => {
          const state = get();

          return new Settings({
            audio: state.audio.toData(),
            video: state.video.toData(),
            general: state.general.toData(),
          });
        },
        merge: (state, data) => {
          state.audio = state.audio.merge(state.audio, data.audio);
          state.video = state.video.merge(state.video, data.video);
          state.general = state.general.merge(state.general, data.general);

          return state;
        },
        hydrate: (data) => {
          set((s) => {
            get().merge(s, data);
          });
        },
        compare: (otherStore) => {
          const state = get();

          return (
            state.audio.compare(otherStore) ||
            state.video.compare(otherStore) ||
            state.general.compare(otherStore)
          );
        },
      };

      return instance;
    })
  );
}
