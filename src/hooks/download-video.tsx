import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { DownloadEvent } from "../lib/download-engine";

/**
 * Interface for the download invocation parameters.
 */
interface DownloadInvokeParams {
  url: string;
  worstAudio: boolean;
  outputPath: string;
  videoHeight: VideoHeightValues;
  videoHeightConstraint: VideoHeightConstraintValues;
  onEvent: Channel<DownloadEvents>;
}

export type VideoHeightValues =
  | "144"
  | "240"
  | "360"
  | "480"
  | "720"
  | "1080"
  | "1440"
  | "2160";

export const VideoHeight: Record<VideoHeightValues, string> = {
  "144": "144p",
  "240": "240p",
  "360": "360p",
  "480": "480p",
  "720": "720p",
  "1080": "1080p",
  "1440": "2160p",
  "2160": "2160p",
};

export type VideoHeightConstraintValues = "=" | "<=" | ">=";

export const VideoHeightConstraint: Record<
  VideoHeightConstraintValues,
  string
> = {
  "=": "=",
  ">=": ">=",
  "<=": "<=",
};

export function isVideoHeight(value: any): value is VideoHeightValues {
  return !!VideoHeight[value as VideoHeightValues];
}

export function isVideoHeightConstraint(
  value: any
): value is VideoHeightConstraintValues {
  return !!VideoHeightConstraint[value as VideoHeightConstraintValues];
}

/**
 * Parameters required to start a video download.
 */
export class DownloadParameters {
  url: string;
  worstAudio: boolean;
  outputPath: string;
  videoHeight: VideoHeightValues;
  videoHeightConstraint: VideoHeightConstraintValues;

  constructor({
    url,
    worstAudio = false,
    outputPath = "",
    videoHeight = "360",
    videoHeightConstraint = "=",
  }: {
    url: string;
    worstAudio?: boolean;
    outputPath?: string;
    videoHeight?: VideoHeightValues;
    videoHeightConstraint?: VideoHeightConstraintValues;
  }) {
    this.url = url;
    this.worstAudio = worstAudio;
    this.outputPath = outputPath;
    this.videoHeight = videoHeight;
    this.videoHeightConstraint = videoHeightConstraint;
  }
}

/**
 * Statuses of a video download.
 *
 * - `"started"`: Download has started.
 * - `"finished"`: Download has finished without error.
 * - `"error"`: Download suffered and error and was cancelled.
 * - `""`: Download has not been started.
 */
type VideoDownloadItemStatus = "started" | "finished" | "error" | "";

export class VideoDownloadItemError {
  message: string;
  help: string;

  constructor({
    message = "",
    help = "",
  }: {
    message?: string;
    help?: string;
  }) {
    this.help = help;
    this.message = message;
  }
}

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

type DownloadEventStarted = DownloadEvent<"started", {}>;
type DownloadEventFinished = DownloadEvent<"finished", {}>;
type DownloadEventProgress = DownloadEvent<
  "progress",
  {
    progress: number;
  }
>;
type DownloadEventError = DownloadEvent<"error", VideoDownloadItemError>;
type DownloadEvents =
  | DownloadEventStarted
  | DownloadEventFinished
  | DownloadEventProgress
  | DownloadEventError;

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

      invoke<DownloadInvokeParams>("download", {
        url: downloadItem.parameters.url,
        worstAudio: downloadItem.parameters.worstAudio,
        outputPath: downloadItem.parameters.outputPath,
        videoHeight: downloadItem.parameters.videoHeight,
        videoHeightConstraint: downloadItem.parameters.videoHeightConstraint,
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
