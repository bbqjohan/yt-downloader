import { Channel, invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
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

function getSpeed(str: string): DownloadSpeed | undefined {
  const result = /(\d+\.\d+)(\w+\/s)/.exec(str);
  return result ? { rate: parseFloat(result[1]), size: result[2] } : undefined;
}

function isComplete(str: string): boolean {
  // When reaching 100%, two outputs will come from backend. One with the progress of the
  // download, "100.0%", and one with "100%". The second is treated as download complete.
  return str === "100%";
}

function createDownloadItem(data: DownloadParameters): DownloadItem {
  return new DownloadItem({
    id: data.url,
    label: data.videoTitle,
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
  });
}

interface Action {
  id: string;
  item: DownloadItem;
  state: "downloading" | "finished";
  channel: Channel<DownloadEvents>;
  promise: Promise<unknown>;
}

export const useDownloadVideo = () => {
  const [downloadParams, setDownloadParams] = useState(
    new Map<string, { id: string; params: DownloadParameters }>()
  );
  const [actions, setActions] = useState(new Map<string, Action>());
  const isDownloading = useMemo(() => {
    for (const [_, value] of actions) {
      if (!value.item.done) {
        return true;
      }
    }

    return false;
  }, [actions]);

  useEffect(() => {
    const params = Array.from(downloadParams.values()).at(-1);

    if (
      params &&
      (!actions.has(params.id) ||
        actions.get(params.id)?.state !== "downloading")
    ) {
      const item = createDownloadItem(params.params);
      const channel = new Channel<DownloadEvents>((message) => {
        if (message.event === "progress") {
          const output = message.data.output;
          const percentage = getPercentage(output);
          const speed = getSpeed(output);

          if (typeof percentage === "string" && !isComplete(percentage)) {
            const progress = parseFloat(percentage);

            item.updateProgress(progress);

            setActions(
              (prev) => new Map(prev.set(action.id, { ...action, item }))
            );
          }

          if (typeof speed === "string") {
            item.speed = speed;
            setActions(
              (prev) => new Map(prev.set(action.id, { ...action, item }))
            );
          }
        } else if (message.event === "finished") {
          setActions((prev) => {
            return new Map(
              prev.set(action.id, { ...action, state: "finished" })
            );
          });
        }
      });

      const action: Action = {
        id: params.id,
        item,
        channel,
        state: "downloading",
        promise: invoke<unknown>("download", {
          url: params.params.url,
          outputDir: params.params.outputDir,
          audioFormat: params.params.audioFormat.format_id,
          videoFormat: params.params.videoFormat.format_id,
          onEvent: channel,
        }),
      };

      setActions((prev) => new Map(prev.set(action.id, action)));
    }
  }, [downloadParams]);

  return {
    download: (data: DownloadParameters) => {
      setDownloadParams(
        (prev) => new Map(prev.set(data.url, { id: data.url, params: data }))
      );
    },

    getParams: (itemId: string) => {
      return downloadParams.get(itemId);
    },

    actions,
    isDownloading,
  };
};
