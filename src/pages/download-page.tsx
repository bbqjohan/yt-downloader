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
import { useEffect, useMemo, useState } from "react";
import { Channel, invoke } from "@tauri-apps/api/core";
import {
  useFetchVideoInfo,
  YtdlpFormatItem,
  YtdlpResponse,
} from "../hooks/fetch-video-info";

type DownloadEvent =
  | {
      event: "started";
      data: {
        url: string;
        downloadId: number;
        contentLength: number;
      };
    }
  | {
      event: "progress";
      data: {
        downloadId: number;
        output: string;
      };
    }
  | {
      event: "finished";
      data: {
        downloadId: number;
      };
    };

export function DownloadPage() {
  const [progressValue, setProgressValue] = useState(0); // Example progress value, can be dynamic
  const [url, setUrl] = useState("");
  const { audioFormats, videoFormats, videoTitle, setFetching } =
    useFetchVideoInfo(url);

  // const [videoTitle, setVideoTitle] = useState("");
  // const [audioFormats, setAudioFormats] = useState<YtdlpFormatItem[]>([]);
  // const [videoFormats, setVideoFormats] = useState<YtdlpFormatItem[]>([]);
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<Selection>(
    new Set([])
  );
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<Selection>(
    new Set([])
  );
  // const [isFetchingFormats, setIsFetchingFormats] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFetch = () => {
    setFetching(true);
  };

  const handleDownload = () => {
    setIsDownloading(true);
  };

  // useEffect(() => {
  //   if (isFetchingFormats) {
  //   }

  //   if (isDownloading) {
  //     console.log(
  //       "Invoking Downloading!",
  //       Array.from(selectedAudioFormat as Set<string>)[0],
  //       Array.from(selectedVideoFormat as Set<string>)[0]
  //     );
  //     const onEvent = new Channel<DownloadEvent>();
  //     onEvent.onmessage = (message) => {
  //       if (message.event === "progress") {
  //         function getPercentage(str: string): string | undefined {
  //           const result = /\d+(?:\.\d)*\%/.exec(str);
  //           return result ? result[0] : undefined;
  //         }
  //         function getSize(str: string): string | undefined {
  //           const result = /\d+\.\d+\w+\s/.exec(str);
  //           return result ? result[0] : undefined;
  //         }
  //         function getSpeed(str: string): string | undefined {
  //           const result = /\d+\.\d+\w+\/s/.exec(str);
  //           return result ? result[0].trim() : undefined;
  //         }

  //         const output = message.data.output;
  //         const percentage = getPercentage(output);
  //         const size = getSize(output);
  //         const speed = getSpeed(output);

  //         console.log(percentage, size, speed);

  //         if (typeof percentage === "string") {
  //           setProgressValue(parseFloat(percentage));
  //         }
  //       }
  //     };
  //     invoke<YtdlpResponse>("download", {
  //       // audioFormat: Array.from(selectedAudioFormat as Set<string>)[0],
  //       // videoFormat: Array.from(selectedVideoFormat as Set<string>)[0],
  //       onEvent,
  //     })
  //       .then((response) => {
  //         console.log("Download success");
  //         console.log(response);
  //       })
  //       .catch((error) => {
  //         console.log("Download error");
  //         console.error(error);
  //       })
  //       .finally(() => {
  //         setIsDownloading(false);
  //       });
  //   }

  //   return () => {};
  // }, [isFetchingFormats, isDownloading]);

  return (
    <OneColumnLayout>
      <div className="text-black flex items-center gap-4">
        <Input label="URL" type="url" value={url} onValueChange={setUrl} />
        <Button color="primary" onPress={handleFetch}>
          Fetch
        </Button>
      </div>
      <Divider className="my-6" />
      <DownloadOptions
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
        isDisabled={isDownloading}
      >
        Download
      </Button>
      <ProgressBar progress={progressValue} state="downloading" />
    </OneColumnLayout>
  );
}

// ===============================================================
// ===============================================================
// ===============================================================
// ===============================================================

interface DownloadOptionsProps {
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
