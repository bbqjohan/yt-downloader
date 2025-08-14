import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { YtdlpFormatItem } from "./fetch-video-info";
import {
  DownloadEvent,
  DownloadItem,
  DownloadSpeed,
} from "../lib/download-engine";

interface DownloadParameters {
  url: string;
  outputDir: string;
  videoTitle: string;
  audioFormat: YtdlpFormatItem;
  videoFormat: YtdlpFormatItem;
}

export class VideoDownloadItem extends DownloadItem<DownloadParameters> {}

type DownloadEventStarted = DownloadEvent<"started", {}>;
type DownloadEventProgress = DownloadEvent<
  "progress",
  {
    output: string;
  }
>;
type DownloadEventFinished = DownloadEvent<"finished", {}>;
type DownloadEventAlreadyDownloaded = DownloadEvent<
  "alreadyDownloaded",
  {
    downloadId: string;
  }
>;

type DownloadEvents =
  | DownloadEventStarted
  | DownloadEventProgress
  | DownloadEventFinished
  | DownloadEventAlreadyDownloaded;

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

function createDownloadItem(data: DownloadParameters): VideoDownloadItem {
  return new DownloadItem({
    id: crypto.randomUUID(),
    label: data.videoTitle,
    params: data,
    children: [
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
  });
}

export const useDownloadVideo = () => {
  const [downloadParams, setDownloadParams] = useState(
    new Map<string, { id: string; params: DownloadParameters }>()
  );
  const [items, setItems] = useState(new Map<string, VideoDownloadItem>());
  const [queue, setQueue] = useState<VideoDownloadItem[]>([]);

  useEffect(() => {
    const _item = queue.at(0);
    const _params = _item ? downloadParams.get(_item.id) : undefined;

    if (_item && _params) {
      const channel = new Channel<DownloadEvents>((message) => {
        let changed = false;

        if (message.event === "progress") {
          console.log("progress:", message.data.output);

          const output = message.data.output;
          const percentage = getPercentage(output);
          const speed = getSpeed(output);

          if (typeof percentage === "string" && !isComplete(percentage)) {
            const progress = parseFloat(percentage);

            _item.updateProgress(progress);
            changed = true;
          }

          if (speed) {
            _item.speed = speed;
            changed = true;
          }
        } else if (message.event === "finished") {
          _item.ongoing = false;
          _item.speed = { rate: 0, size: "" };
          changed = true;
        } else if (message.event === "alreadyDownloaded") {
          _item.error =
            "Error: A file with this title and file extension has already been downloaded.";
          changed = true;
        }

        if (changed) {
          setItems((prev) => {
            return new Map(prev.set(_item.id, new DownloadItem({ ..._item })));
          });
        }
      });

      invoke<unknown>("download", {
        downloadId: _item.id,
        url: _params.params.url,
        outputDir: _params.params.outputDir,
        audioFormat: _params.params.audioFormat.format_id,
        videoFormat: _params.params.videoFormat.format_id,
        videoTitle: _params.params.videoTitle,
        onEvent: channel,
      });

      _item.ongoing = true;

      const newQueue = [...queue];
      newQueue.shift();

      setQueue(newQueue);
      setItems((prev) => {
        return new Map(prev.set(_item.id, new DownloadItem({ ..._item })));
      });
    }

    console.log("QUEUE:", queue);
  }, [queue]);

  return {
    download: (data: DownloadParameters) => {
      const item = createDownloadItem(data);

      setDownloadParams(
        (prev) => new Map(prev.set(item.id, { id: item.id, params: data }))
      );

      setItems((prev) => {
        return new Map(prev.set(item.id, item));
      });

      setQueue((prev) => {
        return [...prev, item];
      });
    },

    getParams: (itemId: string) => {
      return downloadParams.get(itemId);
    },

    items,
    isDownloading: false,
  };
};
