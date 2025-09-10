import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { DownloadEvent } from "../lib/download-engine";

/**
 * Interface for the download invocation parameters.
 */
interface DownloadInvokeParams {
  url: string;
  worstAudio: boolean;
  onEvent: Channel<DownloadEvents>;
}

/**
 * Parameters required to start a video download.
 */
export class DownloadParameters {
  url: string;
  worstAudio: boolean;

  constructor({
    url,
    worstAudio = false,
  }: {
    url: string;
    worstAudio?: boolean;
  }) {
    this.url = url;
    this.worstAudio = worstAudio;
  }
}

/**
 * Represents a video download item with its URL and ongoing status.
 */
export class VideoDownloadItem {
  parameters: DownloadParameters;
  status: "started" | "finished" | "progress" | "";
  progress: number;

  constructor({
    parameters,
    status = "",
    progress = 0,
  }: {
    parameters: DownloadParameters;
    status?: "started" | "finished" | "progress" | "";
    progress?: number;
  }) {
    this.parameters = parameters;
    this.status = status;
    this.progress = progress;
  }

  get progressString(): string {
    const floored = Math.floor(this.progress * 10) / 10;
    return `  ${floored}%`;
  }

  get isFinished(): boolean {
    return this.progress >= 100;
  }

  get isStarted(): boolean {
    return this.status === "started";
  }

  get isNew(): boolean {
    return this.status === "";
  }
}

type DownloadEventStarted = DownloadEvent<"started", {}>;
type DownloadEventFinished = DownloadEvent<"finished", {}>;
type DownloadEventProgress = DownloadEvent<
  "progress",
  {
    progress: number;
  }
>;
type DownloadEvents =
  | DownloadEventStarted
  | DownloadEventFinished
  | DownloadEventProgress;

/**
 * Custom hook to manage video downloads.
 *
 * @returns An object which handles a download.
 */
export const useDownloadVideo = () => {
  const [downloadItem, setDownloadItem] = useState<VideoDownloadItem | null>(
    null
  );

  useEffect(() => {
    if (downloadItem instanceof VideoDownloadItem && downloadItem.isNew) {
      const channel = new Channel<DownloadEvents>((message) => {
        if (message.event === "progress") {
          setDownloadItem((item) => {
            if (item instanceof VideoDownloadItem) {
              return new VideoDownloadItem({
                ...item,
                progress: message.data.progress,
              });
            }

            return item;
          });
        } else if (message.event === "started") {
          console.log("ITEM STARTED");
        } else if (message.event === "finished") {
          console.log("ITEM FINISHED");
          setDownloadItem((item) => {
            if (item instanceof VideoDownloadItem) {
              return new VideoDownloadItem({
                ...item,
                status: "finished",
              });
            }

            return item;
          });
        }
      });

      invoke<DownloadInvokeParams>("download", {
        url: downloadItem.parameters.url,
        worstAudio: downloadItem.parameters.worstAudio,
        onEvent: channel,
      });

      setDownloadItem(
        new VideoDownloadItem({ ...downloadItem, status: "started" })
      );
    }
  }, [downloadItem]);

  return {
    startDownload: (parameters: DownloadParameters) => {
      setDownloadItem(
        new VideoDownloadItem({
          parameters,
        })
      );
    },

    downloadItem,
  };
};
