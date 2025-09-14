import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AudioSettingsState {
  isWorstQuality: boolean;
}

interface AudioSettingsActions {
  setIsWorstQuality: (value: boolean) => void;
}

type AudioSettingsSlice = AudioSettingsState & AudioSettingsActions;

interface VideoSettingsState {
  height: string;
  heightConstraint: string;
}

interface VideoSettingsActions {
  setHeight: (value: string) => void;
  setHeightConstraint: (value: string) => void;
}

type VideoSettingsSlice = VideoSettingsState & VideoSettingsActions;

interface GeneralSettingsState {
  outputPath: string;
  url: string;
}

interface GeneralSettingsActions {
  setOutputPath: (value: string) => void;
  setUrl: (value: string) => void;
}

type GeneralSettingsSlice = GeneralSettingsState & GeneralSettingsActions;

interface SettingsSlice {
  audio: AudioSettingsSlice;
  video: VideoSettingsSlice;
  general: GeneralSettingsSlice;
}

interface StoreState {
  settings: SettingsSlice;
}

export type ImmerStateCreator<T> = StateCreator<
  StoreState,
  [["zustand/immer", never], never],
  [],
  T
>;

const createAudioSettingsSlice: (
  data?: AudioSettingsState
) => ImmerStateCreator<AudioSettingsSlice> = (data) => (set) => ({
  isWorstQuality: data?.isWorstQuality || false,

  setIsWorstQuality: (value: boolean) =>
    set((state) => {
      state.settings.audio.isWorstQuality = value;
    }),
});

const createVideoSettingsSlice: (
  data?: VideoSettingsState
) => ImmerStateCreator<VideoSettingsSlice> = (data) => (set) => ({
  height: data?.height || "",
  heightConstraint: data?.heightConstraint || "",

  setHeight: (value: string) =>
    set((state) => {
      state.settings.video.height = value;
    }),

  setHeightConstraint: (value: string) =>
    set((state) => {
      state.settings.video.heightConstraint = value;
    }),
});

const createGeneralSettingsSlice: (
  data?: GeneralSettingsState
) => ImmerStateCreator<GeneralSettingsSlice> = (data) => (set) => ({
  outputPath: data?.outputPath || "",
  url: data?.url || "",

  setOutputPath: (value: string) =>
    set((state) => {
      state.settings.general.outputPath = value;
    }),

  setUrl: (value: string) =>
    set((state) => {
      state.settings.general.url = value;
    }),
});

const createSettingsSlice: (data?: {
  audio: AudioSettingsState;
  video: VideoSettingsState;
  general: GeneralSettingsState;
}) => ImmerStateCreator<SettingsSlice> =
  (data) =>
  (...args) => ({
    audio: createAudioSettingsSlice(data?.audio)(...args),
    video: createVideoSettingsSlice(data?.video)(...args),
    general: createGeneralSettingsSlice(data?.general)(...args),
  });

// export const useStore = create<StoreState>()(
//   immer((...args) => {
//     return {
//       settings: createSettingsSlice(...args),
//     };
//   })
// );

export let _useStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createStore(data?: {
  audio: AudioSettingsState;
  video: VideoSettingsState;
  general: GeneralSettingsState;
}) {
  _useStore = create<StoreState>()(
    immer((...args) => {
      return {
        settings: createSettingsSlice(data)(...args),
      };
    })
  );
}

export function useStore<U>(fn: (state: StoreState) => U): U {
  return _useStore(fn);
}
