import {
  Button,
  Divider,
  Input,
  Progress,
  Select,
  Selection,
  SelectItem,
} from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { useMemo, useState } from "react";
import { useFetchVideoInfo, YtdlpFormatItem } from "../hooks/fetch-video-info";
import { useDownloadVideo } from "../hooks/download-video";

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
      download({
        url,

        // Only one selection is allowed per format, so it's safe to assume a string since that's
        // the only value type that can be set using the GUI.
        audioFormat: selectedAudioFormat.values().next().value as string,
        videoFormat: selectedVideoFormat.values().next().value as string,
      });
    }
  };

  return (
    <OneColumnLayout>
      <div className="text-black flex items-center gap-4">
        <Input
          label="URL"
          type="url"
          value={url}
          onValueChange={setUrl}
          isDisabled={isDownloading || fetching}
        />
        <Button
          color="primary"
          onPress={handleFetch}
          isDisabled={isDownloading || fetching}
        >
          Fetch
        </Button>
      </div>
      <Divider className="my-6" />
      <DownloadOptions
        isDisabled={isDownloading || fetching}
        audioFormats={audioFormats}
        videoFormats={videoFormats}
        selectedAudioFormat={selectedAudioFormat}
        selectedVideoFormat={selectedVideoFormat}
        setSelectedAudioFormat={setSelectedAudioFormat}
        setSelectedVideoFormat={setSelectedVideoFormat}
      />
      <Divider className="my-6" />
      <Button
        color="primary"
        className="self-start"
        onPress={handleDownload}
        isDisabled={isDownloading || fetching}
      >
        Download
      </Button>
      <ProgressBar progress={progress} state="downloading" />
    </OneColumnLayout>
  );
}

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
  setSelectedAudioFormat,
  setSelectedVideoFormat,
}: DownloadOptionsProps) => {
  return (
    <div className="text-black flex flex-col items-center gap-4">
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
  state: "downloading" | "done" | "error" | "";
  error?: "string";
}

const ProgressBar = ({ progress, state, error }: ProgressBarProps) => {
  const label = useMemo(() => {
    switch (state) {
      case "downloading":
        return "Downloading...";
      case "done":
        return "Download complete!";
      case "error":
        return "Error occurred.";
      case "":
        return "";
    }
  }, [state]);

  return (
    <Progress
      aria-label={label}
      color={typeof error === "string" ? "danger" : "success"}
      label={label}
      showValueLabel={true}
      size="md"
      value={progress}
    />
  );
};
