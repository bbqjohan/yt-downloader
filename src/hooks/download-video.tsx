import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { DownloadEvent } from "../lib/download-engine";

/**
 * Parameters required to start a video download.
 */
interface DownloadParameters {
  url: string;
}

/**
 * Represents a video download item with its URL and ongoing status.
 */
export class VideoDownloadItem {
  url: string;
  ongoing: boolean;
  progress: number;

  constructor({
    url,
    ongoing = false,
    progress = 0,
  }: {
    url: string;
    ongoing?: boolean;
    progress?: number;
  }) {
    this.url = url;
    this.ongoing = ongoing;
    this.progress = progress;
  }

  get progressString(): string {
    const floored = Math.floor(this.progress * 10) / 10;
    return `  ${floored}%`;
  }

  get finished(): boolean {
    return this.progress >= 100;
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
    if (
      downloadItem instanceof VideoDownloadItem &&
      !downloadItem.ongoing &&
      !downloadItem.finished
    ) {
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
                ongoing: false,
              });
            }

            return item;
          });
        }
      });

      invoke<unknown>("download", {
        url: downloadItem.url,
        onEvent: channel,
      });

      setDownloadItem(
        new VideoDownloadItem({ ...downloadItem, ongoing: true })
      );
    }
  }, [downloadItem]);

  return {
    startDownload: (data: DownloadParameters) => {
      setDownloadItem(
        new VideoDownloadItem({
          url: data.url,
          ongoing: false,
        })
      );
    },

    downloadItem,
  };
};
