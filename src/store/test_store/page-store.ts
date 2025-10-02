import { ImmerFn, Slice, SliceValue } from "./types";
import * as AudioSlice from "./audio-slice";
import * as VideoSlice from "./video-slice";
import * as GeneralSlice from "./general-slice";
import { createSettingsStore, SettingsStore } from "./settings-store";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface MySliceValue<T> extends SliceValue<T> {
  hasChanged: () => boolean;
}

type MySlice<T> = Slice<T> & {
  [K in keyof T]: MySliceValue<T[K]>;
} & {
  hasChanged: () => boolean;
};

export type MyAudioSlice = MySlice<AudioSlice.SliceData>;

const MyAudioSlice = (
  oldStore: SettingsStore,
  useStore: SettingsStore
): MyAudioSlice => {
  const instance: MyAudioSlice = {
    ...useStore.getState().audio,
    quality: {
      ...useStore.getState().audio.quality,
      hasChanged: () => {
        return (
          useStore.getState().audio.quality.value !==
          oldStore.getState().audio.quality.value
        );
      },
    },
    hasChanged: () => {
      return instance.quality.hasChanged();
    },
  };

  return instance;
};

export type MyVideoSlice = MySlice<VideoSlice.SliceData>;

const MyVideoSlice = (
  settingsStore: SettingsStore,
  useStore: SettingsStore
): MyVideoSlice => {
  const instance: MyVideoSlice = {
    ...useStore.getState().video,
    height: {
      ...useStore.getState().video.height,
      hasChanged: () => {
        return (
          useStore.getState().video.height.value !==
          settingsStore.getState().video.height.value
        );
      },
    },
    heightConstraint: {
      ...useStore.getState().video.heightConstraint,
      hasChanged: () => {
        return (
          useStore.getState().video.heightConstraint.value !==
          settingsStore.getState().video.heightConstraint.value
        );
      },
    },
    hasChanged: () => {
      return (
        instance.height.hasChanged() || instance.heightConstraint.hasChanged()
      );
    },
  };

  return instance;
};

export type MyGeneralSlice = MySlice<GeneralSlice.SliceData>;

const MyGeneralSlice: ImmerFn<MyGeneralSlice, MyStoreState> = (...args) => {
  const _super = GeneralSlice.CreateGeneralSlice()(...args);

  const instance: MyGeneralSlice = {
    ...useStore.getState().general,
    outputPath: {
      ...useStore.getState().general.outputPath,
      hasChanged: () => {
        return (
          useStore.getState().general.outputPath.value !==
          settingsStore.getState().general.outputPath.value
        );
      },
    },
    hasChanged: () => {
      return instance.outputPath.hasChanged();
    },
  };

  return instance;
};

interface MyStoreState {
  audio: AudioSlice.AudioSlice;
  video: VideoSlice.VideoSlice;
  general: MyGeneralSlice;
}

export function createStore(settingsStore: SettingsStore) {
  const useStore = createSettingsStore(settingsStore.getState().toData());

  const instance: MyStoreState = {
    audio: MyAudioSlice(settingsStore, useStore),
    video: MyVideoSlice(settingsStore, useStore),
    general: MyGeneralSlice(settingsStore, useStore),
  };

  create<MyStoreState>()(
    immer((...args) => {
      return {
        general: MyGeneralSlice(...args),
      };
    })
  );

  return;
}
