import {
  Button,
  ButtonProps,
  Checkbox,
  Divider,
  Input,
  InputProps,
  Tab,
  Tabs,
} from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { useContext, useState } from "react";
import { Key } from "@react-types/shared";
import { useDownloadVideo, VideoDownloadItem } from "../hooks/download-video";
import { open } from "@tauri-apps/plugin-dialog";
import { DefaultsContext } from "../lib/default-options";

export function DownloadPage() {
  const defaults = useContext(DefaultsContext);
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=Dl2vf04UCAM");
  const [worstAudio, setWorstAudio] = useState(false);
  const [outputPath, setOutputPath] = useState(defaults.outputDir);
  const downloadVideo = useDownloadVideo();

  const handleDownload = () => {
    downloadVideo.startDownload({
      url,
      worstAudio,
      outputPath,
      videoResolution: defaults.videoResolution,
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
}

const SettingsSection = ({
  worstAudio,
  setWorstAudio,
  outputPath,
  setOutputPath,
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
        <div className="text-xs px-3">
          Any directory in the path that doesn't exist will be created.
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
