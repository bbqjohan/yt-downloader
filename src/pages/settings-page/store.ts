import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  AudioSettings,
  AudioSettingsSchema,
  GeneralSettings,
  GeneralSettingsSchema,
  Settings,
  VideoSettings,
  VideoSettingsSchema,
} from "../../lib/fs/settings";
import {
  AudioSettingsSliceManager as _AudioSettingsSliceManager,
  VideoSettingsSliceManager as _VideoSettingsSliceManager,
  GeneralSettingsSliceManager as _GeneralSettingsSliceManager,
  AudioSettingsSlice as _AudioSlice,
  SettingsStore as _SettingsStore,
  createStore as _createStore,
  StoreState as _StoreState,
} from "../../store/_combined_settings";
import {
  ImmerSliceCreator,
  mergeSliceWithData,
  SliceManager,
  StateValue,
  StoreManager,
} from "../../store/types";

interface MyStateValue<T> extends StateValue<T> {
  hasChanged: () => boolean;
}

interface _SliceManager<Data, SliceState, StoreState>
  extends SliceManager<Data, SliceState, StoreState> {
  // hasChanged: () => boolean;
}

// interface _StoreManager<Data, StoreState>
//   extends StoreManager<Data, StoreState> {
//   hasChanged: () => boolean;
//   create: (_store: ReturnType<typeof _createStore>, data?: Data) => void;
// }

type MyStoreSlice<T> = {
  [K in keyof _AudioSlice]: {
    [T in keyof _AudioSlice[K]]: _AudioSlice[K][T];
  } & {
    hasChanged: () => boolean;
  };
} & {
  hasChanged: () => boolean;
};

type AudioSettingsSlice = MyStoreSlice<unknown>;

const AudioSettingsSliceManager: _SliceManager<
  AudioSettings,
  AudioSettingsSlice,
  StoreState
> = {
  create: (data) => {
    return (...args) => {
      return AudioSettingsSliceManager.extends(data)(...args);
    };
  },

  extends: (data) => (set, get, store) => {
    const _slice = _AudioSettingsSliceManager.extends<StoreState>(data)(
      set,
      get,
      store
    );

    const slice: AudioSettingsSlice = {
      isWorstQuality: {
        ..._slice.isWorstQuality,
        hasChanged: () => {
          return (
            get().audio.isWorstQuality.value !==
            _useSettingsStore.getState().audio.isWorstQuality.value
          );
        },
      },
      hasChanged: () => {
        return false;
      },
    };

    return mergeSliceWithData(
      slice,
      data ?? ({} as AudioSettings),
      AudioSettingsSchema
    );
  },

  toData: (state): AudioSettings => {
    return _AudioSettingsSliceManager.toData(state ?? _useStore.getState());
  },

  replace: (data: AudioSettings) => {
    _useStore.setState((s) => {
      return {
        ...s,
        audio: { ...AudioSettingsSliceManager.merge(data) },
      };
    });
  },

  merge: (data: AudioSettings) => {
    return mergeSliceWithData(
      _useStore.getState().audio,
      data,
      AudioSettingsSchema
    );
  },

  // hasChanged: () => {
  //   const state = _useStore.getState().audio;

  //   return Object.keys(state).some((key) => {
  //     return state[key as keyof typeof state].hasChanged();
  //   });
  // },
};

type VideoSettingsSlice = MyStoreSlice<VideoSettings>;

const VideoSettingsSliceManager: _SliceManager<
  VideoSettings,
  VideoSettingsSlice,
  StoreState
> = {
  create: (data) => {
    return (...args) => {
      return VideoSettingsSliceManager.extends(data)(...args);
    };
  },

  extends: (data) => (set, get, store) => {
    const _slice = _VideoSettingsSliceManager.extends<StoreState>(data)(
      set,
      get,
      store
    );

    const slice: VideoSettingsSlice = {
      height: {
        ..._slice.height,
        hasChanged: () => {
          return (
            get().video.height.value !==
            _useSettingsStore.getState().video.height.value
          );
        },
      },
      heightConstraint: {
        ..._slice.heightConstraint,
        hasChanged: () => {
          return (
            get().video.heightConstraint.value !==
            _useSettingsStore.getState().video.heightConstraint.value
          );
        },
      },
    };

    return mergeSliceWithData(
      slice,
      data ?? ({} as VideoSettings),
      VideoSettingsSchema
    );
  },

  toData: (state): VideoSettings => {
    return _VideoSettingsSliceManager.toData(state ?? _useStore.getState());
  },

  replace: (data: VideoSettings) => {
    _useStore.setState((s) => {
      return {
        ...s,
        video: { ...VideoSettingsSliceManager.merge(data) },
      };
    });
  },

  merge: (data: VideoSettings) => {
    return mergeSliceWithData(
      _useStore.getState().video,
      data,
      VideoSettingsSchema
    );
  },

  // hasChanged: () => {
  //   const state = _useStore.getState().video;

  //   return Object.keys(state).some((key) => {
  //     return state[key as keyof typeof state].hasChanged();
  //   });
  // },
};

type GeneralSettingsSlice = MyStoreSlice<GeneralSettings>;

const GeneralSettingsSliceManager: _SliceManager<
  GeneralSettings,
  GeneralSettingsSlice,
  StoreState
> = {
  create: (data) => {
    return (...args) => {
      return GeneralSettingsSliceManager.extends(data)(...args);
    };
  },

  extends: (data) => (set, get, store) => {
    const _slice = _GeneralSettingsSliceManager.extends<StoreState>(data)(
      set,
      get,
      store
    );

    const slice: GeneralSettingsSlice = {
      outputPath: {
        ..._slice.outputPath,
        hasChanged: () => {
          return (
            get().general.outputPath.value !==
            _useSettingsStore.getState().general.outputPath.value
          );
        },
      },
    };

    return mergeSliceWithData(
      slice,
      data ?? ({} as GeneralSettings),
      GeneralSettingsSchema
    );
  },

  toData: (state) => {
    return _GeneralSettingsSliceManager.toData(state ?? _useStore.getState());
  },

  replace: (data) => {
    _useStore.setState((s) => {
      return {
        ...s,
        general: { ...GeneralSettingsSliceManager.merge(data) },
      };
    });
  },

  merge: (data) => {
    return mergeSliceWithData(
      _useStore.getState().general,
      data,
      GeneralSettingsSchema
    );
  },

  // hasChanged: () => {
  //   const state = _useStore.getState().general;

  //   return Object.keys(state).some((key) => {
  //     return state[key as keyof typeof state].hasChanged();
  //   });
  // },
};

interface StoreState extends _StoreState {
  audio: AudioSettingsSlice;
  video: VideoSettingsSlice;
  general: GeneralSettingsSlice;
  hasChanged: () => boolean;
  // toData: () => Settings;
  // merge: (state: T, data: Settings) => StoreState;
  // hydrate: (data: Settings) => void;
}

export const SettingsStore = {
  create: (
    _store: ReturnType<typeof _createStore>,
    data?: Settings
  ): ImmerSliceCreator<StoreState, StoreState> => {
    return (set, get, store) => {
      const instance = {
        audio: AudioSettingsSliceManager.create(data?.audio)(set, get, store),
        video: VideoSettingsSliceManager.create(data?.video)(set, get, store),
        general: GeneralSettingsSliceManager.create(data?.general)(
          set,
          get,
          store
        ),
        hasChanged: () => {
          const state = get();

          return (
            state.audio.hasChanged() ||
            state.video.hasChanged() ||
            state.general.hasChanged()
          );
        },
      };

      return instance;
    };
  },

  // to: (): Settings => {
  //   return new Settings({
  //     audio: AudioSettingsSliceManager.toData(),
  //     video: VideoSettingsSliceManager.toData(),
  //     general: GeneralSettingsSliceManager.toData(),
  //   });
  // },

  // merge: (data: Settings) => {
  //   return {
  //     audio: AudioSettingsSliceManager.merge(data.audio),
  //     video: VideoSettingsSliceManager.merge(data.video),
  //     general: GeneralSettingsSliceManager.merge(data.general),
  //   };
  // },

  // replace: (data: Settings) => {
  //   _useStore.setState(() => {
  //     return SettingsStore.merge(data);
  //   });
  // },

  // hasChanged: () => {
  //   return (
  //     AudioSettingsSliceManager.hasChanged() ||
  //     VideoSettingsSliceManager.hasChanged() ||
  //     GeneralSettingsSliceManager.hasChanged()
  //   );
  // },
};

let _useStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createStore(
  _store: ReturnType<typeof _createStore>,
  data?: Settings
) {
  return create<StoreState>()(
    immer((...args) => {
      return SettingsStore.create(_store, data)(...args);
    })
  );

  return _useStore;
}

export function useStore<U>(fn: (state: StoreState) => U): U {
  return _useStore(fn);
}
