import { create } from "zustand";
import {
  AudioSettingsSliceManager,
  createStore,
  StoreState,
  AudioSettingsSliceData,
  VideoSettingsSliceData,
  VideoSettingsSliceManager,
  GeneralSettingsSliceData,
  GeneralSettingsSliceManager,
} from "../../store/settings";
import { immer } from "zustand/middleware/immer";
import { ImmerSliceCreator } from "../../store/types";
import { Settings } from "../../lib/fs/settings";

type CombinedStore = ReturnType<typeof createStore>;

type PageAudioSlice = StoreState["audio"] & {
  [K in keyof AudioSettingsSliceData]: AudioSettingsSliceData[K] & {
    hasChanged: () => boolean;
  };
} & { hasChanged: () => boolean };
type PageAudioSliceFn = ImmerSliceCreator<PageAudioSlice, PageStoreState>;
const CreatePageAudioSlice = (oldStore: CombinedStore): PageAudioSliceFn => {
  return (set, get, store): PageAudioSlice => {
    const _slice = AudioSettingsSliceManager.extends<PageStoreState>()(
      set,
      get,
      store
    );

    const instance: PageAudioSlice = {
      ..._slice,
      quality: {
        ..._slice.quality,
        hasChanged: () => {
          return (
            oldStore.getState().audio.quality.value !==
            get().audio.quality.value
          );
        },
      },
      hasChanged: () => get().audio.quality.hasChanged(),
    };

    return instance;
  };
};

type PageVideoSlice = StoreState["video"] & {
  [K in keyof VideoSettingsSliceData]: VideoSettingsSliceData[K] & {
    hasChanged: () => boolean;
  };
} & { hasChanged: () => boolean };
type PageVideoSliceFn = ImmerSliceCreator<PageVideoSlice, PageStoreState>;
const CreatePageVideoSlice = (oldStore: CombinedStore): PageVideoSliceFn => {
  return (set, get, store): PageVideoSlice => {
    const _slice = VideoSettingsSliceManager.extends<PageStoreState>()(
      set,
      get,
      store
    );

    const instance: PageVideoSlice = {
      ..._slice,
      height: {
        ..._slice.height,
        hasChanged: () => {
          return (
            oldStore.getState().video.height.value !== get().video.height.value
          );
        },
      },
      heightConstraint: {
        ..._slice.heightConstraint,
        hasChanged: () => {
          return (
            oldStore.getState().video.heightConstraint.value !==
            get().video.heightConstraint.value
          );
        },
      },
      hasChanged: () => {
        return (
          get().video.height.hasChanged() ||
          get().video.heightConstraint.hasChanged()
        );
      },
    };

    return instance;
  };
};

type PageGeneralSlice = StoreState["general"] & {
  [K in keyof GeneralSettingsSliceData]: GeneralSettingsSliceData[K] & {
    hasChanged: () => boolean;
  };
} & { hasChanged: () => boolean };
type PageGeneralSliceFn = ImmerSliceCreator<PageGeneralSlice, PageStoreState>;
const CreatePageGeneralSlice = (
  oldStore: CombinedStore
): PageGeneralSliceFn => {
  return (set, get, store): PageGeneralSlice => {
    const _slice = GeneralSettingsSliceManager.extends<PageStoreState>()(
      set,
      get,
      store
    );

    const instance: PageGeneralSlice = {
      ..._slice,
      outputPath: {
        ..._slice.outputPath,
        hasChanged: () => {
          return (
            oldStore.getState().general.outputPath.value !==
            get().general.outputPath.value
          );
        },
      },
      hasChanged: () => {
        return get().general.outputPath.hasChanged();
      },
    };

    return instance;
  };
};

interface PageStoreState extends StoreState {
  audio: PageAudioSlice;
  video: PageVideoSlice;
  general: PageGeneralSlice;
}

export function createPageStore(oldStore: ReturnType<typeof createStore>) {
  return create<PageStoreState>()(
    immer((set, get, store) => {
      const instance: PageStoreState = {
        audio: CreatePageAudioSlice(oldStore)(set, get, store),
        video: CreatePageVideoSlice(oldStore)(set, get, store),
        general: CreatePageGeneralSlice(oldStore)(set, get, store),
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
      };

      return instance;
    })
  );
}

export function hydrateStore(
  store: ReturnType<typeof createPageStore>,
  data: Settings
  // validate = true
) {
  store.setState((s) => {
    return s.merge(s, data);
  });
}
