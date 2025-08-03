import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { YtdlpFormatItem, YtdlpResponse } from "./fetch-video-info";
import { DownloadEvent, DownloadItem } from "../lib/download-engine";

interface DownloadParameters {
  url: string;
  audioFormat: YtdlpFormatItem;
  videoFormat: YtdlpFormatItem;
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

export interface DownloadSpeed {
  rate: number;
  size: string;
}

function getPercentage(str: string): string | undefined {
  const result = /\d+(?:\.\d)*\%/.exec(str);
  return result ? result[0] : undefined;
}

function getSpeed(str: string): DownloadSpeed | undefined {
  const result = /(\d+\.\d+)(\w+\/s)/.exec(str);
  return result ? { rate: parseFloat(result[1]), size: result[2] } : undefined;
}

function isComplete(str: string): boolean {
  // When reaching 100%, two outputs will come from backend. One with the progress of the
  // download, "100.0%", and one with "100%". The second is treated as download complete.
  return str === "100%";
}

function recProgressUpdate(
  progress: number,
  items: DownloadItem[],
  path: number[],
  curItem: DownloadItem | undefined = undefined,
  start: number = 0
) {
  const idx = path[start];
  const next = idx === undefined ? undefined : items[idx];

  if (next) {
    recProgressUpdate(progress, next.items, path, next, start + 1);
    next.setProgress(next.getProgress());
  } else if (curItem) {
    curItem.setProgress(progress);
  }
}

function genQueue(queue: DownloadItem[]): number[] {
  if (!queue.length) {
    return [];
  }

  const path: number[] = [];

  function inner(items: DownloadItem[]) {
    for (let i = 0; i < items.length; i++) {
      if (items[i] && !items[i].done) {
        path.push(i);
        inner(items[i].items);
        break;
      }
    }
  }

  inner(queue);

  return path;
}

export const useDownloadVideo = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [speed, setSpeed] = useState<DownloadSpeed>();
  const [url, setUrl] = useState("");
  const [audioFormat, setAudioFormat] = useState("");
  const [videoFormat, setVideoFormat] = useState("");
  const [queue, setQueue] = useState<DownloadItem[]>([]);
  const [inQueue, setInQueue] = useState<number[]>([]);

  const [items, setItems] = useState<DownloadItem[]>([]);
  const [events, setEvents] = useState<Channel[]>([]);

  // useEffect(() => {
  //   let ongoing = false;

  //   if (isDownloading) {
  //     ongoing = true;
  //     let _q = [...queue];
  //     let _iq = [...inQueue];

  //     const onEvent = new Channel<DownloadEvents>();
  //     onEvent.onmessage = (message) => {
  //       if (ongoing && message.event === "started") {
  //         console.log("Download started.");
  //       } else if (ongoing && message.event === "progress") {
  //         const output = message.data.output;
  //         const percentage = getPercentage(output);
  //         const speed = getSpeed(output);

  //         if (typeof percentage === "string" && !isComplete(percentage)) {
  //           const progress = parseFloat(percentage);
  //           const newQueue = [..._q];

  //           recProgressUpdate(progress, newQueue, _iq);

  //           _iq = genQueue(newQueue);

  //           setQueue(newQueue);
  //           setInQueue(_iq);
  //         }

  //         // If undefined, yt-dlp failed to send the download speed.
  //         if (typeof speed !== undefined) {
  //           setSpeed(speed);
  //         }
  //       } else if (ongoing && message.event === "finished") {
  //         console.log("Finished!");
  //       }
  //     };

  //     invoke<YtdlpResponse>("download", {
  //       url,
  //       audioFormat,
  //       videoFormat,
  //       onEvent,
  //     })
  //       .then((response) => {
  //         console.log("Download success");
  //         console.log(response);
  //       })
  //       .catch((error) => {
  //         console.log("Download error");
  //         console.error(error);
  //       })
  //       .finally(() => {
  //         setIsDownloading(false);
  //       });
  //   }

  //   return () => {
  //     ongoing = false;
  //   };
  // }, [isDownloading, url, audioFormat, videoFormat]);

  return {
    download: (data: DownloadParameters) => {
      setUrl(data.url);
      setAudioFormat(data.audioFormat.id);
      setVideoFormat(data.videoFormat.id);
      setIsDownloading(true);

      const _q = [
        new DownloadItem({
          id: data.url,
          label: "File",
          items: [
            new DownloadItem({
              id: "audio",
              label: "Audio",
              size: data.audioFormat.filesize ?? undefined,
            }),
            new DownloadItem({
              id: "video",
              label: "Video",
              size: data.audioFormat.filesize ?? undefined,
            }),
          ],
        }),
      ];

      setQueue(_q);
      setInQueue(genQueue(_q));
    },

    isDownloading,
    speed,
    audioFormat,
    videoFormat,
    queue,
  };
};
