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
  mergeSliceWithData,
  SliceManager,
  StoreManager,
  StoreSlice,
  StoreSliceData,
} from "./types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// ===============================================================================
//
// Audio slice
//
// ===============================================================================

export type AudioSettingsSliceData = StoreSliceData<AudioSettings>;
export type AudioSettingsSlice = StoreSlice<
  AudioSettings,
  AudioSettingsSliceData
>;

export const AudioSettingsSliceManager: SliceManager<
  AudioSettings,
  AudioSettingsSlice,
  StoreState
> = {
  create: (data) => {
    return (...args) => {
      return AudioSettingsSliceManager.extends(data)(...args);
    };
  },

  extends: (data) => (set, get) => {
    const slice: AudioSettingsSlice = {
      isWorstQuality: {
        value: false,
        error: null,
        setValue: (value: boolean) => {
          set((s) => {
            s.audio.isWorstQuality.value = value;
            return s;
          });
        },
        setError: (value) => {
          set((s) => {
            s.audio.isWorstQuality.error = value;
            return s;
          });
        },
        validate: (value) => {
          return AudioSettingsSchema.shape.isWorstQuality.safeParse(value)
            .success
            ? "Not quality enough"
            : null;
        },
        update: (value) => {
          const state = get().audio;

          state.isWorstQuality.setValue(value);
          state.isWorstQuality.setError(state.isWorstQuality.validate(value));
        },
      },
      merge: (state, data) => {
        state.isWorstQuality.value = data.isWorstQuality;

        return state;
      },
      toData: () => {
        const state = get().audio;

        return new AudioSettings({
          isWorstQuality: state.isWorstQuality.value,
        });
      },
      hydrate: (data) => {
        set((s) => {
          s.audio = s.audio.merge(s.audio, data);
          return s;
        });
      },
    };

    return mergeSliceWithData(slice, AudioSettingsSchema, data);
  },
};

// ===============================================================================
//
// Video slice
//
// ===============================================================================

export type VideoSettingsSliceData = StoreSliceData<VideoSettings>;
export type VideoSettingsSlice = StoreSlice<
  VideoSettings,
  VideoSettingsSliceData
>;

export const VideoSettingsSliceManager: SliceManager<
  VideoSettings,
  VideoSettingsSlice,
  StoreState
> = {
  create: (data) => {
    return (...args) => {
      return VideoSettingsSliceManager.extends(data)(...args);
    };
  },

  extends: (data) => (set, get) => {
    const slice: VideoSettingsSlice = {
      height: {
        value: "144",
        error: null,
        setValue: (value) =>
          set((s) => {
            s.video.height.value = value;
            return s;
          }),
        setError: (value) =>
          set((s) => {
            s.video.height.error = value;
            return s;
          }),
        validate: (value) => {
          return VideoSettingsSchema.shape.height.safeParse(value).success
            ? "Not a valid height"
            : null;
        },
        update: (value) => {
          const state = get().video;

          state.height.setValue(value);
          state.height.setError(state.height.validate(value));
        },
      },
      heightConstraint: {
        value: "=",
        error: null,
        setValue: (value) =>
          set((s) => {
            s.video.heightConstraint.value = value;
            return s;
          }),
        setError: (value) =>
          set((s) => {
            s.video.heightConstraint.error = value;
            return s;
          }),
        validate: (value) => {
          return VideoSettingsSchema.shape.heightConstraint.safeParse(value)
            .success
            ? "Not a valid constraint"
            : null;
        },
        update: (value) => {
          const state = get().video;

          state.heightConstraint.setValue(value);
          state.heightConstraint.setError(
            state.heightConstraint.validate(value)
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
          return s;
        });
      },
    };

    return mergeSliceWithData(slice, VideoSettingsSchema, data);
  },
};

// ===============================================================================
//
// General slice
//
// ===============================================================================

export type GeneralSettingsSliceData = StoreSliceData<GeneralSettings>;
export type GeneralSettingsSlice = StoreSlice<
  GeneralSettings,
  GeneralSettingsSliceData
>;

export const GeneralSettingsSliceManager: SliceManager<
  GeneralSettings,
  GeneralSettingsSlice,
  StoreState
> = {
  create: (data) => {
    return (...args) => {
      return GeneralSettingsSliceManager.extends(data)(...args);
    };
  },

  extends: (data) => (set, get) => {
    const slice: GeneralSettingsSlice = {
      outputPath: {
        value: "",
        error: null,
        setValue: (value) =>
          set((s) => {
            s.general.outputPath.value = value;
            return s;
          }),
        setError: (value) =>
          set((s) => {
            s.general.outputPath.error = value;
            return s;
          }),
        validate: (value) => {
          return GeneralSettingsSchema.shape.outputPath.safeParse(value).success
            ? "Not a valid output path."
            : null;
        },
        update: (value) => {
          const state = get().general;

          state.outputPath.setValue(value);
          state.outputPath.setError(state.outputPath.validate(value));
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
          return s;
        });
      },
    };

    return mergeSliceWithData(slice, GeneralSettingsSchema, data);
  },
};

// ===============================================================================
//
// The store hook
//
// ===============================================================================

export interface StoreState {
  audio: AudioSettingsSlice;
  video: VideoSettingsSlice;
  general: GeneralSettingsSlice;
  toData: () => Settings;
  merge: <T extends StoreState>(state: T, data: Settings) => T;
}

export const SettingsStore: StoreManager<Settings, StoreState> = {
  create: (data) => {
    return (...args) => {
      const instance: StoreState = {
        audio: AudioSettingsSliceManager.create(data?.audio)(...args),
        video: VideoSettingsSliceManager.create(data?.video)(...args),
        general: GeneralSettingsSliceManager.create(data?.general)(...args),
        toData: () => {
          const state = args[1]();

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
      };

      return instance;
    };
  },
};

// export let useStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createStore(data?: Settings) {
  return create<StoreState>()(
    immer((...args) => {
      return SettingsStore.create(data)(...args);
    })
  );
}

export function hydrateStore(
  store: ReturnType<typeof createStore>,
  data: Settings
  // validate = true
) {
  store.setState((s) => {
    return s.merge(s, data);
  });
}
