import {
  Button,
  ButtonProps,
  Checkbox,
  Divider,
  Input,
  Select,
  SelectItem,
  SharedSelection,
  Tab,
  Tabs,
} from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { memo, useCallback, useContext, useMemo, useState } from "react";
import { Key } from "@react-types/shared";
import {
  isVideoHeight,
  isVideoHeightConstraint,
  useDownloadVideo,
  VideoDownloadItem,
} from "../hooks/download-video";
import { open } from "@tauri-apps/plugin-dialog";
import { DefaultsContext } from "../lib/default-options";
import { useStore } from "../store/store";

export function DownloadPage() {
  const defaults = useContext(DefaultsContext);
  const url = useStore((state) => state.app.url);
  const isWorstQuality = useStore(
    (state) => state.settings.audio.isWorstQuality
  );
  const outputPath = useStore((state) => state.settings.general.outputPath);
  const videoHeight = useStore((state) => state.settings.video.height);
  const videoHeightConstraint = useStore(
    (state) => state.settings.video.heightConstraint
  );

  const downloadVideo = useDownloadVideo();

  const handleDownload = () => {
    if (!isVideoHeight(videoHeight)) {
      throw Error(videoHeight + " is not a legitimate video height.");
    }

    if (!isVideoHeightConstraint(videoHeightConstraint)) {
      throw Error(
        videoHeightConstraint + " is not a legitimate video height constraint."
      );
    }

    downloadVideo.startDownload({
      url,
      worstAudio: isWorstQuality,
      outputPath,
      videoHeight,
      videoHeightConstraint,
    });
  };

  return (
    <OneColumnLayout>
      <div className="flex flex-col gap-4">
        <UrlInput
          onDownload={handleDownload}
          isDisabled={downloadVideo.downloadItem?.isStarted || false}
        />
        <DownloadProgress item={downloadVideo.downloadItem} />
        <DownloadError item={downloadVideo.downloadItem} />
        <Divider />
        <SettingsSection />
      </div>
    </OneColumnLayout>
  );
}

interface UrlInputProps {
  isDisabled: boolean;
  onDownload: ButtonProps["onPress"];
}

const UrlInput = ({ isDisabled, onDownload }: UrlInputProps) => {
  const { url, setUrl } = useStore((state) => state.app);

  return (
    <div className="text-black flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          label="URL"
          type="url"
          value={url}
          onValueChange={setUrl}
          isDisabled={isDisabled}
        />
        <Button color="primary" onPress={onDownload} isDisabled={isDisabled}>
          Download
        </Button>
      </div>
    </div>
  );
};

const SettingsSection = () => {
  const [selectedTab, setSelectedTab] = useState<Key>("");

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        variant="underlined"
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
      >
        <Tab key="general" title="General settings">
          <GeneralSettings />
        </Tab>
        <Tab key="audio" title="Audio settings">
          <AudioSettings />
        </Tab>
        <Tab key="video" title="Video settings">
          <VideoSettings />
        </Tab>
      </Tabs>
    </div>
  );
};

const AudioSettings = () => {
  const { isWorstQuality, setIsWorstQuality } = useStore(
    (state) => state.settings.audio
  );

  return (
    <div className="flex flex-col gap-4">
      <Checkbox isSelected={isWorstQuality} onValueChange={setIsWorstQuality}>
        Worst quality
      </Checkbox>
    </div>
  );
};

const GeneralSettings = () => {
  const { outputPath, setOutputPath } = useStore(
    (state) => state.settings.general
  );

  const handleOutputPathSelect = async () => {
    const file = await open({
      multiple: false,
      directory: true,
    });

    if (file) {
      setOutputPath(file);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-4">
          <Input
            label="Output directory"
            value={outputPath}
            onValueChange={setOutputPath}
          />
          <Button onPress={handleOutputPathSelect}>Select</Button>
        </div>
        <div className="text-xs px-1">
          Any directory in the path that doesn't exist will be created.
        </div>
      </div>
    </div>
  );
};

const VideoSettings = () => {
  const { height, setHeight, heightConstraint, setHeightConstraint } = useStore(
    (state) => state.settings.video
  );
  const _height = useMemo(() => [height], [height]);
  const _heightConstraint = useMemo(
    () => [heightConstraint],
    [heightConstraint]
  );

  const handleVideoHeight = useCallback((value: SharedSelection) => {
    if (value instanceof Set) {
      const v = value.values().next().value;

      if (typeof v === "string") {
        setHeight(v);
      }
    }
  }, []);

  const handleVideoHeightConstraint = useCallback((value: SharedSelection) => {
    if (value instanceof Set) {
      const v = value.values().next().value;

      if (typeof v === "string") {
        setHeightConstraint(v);
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="text-sm px-1">Video resolution</div>
        <div className="flex gap-4">
          <Select
            aria-label="Video resolution constraint"
            selectedKeys={_heightConstraint}
            onSelectionChange={handleVideoHeightConstraint}
            classNames={{
              base: "flex-1 min-w-20",
            }}
          >
            <SelectItem key="=">=</SelectItem>
            <SelectItem key="<=">{"<="}</SelectItem>
            <SelectItem key=">=">{">="}</SelectItem>
          </Select>
          <Select
            aria-label="Video resolution"
            selectedKeys={_height}
            onSelectionChange={handleVideoHeight}
          >
            <SelectItem key="144">144p</SelectItem>
            <SelectItem key="240">240p</SelectItem>
            <SelectItem key="360">360p</SelectItem>
            <SelectItem key="480">480p</SelectItem>
            <SelectItem key="720">720p</SelectItem>
            <SelectItem key="1080">1080p</SelectItem>
            <SelectItem key="1440">1440p</SelectItem>
            <SelectItem key="2160">2160p</SelectItem>
          </Select>
        </div>
        <div className="text-xs px-1">
          Not all videos have all resolutions available. The selected resolution
          will be used if available, otherwise, the closest available resolution
          will be chosen based on your constraint.
        </div>
      </div>
    </div>
  );
};

const DownloadProgress = memo(
  ({ item }: { item: VideoDownloadItem | null }) => {
    return item && !item.hasError ? (
      <div className="text-black">
        {item.isFinished
          ? "Download finished!"
          : `Downloading... ${item.progressString || "0%"}`}
      </div>
    ) : undefined;
  }
);

const DownloadError = ({ item }: { item: VideoDownloadItem | null }) => {
  return item && item.hasError ? (
    <div className="bg-red-200 rounded-lg text-red-900 px-3 py-2 flex flex-col gap-4">
      <div>{`Error occurred: ${item.error.message}`}</div>
      {item.error.help && <div>{item.error.help}</div>}
    </div>
  ) : undefined;
};
