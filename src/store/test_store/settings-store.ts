import { create } from "zustand";
import * as AudioSlice from "./audio-slice";
import * as GeneralSlice from "./general-slice";
import * as VideoSlice from "./video-slice";
import { immer } from "zustand/middleware/immer";

interface StoreData {
  audio: AudioSlice.SliceData;
  video: VideoSlice.SliceData;
  general: GeneralSlice.SliceData;
}

export interface StoreState {
  audio: AudioSlice.AudioSlice;
  video: VideoSlice.VideoSlice;
  general: GeneralSlice.GeneralSlice;
  toData: () => StoreData;
}

export type SettingsStore = ReturnType<typeof createSettingsStore>;

export function createSettingsStore(data?: StoreData) {
  return create<StoreState>()(
    immer((set, get, store) => {
      return {
        general: GeneralSlice.CreateGeneralSlice(data?.general)(
          set,
          get,
          store
        ),
        audio: AudioSlice.CreateAudioSlice(data?.audio)(set, get, store),
        video: VideoSlice.CreateVideoSlice(data?.video)(set, get, store),
        toData: () => {
          return {
            audio: {
              quality: get().audio.quality.value,
            },
            video: {
              height: get().video.height.value,
              heightConstraint: get().video.heightConstraint.value,
            },
            general: {
              outputPath: get().general.outputPath.value,
            },
          };
        },
      };
    })
  );
}

export function hydrateStore(
  store: ReturnType<typeof createSettingsStore>,
  data: StoreData,
  validate = true
) {
  store.setState((s) => {
    s.audio.merge(s.audio, data.audio, validate);
    s.video.merge(s.video, data.video, validate);
    s.general.merge(s.general, data.general, validate);

    return s;
  });
}
