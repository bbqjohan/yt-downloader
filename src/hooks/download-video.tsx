import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { YtdlpFormatItem, YtdlpResponse } from "./fetch-video-info";
import { DownloadItem, useDownloadQueue } from "./use-download-queue";

interface DownloadParameters {
  url: string;
  audioFormat: YtdlpFormatItem;
  videoFormat: YtdlpFormatItem;
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

class DlItem {
  progress = 0;
  speed = "";
  size = "";
  index = 0;
  items: DlItem[] = [];
  label = "";
  id = "";
  done = false;

  // current(): Item {
  //     return this.items.length > 0 ? this.items[this.index].current() : this;
  // }

  next(): DlItem | undefined {
    if (this.items.length && this.index !== this.items.length - 1) {
      this.index += 1;
    }

    return this.items[this.index];
  }

  // get done(): boolean {
  //   return this.progress >= 100;
  // }

  getProgress(): number {
    return this.items.length > 0
      ? Math.floor(
          (this.items.reduce((a, i) => a + +i.done, 0) / this.items.length +
            this.progress / (this.items.length * 100)) *
            100
        )
      : this.progress;
  }

  setProgress(progress: number) {
    this.progress = progress;
    this.done = this.progress >= 100;
  }

  get(id: string): DlItem | undefined {
    return this.id === id ? this : this.items.find((i) => i.get(id));
  }
}

export const useDownloadVideo = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [speed, setSpeed] = useState<DownloadSpeed>();
  const [url, setUrl] = useState("");
  const [audioFormat, setAudioFormat] = useState("");
  const [videoFormat, setVideoFormat] = useState("");
  const queue = useDownloadQueue();

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
          const speed = getSpeed(output);

          if (typeof percentage === "string") {
            queue.update(parseFloat(percentage));
          }

          // If undefined, yt-dlp failed to send the download speed.
          if (typeof speed !== undefined) {
            setSpeed(speed);
          }
        } else if (ongoing && message.event === "finished") {
          console.log("Finished!");
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
      setAudioFormat(data.audioFormat.id);
      setVideoFormat(data.videoFormat.id);
      setIsDownloading(true);

      queue.setItems([
        new DownloadItem({
          id: "audio",
          label: "Audio",
          filesize: data.audioFormat.filesize ?? undefined,
          progress: 0,
        }),
        new DownloadItem({
          id: "video",
          label: "Video",
          filesize: data.audioFormat.filesize ?? undefined,
          progress: 0,
        }),
      ]);
    },

    isDownloading,
    speed,
    audioFormat,
    videoFormat,
    queue,
  };
};
