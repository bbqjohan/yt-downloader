import {
  Button,
  ButtonProps,
  Divider,
  Input,
  InputProps,
  Progress,
  Select,
  Selection,
  SelectItem,
} from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { useEffect, useMemo, useState } from "react";
import {
  useFetchVideoInfo,
  YtdlpFormat,
  YtdlpFormatItem,
} from "../hooks/fetch-video-info";
import { DownloadSpeed, useDownloadVideo } from "../hooks/download-video";
import { DownloadItem } from "../hooks/use-download-queue";

export function DownloadPage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=Dl2vf04UCAM");
  const { audioFormats, videoFormats, videoTitle, setFetching, fetching } =
    useFetchVideoInfo(url);
  const downloader = useDownloadVideo();

  const [selectedAudioFormat, setSelectedAudioFormat] = useState<Selection>(
    new Set([])
  );
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<Selection>(
    new Set([])
  );

  const handleFetch = () => {
    setFetching(true);
  };

  const handleDownload = () => {
    if (
      selectedAudioFormat instanceof Set &&
      selectedAudioFormat.size === 1 &&
      selectedVideoFormat instanceof Set &&
      selectedVideoFormat.size === 1
    ) {
      const audioId = selectedAudioFormat.values().next().value;
      const videoId = selectedVideoFormat.values().next().value;

      if (typeof audioId !== "string") {
        throw Error("Audio format not selected");
      }

      if (typeof videoId !== "string") {
        throw Error("Video format not selected");
      }

      const audioFormat = audioFormats.find((f) => f.id === audioId);
      const videoFormat = videoFormats.find((f) => f.id === videoId);

      if (audioFormat === undefined) {
        throw Error("Could not find audio format info for: " + audioId);
      }

      if (videoFormat === undefined) {
        throw Error("Could not find video format info for: " + videoId);
      }

      downloader.download({
        url,
        audioFormat,
        videoFormat,
      });
    }
  };

  return (
    <OneColumnLayout>
      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onFetch={handleFetch}
        isDisabled={downloader.isDownloading || fetching}
      />
      <Divider className="my-6" />
      <DownloadOptions
        videoTitle={videoTitle}
        isDisabled={downloader.isDownloading || fetching}
        audioFormats={audioFormats}
        videoFormats={videoFormats}
        selectedAudioFormat={selectedAudioFormat}
        selectedVideoFormat={selectedVideoFormat}
        setSelectedAudioFormat={setSelectedAudioFormat}
        setSelectedVideoFormat={setSelectedVideoFormat}
      />
      <Divider className="my-6" />
      <div className="flex flex-col gap-4">
        <Button
          color="primary"
          className="self-start"
          onPress={handleDownload}
          isDisabled={downloader.isDownloading || fetching}
        >
          Download
        </Button>
        <ProgressBar
          progress={downloader.queue.progress}
          genLabel={() => {
            const item = downloader.queue.current;

            if (!item) {
              return "";
            }

            let label = item.label;

            if (item.filesize) {
              label += ` - ${item.filesize}`;
            }

            if (downloader.speed) {
              label += ` - ${downloader.speed.rate} ${downloader.speed.size}`;
            }

            return label;
          }}
        />
      </div>
    </OneColumnLayout>
  );
}

// ===============================================================
// ===============================================================
// ===============================================================
// ===============================================================

interface UrlInputProps {
  url: string;
  isDisabled: boolean;
  onFetch: ButtonProps["onPress"];
  onUrlChange: InputProps["onValueChange"];
}

const UrlInput = ({ url, isDisabled, onFetch, onUrlChange }: UrlInputProps) => {
  return (
    <div className="text-black flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          label="URL"
          type="url"
          value={url}
          onValueChange={onUrlChange}
          isDisabled={isDisabled}
        />
        <Button color="primary" onPress={onFetch} isDisabled={isDisabled}>
          Get info
        </Button>
      </div>
    </div>
  );
};

// ===============================================================
// ===============================================================
// ===============================================================
// ===============================================================

interface DownloadOptionsProps {
  isDisabled: boolean;
  videoFormats: YtdlpFormatItem[];
  audioFormats: YtdlpFormatItem[];
  selectedAudioFormat: Selection;
  selectedVideoFormat: Selection;
  videoTitle: string;
  setSelectedAudioFormat: React.Dispatch<React.SetStateAction<Selection>>;
  setSelectedVideoFormat: React.Dispatch<React.SetStateAction<Selection>>;
}

function makeFormatLabel(item: YtdlpFormatItem): string {
  return `${item.format_id}\t|\t${item.ext}${
    item.filesize ? `\t|\t${item.filesize}` : ""
  }${item.resolution !== "audio only" ? `\t|\t${item.resolution}` : ""}`;
}

const DownloadOptions = ({
  isDisabled,
  videoFormats,
  audioFormats,
  selectedAudioFormat,
  selectedVideoFormat,
  videoTitle,
  setSelectedAudioFormat,
  setSelectedVideoFormat,
}: DownloadOptionsProps) => {
  return (
    <div className="text-black flex flex-col gap-4">
      <div>Title: {videoTitle}</div>
      <Select
        label="Audio"
        placeholder="Select format"
        selectedKeys={selectedAudioFormat}
        onSelectionChange={setSelectedAudioFormat}
        items={audioFormats}
        isDisabled={isDisabled}
      >
        {(item) => {
          return <SelectItem>{makeFormatLabel(item)}</SelectItem>;
        }}
      </Select>
      <Select
        label="Video"
        placeholder="Select format"
        selectedKeys={selectedVideoFormat}
        onSelectionChange={setSelectedVideoFormat}
        items={videoFormats}
        isDisabled={isDisabled}
      >
        {(item) => {
          return <SelectItem>{makeFormatLabel(item)}</SelectItem>;
        }}
      </Select>
    </div>
  );
};

// ===============================================================
// ===============================================================
// ===============================================================
// ===============================================================

interface ProgressBarProps {
  progress: number;
  genLabel: () => string;
}

const ProgressBar = ({ progress, genLabel }: ProgressBarProps) => {
  return (
    <Progress
      aria-label={"Download progress bar"}
      color={"success"}
      label={genLabel()}
      showValueLabel={true}
      size="md"
      value={progress}
    />
  );
};
