import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  AudioSettings,
  AudioSettingsSchema,
  GeneralSettings,
  GeneralSettingsSchema,
  Settings,
  SettingsSchema,
  VideoHeightConstraints,
  VideoHeights,
  VideoSettings,
  VideoSettingsSchema,
} from "../lib/fs/settings";
import { type ImmerStateCreator } from "./types";

type ImmerState<T> = ImmerStateCreator<T, StoreState>;

export type AudioSettingsState = AudioSettingsSchema;

export interface AudioSettingsActions {
  setIsWorstQuality: (value: boolean) => void;
}

export type AudioSettingsSlice = AudioSettingsState & AudioSettingsActions;

const createAudioSettingsSlice: (
  data?: AudioSettingsState
) => ImmerState<AudioSettingsSlice> = (data) => (set) => ({
  ...new AudioSettings(data),

  setIsWorstQuality: (value: boolean) =>
    set((state) => {
      state.audio.isWorstQuality = value;
    }),
});

export type VideoSettingsState = VideoSettingsSchema;

export interface VideoSettingsActions {
  setHeight: (value: VideoHeights) => void;
  setHeightConstraint: (value: VideoHeightConstraints) => void;
}

export type VideoSettingsSlice = VideoSettingsState & VideoSettingsActions;

const createVideoSettingsSlice: (
  data?: VideoSettingsState
) => ImmerState<VideoSettingsSlice> = (data) => (set) => ({
  ...new VideoSettings(data),

  setHeight: (value) =>
    set((state) => {
      state.video.height = value;
    }),

  setHeightConstraint: (value) =>
    set((state) => {
      state.video.heightConstraint = value;
    }),
});

export type GeneralSettingsState = GeneralSettingsSchema;

export interface GeneralSettingsActions {
  setOutputPath: (value: string) => void;
}

export type GeneralSettingsSlice = GeneralSettingsState &
  GeneralSettingsActions;

const createGeneralSettingsSlice: (
  data?: GeneralSettingsState
) => ImmerState<GeneralSettingsSlice> = (data) => (set) => ({
  ...new GeneralSettings(data),

  setOutputPath: (value: string) =>
    set((state) => {
      state.general.outputPath = value;
    }),
});

export interface StoreState {
  audio: AudioSettingsSlice;
  video: VideoSettingsSlice;
  general: GeneralSettingsSlice;
}

const createSettingsSlice: (
  data?: Partial<{
    audio: AudioSettingsState;
    video: VideoSettingsState;
    general: GeneralSettingsState;
  }>
) => ImmerState<StoreState> =
  (data) =>
  (...args) => ({
    audio: createAudioSettingsSlice(data?.audio)(...args),
    video: createVideoSettingsSlice(data?.video)(...args),
    general: createGeneralSettingsSlice(data?.general)(...args),
  });

let _useStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createStore(data?: SettingsSchema) {
  _useStore = create<StoreState>()(
    immer((...args) => {
      return createSettingsSlice(data)(...args);
    })
  );

  return useStore;
}

export function useStore<U>(fn: (state: StoreState) => U): U {
  return _useStore(fn);
}

useStore.setState = (newState: Settings) => {
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

useStore.getState = () => {
  return _useStore.getState();
};
