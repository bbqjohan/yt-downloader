import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  VideoHeightConstraintValues,
  VideoHeightValues,
} from "../hooks/download-video";

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
}

interface GeneralSettingsActions {
  setOutputPath: (value: string) => void;
}

type GeneralSettingsSlice = GeneralSettingsState & GeneralSettingsActions;

interface AppState {
  url: string;
}

interface AppActions {
  setUrl: (value: string) => void;
}

type AppSlice = AppState & AppActions;

interface SettingsSlice {
  audio: AudioSettingsSlice;
  video: VideoSettingsSlice;
  general: GeneralSettingsSlice;
}

interface StoreState {
  settings: SettingsSlice;
  app: AppSlice;
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
  height: data?.height || "360",
  heightConstraint: data?.heightConstraint || "=",

  setHeight: (value) =>
    set((state) => {
      state.settings.video.height = value;
    }),

  setHeightConstraint: (value) =>
    set((state) => {
      state.settings.video.heightConstraint = value;
    }),
});

const createGeneralSettingsSlice: (
  data?: GeneralSettingsState
) => ImmerStateCreator<GeneralSettingsSlice> = (data) => (set) => ({
  outputPath: data?.outputPath || "",

  setOutputPath: (value: string) =>
    set((state) => {
      state.settings.general.outputPath = value;
    }),
});

const createAppSlice: (data?: AppState) => ImmerStateCreator<AppSlice> =
  (data) => (set) => ({
    url: data?.url || "",

    setUrl: (value: string) =>
      set((state) => {
        state.app.url = value;
      }),
  });

const createSettingsSlice: (
  data?: Partial<{
    audio: AudioSettingsState;
    video: VideoSettingsState;
    general: GeneralSettingsState;
  }>
) => ImmerStateCreator<SettingsSlice> =
  (data) =>
  (...args) => ({
    audio: createAudioSettingsSlice(data?.audio)(...args),
    video: createVideoSettingsSlice(data?.video)(...args),
    general: createGeneralSettingsSlice(data?.general)(...args),
  });

let _useStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createStore(data?: {
  settings: {
    audio: AudioSettingsState;
    video: VideoSettingsState;
    general: GeneralSettingsState;
  };
  app: AppState;
}) {
  _useStore = create<StoreState>()(
    immer((...args) => {
      return {
        settings: createSettingsSlice({
          ...data?.settings,
        })(...args),
        app: createAppSlice(data?.app)(...args),
      };
    })
  );
}

export function useStore<U>(fn: (state: StoreState) => U): U {
  return _useStore(fn);
}
