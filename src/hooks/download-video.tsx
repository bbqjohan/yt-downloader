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

  constructor({ url, ongoing = false }: { url: string; ongoing?: boolean }) {
    this.url = url;
    this.ongoing = ongoing;
  }
}

type DownloadEventStarted = DownloadEvent<"started", {}>;
type DownloadEventFinished = DownloadEvent<"finished", {}>;
type DownloadEvents = DownloadEventStarted | DownloadEventFinished;

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
    if (downloadItem instanceof VideoDownloadItem && !downloadItem.ongoing) {
      const channel = new Channel<DownloadEvents>((message) => {
        if (message.event === "started") {
          console.log("ITEM STARTED");
        } else if (message.event === "finished") {
          console.log("ITEM FINISHED");
          setDownloadItem(null);
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
