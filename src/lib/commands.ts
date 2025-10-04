import { Channel, invoke } from "@tauri-apps/api/core";
import { Settings } from "./fs/settings";
import { DownloadSliceData } from "../store/app";
import { DownloadEvent } from "../lib/download-engine";

/**
 * Interface for the download invocation parameters.
 */
interface DownloadInvokeParams<T> extends DownloadParameters {
  onEvent: Channel<T>;
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
export type DownloadEvents =
  | DownloadEventStarted
  | DownloadEventFinished
  | DownloadEventProgress
  | DownloadEventError;

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
 * Parameters required to start a video download.
 */
export class DownloadParameters {
  item: DownloadSliceData;
  settings: Settings;

  constructor({
    item,
    settings,
  }: {
    item: DownloadSliceData;
    settings: Settings;
  }) {
    this.item = item;
    this.settings = settings;
  }
}

export function download<T>(parameters: DownloadInvokeParams<T>) {
  invoke<DownloadInvokeParams<T>>("download", {
    parameters: {
      ...parameters,
    },
    onEvent: parameters.onEvent,
  });
}
