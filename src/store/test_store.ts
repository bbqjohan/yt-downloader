import { create } from "zustand";
import { ImmerSliceCreator } from "./types";
import { immer } from "zustand/middleware/immer";

interface SliceData_GeneralSettings {
  outputPath: string;
  error: string | null;
}

interface Slice_GeneralSettings {
  outputPath: {
    value: string;
    error: string | null;
    setValue: (value: string) => void;
    setError: (error: string | null) => void;
    validate: (value: any) => string | null;
    update: (value: string) => void;
  };
}

type SliceCreator_GeneralSettings = ImmerSliceCreator<
  Slice_GeneralSettings,
  StoreState
>;

const SliceCreator_GeneralSettings: SliceCreator_GeneralSettings = (
  set,
  get
) => {
  return {
    outputPath: {
      value: "",
      error: null,
      setValue: (value) => {
        set((state) => {
          state.general.outputPath.value = value;
        });
      },
      setError: (error) => {
        set((state) => {
          state.general.outputPath.error = error;
        });
      },
      validate: (value) => {
        return typeof value !== "string" ? "No string provided." : null;
      },
      update: (value) => {
        get().general.outputPath.setValue(value);
        get().general.outputPath.setError(
          get().general.outputPath.validate(value)
        );
      },
    },
  };
};

export function Slice_GeneralSettings_Hydrate(data: SliceData_GeneralSettings) {
  useTestStore.setState((state) => {
    Slice_GeneralSettings_Merge(state.general, data);
    return state;
  });
}

export function Slice_GeneralSettings_Merge(
  state: Slice_GeneralSettings,
  data: SliceData_GeneralSettings
) {
  state.outputPath.value = data.outputPath;
  state.outputPath.error = data.error;

  return state;
}

interface SliceData_AudioSettings {
  quality: string;
  error: string | null;
}

interface Slice_AudioSettings {
  quality: {
    value: string;
    error: string | null;
    setValue: (value: string) => void;
    setError: (error: string | null) => void;
    validate: (value: any) => string | null;
    update: (value: string) => void;
  };
}

type SliceCreator_AudioSettings = ImmerSliceCreator<
  Slice_AudioSettings,
  StoreState
>;

const SliceCreator_AudioSettings: SliceCreator_AudioSettings = (set, get) => {
  return {
    quality: {
      value: "",
      error: null,
      setValue: (value) => {
        set((state) => {
          state.audio.quality.value = value;
        });
      },
      setError: (error) => {
        set((state) => {
          state.audio.quality.error = error;
        });
      },
      validate: (value) => {
        return typeof value !== "string" ? "No string provided." : null;
      },
      update: (value) => {
        get().audio.quality.setValue(value);
        get().audio.quality.setError(get().audio.quality.validate(value));
      },
    },
  };
};

export function Slice_AudioSettings_Hydrate(data: SliceData_AudioSettings) {
  useTestStore.setState((state) => {
    Slice_AudioSettings_Merge(state.audio, data);
    return state;
  });
}

export function Slice_AudioSettings_Merge(
  state: Slice_AudioSettings,
  data: SliceData_AudioSettings
) {
  state.quality.value = data.quality;
  state.quality.error = data.error;

  return state;
}

export function Store_Hydrate(newState: StoreData) {
  useTestStore.setState((state) => {
    Slice_GeneralSettings_Merge(state.general, newState.general);
    Slice_AudioSettings_Merge(state.audio, newState.audio);

    return state;
  });
}

interface StoreState {
  general: Slice_GeneralSettings;
  audio: Slice_AudioSettings;
}

interface StoreData {
  general: SliceData_GeneralSettings;
  audio: SliceData_AudioSettings;
}

export let useTestStore: ReturnType<ReturnType<typeof create<StoreState>>>;

export function createTestStore() {
  useTestStore = create<StoreState>()(
    immer((...args) => {
      return {
        general: SliceCreator_GeneralSettings(...args),
        audio: SliceCreator_AudioSettings(...args),
      };
    })
  );
}
