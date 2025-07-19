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
  filesize: MaybeNull<number>;
  vcodec: string;
  protocol: string;
  fps: MaybeNull<number>;
  filesize_conversion: MaybeNull<string>;
}

export interface YtdlpFormatItem extends YtdlpFormat {
  id: string;
}

export const useFetchVideoInfo = (url: string) => {
  // const [_url, setUrl] = useState(url);
  const [fetching, setFetching] = useState(false);
  const [audioFormats, setAudioFormats] = useState<YtdlpFormatItem[]>([]);
  const [videoFormats, setVideoFormats] = useState<YtdlpFormatItem[]>([]);
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    let call = false;

    if (fetching) {
      call = true;

      invoke<YtdlpResponse>("fetch_data", {
        url: url,
      })
        .then((response) => {
          if (call) {
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
      call = false;
    };
  }, [fetching, url]);

  return {
    setFetching,
    audioFormats,
    videoFormats,
    videoTitle,
  };
};
