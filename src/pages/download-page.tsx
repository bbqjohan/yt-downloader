import {
  Button,
  ButtonProps,
  Checkbox,
  cn,
  Divider,
  Input,
  InputProps,
  Select,
  SelectItem,
  SharedSelection,
  Tab,
  Tabs,
} from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { useContext, useState } from "react";
import { Key } from "@react-types/shared";
import {
  isVideoHeight,
  isVideoHeightConstraint,
  useDownloadVideo,
  VideoDownloadItem,
  VideoHeight,
  VideoHeightConstraint,
  VideoHeightValues,
} from "../hooks/download-video";
import { open } from "@tauri-apps/plugin-dialog";
import { DefaultsContext } from "../lib/default-options";

export function DownloadPage() {
  const defaults = useContext(DefaultsContext);
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=Dl2vf04UCAM");
  const [worstAudio, setWorstAudio] = useState(false);
  const [outputPath, setOutputPath] = useState(defaults.outputDir);
  const [videoHeight, setVideoHeight] = useState<SharedSelection>(
    new Set([defaults.videoHeight])
  );

  const [videoHeightConstraint, setVideoHeightConstraint] =
    useState<SharedSelection>(new Set([defaults.videoHeightConstraint]));

  const downloadVideo = useDownloadVideo();

  const handleDownload = () => {
    const vh =
      videoHeight instanceof Set ? videoHeight.values().next().value : "";
    const vhc =
      videoHeightConstraint instanceof Set
        ? videoHeightConstraint.values().next().value
        : "";

    if (!isVideoHeight(vh)) {
      throw Error(vh + " is not a legitimate video height.");
    }

    if (!isVideoHeightConstraint(vhc)) {
      throw Error(vhc + " is not a legitimate video height constraint.");
    }

    downloadVideo.startDownload({
      url,
      worstAudio,
      outputPath,
      videoHeight: vh,
      videoHeightConstraint: vhc,
    });
  };

  return (
    <OneColumnLayout>
      <div className="flex flex-col gap-4">
        <UrlInput
          url={url}
          onUrlChange={setUrl}
          onDownload={handleDownload}
          isDisabled={downloadVideo.downloadItem?.isStarted || false}
        />
        <DownloadProgress item={downloadVideo.downloadItem} />
        <DownloadError item={downloadVideo.downloadItem} />
        <Divider />
        <SettingsSection
          setWorstAudio={setWorstAudio}
          worstAudio={worstAudio}
          outputPath={outputPath}
          setOutputPath={setOutputPath}
          videoHeight={videoHeight}
          setVideoHeight={setVideoHeight}
          videoHeightConstraint={videoHeightConstraint}
          setVideoHeightConstraint={setVideoHeightConstraint}
        />
      </div>
    </OneColumnLayout>
  );
}

interface UrlInputProps {
  url: string;
  isDisabled: boolean;
  onDownload: ButtonProps["onPress"];
  onUrlChange: InputProps["onValueChange"];
}

const UrlInput = ({
  url,
  isDisabled,
  onDownload,
  onUrlChange,
}: UrlInputProps) => {
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
        <Button color="primary" onPress={onDownload} isDisabled={isDisabled}>
          Download
        </Button>
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  worstAudio: boolean;
  setWorstAudio: (value: boolean) => void;
  outputPath: string;
  setOutputPath: (value: string) => void;
  videoHeight: SharedSelection;
  setVideoHeight: (value: SharedSelection) => void;
  videoHeightConstraint: SharedSelection;
  setVideoHeightConstraint: (value: SharedSelection) => void;
}

const SettingsSection = ({
  worstAudio,
  setWorstAudio,
  outputPath,
  setOutputPath,
  videoHeight,
  setVideoHeight,
  videoHeightConstraint,
  setVideoHeightConstraint,
}: SettingsSectionProps) => {
  const [selectedTab, setSelectedTab] = useState<Key>("");

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        variant="underlined"
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
      >
        <Tab key="general" title="General settings">
          <GeneralSettings
            outputPath={outputPath}
            setOutputPath={setOutputPath}
          />
        </Tab>
        <Tab key="audio" title="Audio settings">
          <AudioSettings
            worstAudio={worstAudio}
            setWorstAudio={setWorstAudio}
          />
        </Tab>
        <Tab key="video" title="Video settings">
          <VideoSettings
            videoHeight={videoHeight}
            setVideoHeight={setVideoHeight}
            videoHeightConstraint={videoHeightConstraint}
            setVideoHeightConstraint={setVideoHeightConstraint}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

interface AudioSettingsProps {
  worstAudio: boolean;
  setWorstAudio: (value: boolean) => void;
}

const AudioSettings = ({ worstAudio, setWorstAudio }: AudioSettingsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <Checkbox isSelected={worstAudio} onValueChange={setWorstAudio}>
        Worst quality
      </Checkbox>
    </div>
  );
};

interface GeneralSettingsProps {
  outputPath: string;
  setOutputPath: (value: string) => void;
}

const GeneralSettings = ({
  outputPath,
  setOutputPath,
}: GeneralSettingsProps) => {
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

interface VideoSettingsProps {
  videoHeight: SharedSelection;
  setVideoHeight: (value: SharedSelection) => void;
  videoHeightConstraint: SharedSelection;
  setVideoHeightConstraint: (value: SharedSelection) => void;
}

const VideoSettings = ({
  videoHeight,
  setVideoHeight,
  videoHeightConstraint,
  setVideoHeightConstraint,
}: VideoSettingsProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="text-sm px-1">Video resolution</div>
        <div className="flex gap-4">
          <Select
            aria-label="Video resolution constraint"
            selectedKeys={videoHeightConstraint}
            onSelectionChange={setVideoHeightConstraint}
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
            selectedKeys={videoHeight}
            onSelectionChange={setVideoHeight}
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

const DownloadProgress = ({ item }: { item: VideoDownloadItem | null }) => {
  return item && !item.hasError ? (
    <div className="text-black">
      {item.isFinished
        ? "Download finished!"
        : `Downloading... ${item.progressString || "0%"}`}
    </div>
  ) : undefined;
};

const DownloadError = ({ item }: { item: VideoDownloadItem | null }) => {
  return item && item.hasError ? (
    <div className="bg-red-200 rounded-lg text-red-900 px-3 py-2 flex flex-col gap-4">
      <div>{`Error occurred: ${item.error.message}`}</div>
      {item.error.help && <div>{item.error.help}</div>}
    </div>
  ) : undefined;
};
