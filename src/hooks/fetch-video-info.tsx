import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export type MaybeNull<T> = NonNullable<T> | null;

export interface YtdlpResponse {
  id: string;
  title: string;
  audio: YtdlpFormat[];
  video: YtdlpFormat[];
}

export interface YtdlpFormat {
  audio_ext: string;
  ext: string;
  format_id: string;
  resolution: string;
  video_ext: string;
  abr: MaybeNull<number>;
  vbr: MaybeNull<number>;
  filesize_exact: MaybeNull<number>;
  vcodec: string;
  protocol: string;
  fps: MaybeNull<number>;
  filesize: MaybeNull<string>;
}

export interface YtdlpFormatItem extends YtdlpFormat {
  id: string;
}

export const useFetchVideoInfo = (url: string) => {
  const [fetching, setFetching] = useState(false);
  const [audioFormats, setAudioFormats] = useState<YtdlpFormatItem[]>([]);
  const [videoFormats, setVideoFormats] = useState<YtdlpFormatItem[]>([]);
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    let ongoing = false;

    if (fetching) {
      ongoing = true;

      invoke<YtdlpResponse>("fetch_data", {
        url,
      })
        .then((response) => {
          if (ongoing) {
            setAudioFormats(
              response.audio
                .filter((format) => !format.protocol.startsWith("m3u8"))
                .map((format) => ({
                  ...format,
                  id: format.format_id,
                }))
            );

            setVideoFormats(
              response.video
                .filter((format) => !format.protocol.startsWith("m3u8"))
                .map((format) => ({
                  ...format,
                  id: format.format_id,
                }))
            );

            setVideoTitle(response.title);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setFetching(false);
        });
    }

    return () => {
      ongoing = false;
    };
  }, [fetching, url]);

  return {
    setFetching,
    fetching,
    audioFormats,
    videoFormats,
    videoTitle,
  };
};
