import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { YtdlpResponse } from "./fetch-video-info";

interface DownloadParameters {
  url: string;
  audioFormat: string;
  videoFormat: string;
}

interface DownloadEvent<Name, Data> {
  event: Name;
  data: Data;
}

type DownloadEventStarted = DownloadEvent<"started", {}>;
type DownloadEventProgress = DownloadEvent<
  "progress",
  {
    output: string;
  }
>;
type DownloadEventFinished = DownloadEvent<"finished", {}>;

type DownloadEvents =
  | DownloadEventStarted
  | DownloadEventProgress
  | DownloadEventFinished;

function getPercentage(str: string): string | undefined {
  const result = /\d+(?:\.\d)*\%/.exec(str);
  return result ? result[0] : undefined;
}

function getSize(str: string): string | undefined {
  const result = /\d+\.\d+\w+\s/.exec(str);
  return result ? result[0] : undefined;
}

function getSpeed(str: string): string | undefined {
  const result = /\d+\.\d+\w+\/s/.exec(str);
  return result ? result[0].trim() : undefined;
}

export const useDownloadVideo = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");
  const [audioFormat, setAudioFormat] = useState("");
  const [videoFormat, setVideoFormat] = useState("");

  useEffect(() => {
    let ongoing = false;

    if (isDownloading) {
      ongoing = true;

      const onEvent = new Channel<DownloadEvents>();
      onEvent.onmessage = (message) => {
        if (ongoing && message.event === "started") {
          console.log("Download started.");
        } else if (ongoing && message.event === "progress") {
          const output = message.data.output;
          const percentage = getPercentage(output);
          const size = getSize(output);
          const speed = getSpeed(output);

          console.log(percentage, size, speed);

          if (typeof percentage === "string") {
            setProgress(parseFloat(percentage));
          }
        }
      };

      invoke<YtdlpResponse>("download", {
        url,
        audioFormat,
        videoFormat,
        onEvent,
      })
        .then((response) => {
          console.log("Download success");
          console.log(response);
        })
        .catch((error) => {
          console.log("Download error");
          console.error(error);
        })
        .finally(() => {
          setIsDownloading(false);
        });
    }

    return () => {
      ongoing = false;
    };
  }, [isDownloading, url, audioFormat, videoFormat]);

  return {
    download: (data: DownloadParameters) => {
      setUrl(data.url);
      setAudioFormat(data.audioFormat);
      setVideoFormat(data.videoFormat);
      setIsDownloading(true);
    },
    isDownloading,
    progress,
    audioFormat,
    videoFormat,
  };
};
