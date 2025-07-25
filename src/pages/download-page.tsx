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
import { useDownloadVideo } from "../hooks/download-video";

interface DownloadItem {
  readonly id: string;
  readonly label: string;
  readonly info: YtdlpFormat;
  progress: number;
}

export function DownloadPage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=Dl2vf04UCAM");
  const { audioFormats, videoFormats, videoTitle, setFetching, fetching } =
    useFetchVideoInfo(url);
  const { download, isDownloading, progress } = useDownloadVideo();

  const [selectedAudioFormat, setSelectedAudioFormat] = useState<Selection>(
    new Set([])
  );
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<Selection>(
    new Set([])
  );
  const [downloadItems, setDownloadsItems] = useState<DownloadItem[]>([]);
  const [downloadIndex, setDownloadIndex] = useState(0);
  // const curDownloadItem = useMemo(() => {
  //   return downloadItems[downloadIndex];
  // }, [downloadItems, downloadIndex]);

  useEffect(() => {
    if (progress === 100 && downloadIndex !== downloadItems.length - 1) {
      setDownloadIndex((prev) => prev + 1);
    }

    if (downloadItems[downloadIndex]) {
      downloadItems[downloadIndex].progress = progress;
    }
  }, [progress]);

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
      const audioFormat = selectedAudioFormat.values().next().value;
      const videoFormat = selectedVideoFormat.values().next().value;
      const audioInfo = audioFormats.find((f) => f.id === audioFormat);
      const videoInfo = videoFormats.find((f) => f.id === videoFormat);

      if (typeof audioFormat !== "string") {
        throw Error("Audio format not selected");
      }

      if (typeof videoFormat !== "string") {
        throw Error("Video format not selected");
      }

      if (audioInfo === undefined) {
        throw Error("Could not find audio format info for: " + audioFormat);
      }

      if (videoInfo === undefined) {
        throw Error("Could not find video format info for: " + videoFormat);
      }

      setDownloadsItems([
        { id: "audio", label: "Audio", info: audioInfo, progress: 0 },
        { id: "video", label: "Video", info: videoInfo, progress: 0 },
      ]);

      download({
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
        isDisabled={isDownloading || fetching}
      />
      <Divider className="my-6" />
      <DownloadOptions
        videoTitle={videoTitle}
        isDisabled={isDownloading || fetching}
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
          isDisabled={isDownloading || fetching}
        >
          Download
        </Button>
        <ProgressBar
          items={downloadItems}
          index={downloadIndex}
          state={isDownloading ? "downloading" : ""}
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
    item.filesize_conversion ? `\t|\t${item.filesize_conversion}` : ""
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
  items: DownloadItem[];
  index: number;
  state: "downloading" | "done" | "error" | "";
  error?: "string";
}

const ProgressBar = ({ state, error, items, index }: ProgressBarProps) => {
  const label = useMemo(() => {
    switch (state) {
      case "downloading":
        const item = items[index];
        return `Downloading ${index + 1}/${items.length} - ${item.label} - ${
          item.info.filesize_conversion
        }`;
      case "done":
        return "Download complete!";
      case "error":
        return "Error occurred.";
      case "":
        return "";
    }
  }, [state]);

  function getProgress(): number {
    const item = items[index];

    return item
      ? Math.round(
          (index / items.length + item.progress / (items.length * 100)) * 100
        )
      : 0;
  }

  return (
    <Progress
      aria-label={label === "" ? "Download progress bar" : label}
      color={typeof error === "string" ? "danger" : "success"}
      label={label}
      showValueLabel={true}
      size="md"
      value={getProgress()}
    />
  );
};
