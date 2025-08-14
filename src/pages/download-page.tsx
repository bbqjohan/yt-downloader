import {
  Button,
  ButtonProps,
  Checkbox,
  Divider,
  Input,
  InputProps,
  Progress,
  Select,
  Selection,
  SelectItem,
} from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { useCallback, useEffect, useState } from "react";
import { useFetchVideoInfo, YtdlpFormatItem } from "../hooks/fetch-video-info";
import { useDownloadVideo, VideoDownloadItem } from "../hooks/download-video";
import { open } from "@tauri-apps/plugin-dialog";
import clsx from "clsx";

export function DownloadPage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=Dl2vf04UCAM");
  const { videoInfo, setFetching, fetching } = useFetchVideoInfo(url);
  const downloader = useDownloadVideo();
  const [customVideoTitle, setCustomVideoTitle] = useState("");

  const [selectedAudioFormat, setSelectedAudioFormat] = useState<Selection>(
    new Set([])
  );
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<Selection>(
    new Set([])
  );
  const [preferWorstAudio, setPreferWorstAudio] = useState(true);
  const [preferWorstVideo, setPreferWorstVideo] = useState(true);

  const [outputDir, setOutputDir] = useState(window.defaultOutputDir);

  const handleFetch = () => {
    setFetching(true);
  };

  useEffect(() => {
    if (videoInfo) {
      setCustomVideoTitle(videoInfo.videoTitle);
    }
  }, [videoInfo]);

  const handleDownload = () => {
    if (
      (selectedAudioFormat instanceof Set &&
        selectedAudioFormat.size === 1 &&
        selectedVideoFormat instanceof Set &&
        selectedVideoFormat.size === 1) ||
      true
    ) {
      // const audioId = selectedAudioFormat.values().next().value;
      // const videoId = selectedVideoFormat.values().next().value;

      // if (typeof audioId !== "string") {
      //   throw Error("Audio format not selected");
      // }

      // if (typeof videoId !== "string") {
      //   throw Error("Video format not selected");
      // }

      // const audioFormat = audioFormats.find((f) => f.id === audioId);
      // const videoFormat = videoFormats.find((f) => f.id === videoId);

      // if (audioFormat === undefined) {
      //   throw Error("Could not find audio format info for: " + audioId);
      // }

      // if (videoFormat === undefined) {
      //   throw Error("Could not find video format info for: " + videoId);
      // }

      if (!customVideoTitle) {
        throw Error("Video title is not set");
      }

      if (!outputDir) {
        throw Error("Output directory is not set");
      }

      if (preferWorstAudio && preferWorstVideo) {
        const af = videoInfo?.audioFormats.at(0);
        const vf = videoInfo?.videoFormats.at(0);

        if (af) {
          af.format_id = "wa";
        }

        if (preferWorstVideo) {
          if (vf) {
            vf.format_id = "wv";
          }
        }

        if (af && vf) {
          downloader.download({
            url,
            videoTitle: customVideoTitle,
            audioFormat: af,
            videoFormat: vf,
            outputDir,
          });
        }
      }
    }
  };

  const onRedownload = useCallback(
    (itemId: string) => {
      const item = downloader.items.get(itemId);

      if (item && item.params) {
        downloader.download(item.params);
      }
    },
    [downloader.items]
  );

  const resetVideoTitle = useCallback(() => {
    if (videoInfo) {
      setCustomVideoTitle(videoInfo.videoTitle);
    }
  }, [videoInfo?.videoTitle]);

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
        videoTitle={customVideoTitle}
        isDisabled={downloader.isDownloading || fetching}
        audioFormats={videoInfo?.audioFormats || []}
        videoFormats={videoInfo?.videoFormats || []}
        selectedAudioFormat={selectedAudioFormat}
        selectedVideoFormat={selectedVideoFormat}
        outputDir={outputDir}
        onOutputChange={setOutputDir}
        setSelectedAudioFormat={setSelectedAudioFormat}
        setSelectedVideoFormat={setSelectedVideoFormat}
        preferWorstAudio={preferWorstAudio}
        preferWorstVideo={preferWorstVideo}
        onPreferWorstAudio={setPreferWorstAudio}
        onPreferWorstVideo={setPreferWorstVideo}
        onVideoTitle={setCustomVideoTitle}
        onUseDefaultVideoTitle={resetVideoTitle}
        onDownload={handleDownload}
      />
      <div className="flex flex-col gap-4">
        <Divider className="my-6" />
        <ProgressList
          items={Array.from(downloader.items.values())}
          onRedownload={onRedownload}
        ></ProgressList>
      </div>
    </OneColumnLayout>
  );
}

const ProgressList = ({
  items,
  onRedownload,
}: {
  items: VideoDownloadItem[];
  onRedownload: (itemId: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        return (
          <div className={clsx("flex flex-col gap-4")} key={item.id}>
            {typeof item.error === "string" ? (
              <div className="text-white bg-red-500 py-2 px-3 rounded">
                {item.error}
              </div>
            ) : null}
            <Progress
              aria-label={"Download progress bar"}
              color={"success"}
              label={" " + item.label}
              showValueLabel={true}
              size="md"
              value={item.progress}
            />
            <div className="flex gap-4">
              <Button
                onPress={() => {
                  onRedownload(item.id);
                }}
                isDisabled={!item.done}
              >
                Re-Download
              </Button>
            </div>
            <Divider />
          </div>
        );
      })}
    </div>
  );
};

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
  outputDir: string;
  setSelectedAudioFormat: React.Dispatch<React.SetStateAction<Selection>>;
  setSelectedVideoFormat: React.Dispatch<React.SetStateAction<Selection>>;
  onOutputChange: React.Dispatch<React.SetStateAction<string>>;
  preferWorstAudio: boolean;
  preferWorstVideo: boolean;
  onPreferWorstAudio: React.Dispatch<React.SetStateAction<boolean>>;
  onPreferWorstVideo: React.Dispatch<React.SetStateAction<boolean>>;
  onVideoTitle: React.Dispatch<React.SetStateAction<string>>;
  onUseDefaultVideoTitle: () => void;
  onDownload: () => void;
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
  outputDir,
  setSelectedAudioFormat,
  setSelectedVideoFormat,
  onOutputChange,
  preferWorstAudio,
  preferWorstVideo,
  onPreferWorstAudio,
  onPreferWorstVideo,
  onVideoTitle,
  onUseDefaultVideoTitle,
  onDownload,
}: DownloadOptionsProps) => {
  async function handleOutputDir() {
    const path = await open({
      directory: true,
      multiple: false,
      title: "Select output directory",
    });

    if (typeof path === "string") {
      onOutputChange(path);
    }
  }

  const onOutputDirKeyDown: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback((e) => {
      if (e.key === "Enter" || e.key === " ") {
        handleOutputDir();
      }
    }, []);

  return (
    <div className="text-black flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        {" "}
        <Input
          label="Video title"
          value={videoTitle}
          onValueChange={onVideoTitle}
        />
        <Button onPress={onUseDefaultVideoTitle}>Use default</Button>
      </div>

      <Input
        label="Output Directory"
        value={outputDir}
        readOnly
        onClick={handleOutputDir}
        onKeyDown={onOutputDirKeyDown}
      />
      <Checkbox
        value="wa"
        onValueChange={onPreferWorstAudio}
        isSelected={preferWorstAudio}
      >
        Prefer worst audio quality
      </Checkbox>
      <Checkbox
        value="wv"
        onValueChange={onPreferWorstVideo}
        isSelected={preferWorstVideo}
      >
        Prefer worst video quality
      </Checkbox>
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
      <Button
        color="primary"
        className="self-start"
        onPress={onDownload}
        isDisabled={isDisabled}
      >
        Download
      </Button>
    </div>
  );
};
