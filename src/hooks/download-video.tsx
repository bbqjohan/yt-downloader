import { Channel } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { SettingsSchema } from "../lib/fs/settings";
import {
  download,
  DownloadEvents,
  DownloadParameters,
  VideoDownloadItemError,
} from "../lib/commands";

/**
 * Statuses of a video download.
 *
 * - `"started"`: Download has started.
 * - `"finished"`: Download has finished without error.
 * - `"error"`: Download suffered and error and was cancelled.
 * - `""`: Download has not been started.
 */
type VideoDownloadItemStatus = "started" | "finished" | "error" | "";

/**
 * Represents a video download item with its URL and ongoing status.
 */
export class VideoDownloadItem {
  parameters: DownloadParameters;
  status: VideoDownloadItemStatus;
  progress: number;
  error: VideoDownloadItemError;

  constructor({
    parameters,
    status = "",
    progress = 0,
    error = new VideoDownloadItemError({}),
  }: {
    parameters: DownloadParameters;
    status?: VideoDownloadItemStatus;
    progress?: number;
    error?: VideoDownloadItemError;
  }) {
    this.parameters = parameters;
    this.status = status;
    this.progress = progress;
    this.error = error;
  }

  get progressString(): string {
    const floored = Math.floor(this.progress * 10) / 10;
    return `  ${floored}%`;
  }

  get isFinished(): boolean {
    return this.progress >= 100 && this.status === "finished";
  }

  get isStarted(): boolean {
    return this.status === "started";
  }

  get isNew(): boolean {
    return this.status === "";
  }

  get hasError(): boolean {
    return this.status === "error";
  }
}

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
        } else if (message.event === "error") {
          console.log("DOWNLOAD ERROR: ", message.data.message);

          setDownloadItem((item) => {
            if (item instanceof VideoDownloadItem) {
              return new VideoDownloadItem({
                ...item,
                status: "error",
                error: new VideoDownloadItemError({
                  message: message.data.message,
                  help: message.data.help,
                }),
              });
            }

            return item;
          });
        }
      });

      download<DownloadEvents>({
        ...downloadItem.parameters,
        onEvent: channel,
      });

      setDownloadItem(
        new VideoDownloadItem({ ...downloadItem, status: "started" })
      );
    }
  }, [downloadItem]);

  return {
    startDownload: (parameters: DownloadParameters) => {
      SettingsSchema.parse(parameters.settings);

      setDownloadItem(
        new VideoDownloadItem({
          parameters,
        })
      );
    },

    downloadItem,
  };
};
