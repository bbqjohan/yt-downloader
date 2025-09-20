import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  AudioSettings,
  GeneralSettings,
  Settings,
  VideoSettings,
} from "../../lib/fs/settings";
import {
  AudioSettingsSlice as SettingsAudioSlice,
  GeneralSettingsSlice as SettingsGeneralSlice,
  VideoSettingsSlice as SettingsVideoSlice,
  useStore as useSettingsStore,
} from "../../store/settings";
import { hasChanged } from "../../store/stores";

type ImmerStateCreator<T, S> = StateCreator<
  S,
  [["zustand/immer", never], never],
  [],
  T
>;

type ImmerState<T> = ImmerStateCreator<T, StoreState>;

interface AudioSlice extends SettingsAudioSlice {
  hasIsWorstQualityChanged: () => boolean;
  compare: () => boolean;
}

const createAudioSlice =
  (data?: AudioSettings): ImmerState<AudioSlice> =>
  (set, get) => ({
    ...new AudioSettings(data),

    setIsWorstQuality: (value: boolean) =>
      set((state) => {
        state.audio.isWorstQuality = value;
      }),

    hasIsWorstQualityChanged: () => {
      return (
        get().audio.isWorstQuality !==
        useSettingsStore.getState().audio.isWorstQuality
      );
    },

    compare: () => hasChanged(get().audio),
  });

interface VideoSlice extends SettingsVideoSlice {
  hasHeightChanged: () => boolean;
  hasHeightConstraintChanged: () => boolean;
  compare: () => boolean;
}

const createVideoSlice =
  (data?: VideoSettings): ImmerState<VideoSlice> =>
  (set, get) => ({
    ...new VideoSettings(data),

    setHeight: (value) =>
      set((state) => {
        state.video.height = value;
      }),

    setHeightConstraint: (value) =>
      set((state) => {
        state.video.heightConstraint = value;
      }),

    hasHeightChanged: () => {
      return get().video.height !== useSettingsStore.getState().video.height;
    },

    hasHeightConstraintChanged: () => {
      return (
        get().video.heightConstraint !==
        useSettingsStore.getState().video.heightConstraint
      );
    },

    compare: () => hasChanged(get().video),
  });

interface GeneralSlice extends SettingsGeneralSlice {
  hasOutputPathChanged: () => boolean;
  compare: () => boolean;
}

const createGeneralSlice =
  (data?: GeneralSettings): ImmerState<GeneralSlice> =>
  (set, get) => ({
    ...new GeneralSettings(data),

    setOutputPath: (value: string) =>
      set((state) => {
        state.general.outputPath = value;
      }),

    hasOutputPathChanged() {
      return (
        get().general.outputPath !==
        useSettingsStore.getState().general.outputPath
      );
    },

    compare: () => hasChanged(get().general),
  });

interface StoreState {
  audio: AudioSlice;
  video: VideoSlice;
  general: GeneralSlice;
}

let _useStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createStore(data?: Settings) {
  _useStore = create<StoreState>()(
    immer((...args) => {
      return {
        audio: createAudioSlice(data?.audio)(...args),
        video: createVideoSlice(data?.video)(...args),
        general: createGeneralSlice(data?.general)(...args),
      };
    })
  );

  return useStore;
}

export function useStore<U>(fn: (state: StoreState) => U): U {
  return _useStore(fn);
}
useStore.getState = () => {
  return _useStore.getState();
};
useStore.setState = (newState: StoreState) => {
  _useStore.setState((state) => {
    return {
      audio: {
        ...state.audio,
        ...newState.audio,
      },
      video: {
        ...state.video,
        ...newState.video,
      },
      general: {
        ...state.general,
        ...newState.general,
      },
    };
  });
};
