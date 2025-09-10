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
import { useState } from "react";

import { useDownloadVideo } from "../hooks/download-video";

export function DownloadPage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=Dl2vf04UCAM");
  const [worstAudio, setWorstAudio] = useState(false);
  const downloadVideo = useDownloadVideo();

  const handleDownload = () => {
    downloadVideo.startDownload({ url, worstAudio });
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
        {downloadVideo.downloadItem && (
          <div className="text-black">
            {downloadVideo.downloadItem.isFinished
              ? "Download finished!"
              : `Downloading... ${
                  downloadVideo.downloadItem.progressString || "0%"
                }`}
          </div>
        )}
        <Divider />
        <SettingsSection
          setWorstAudio={setWorstAudio}
          worstAudio={worstAudio}
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
}

const SettingsSection = ({
  worstAudio,
  setWorstAudio,
}: SettingsSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <AudioSettings worstAudio={worstAudio} setWorstAudio={setWorstAudio} />
    </div>
  );
};

interface AudioSettingsTabProps {
  worstAudio: boolean;
  setWorstAudio: (value: boolean) => void;
}

const AudioSettings = ({
  worstAudio,
  setWorstAudio,
}: AudioSettingsTabProps) => (
  <Tabs>
    <Tab key="audio" title="Audio settings">
      <div>
        <Checkbox isSelected={worstAudio} onValueChange={setWorstAudio}>
          Worst quality
        </Checkbox>
      </div>
    </Tab>
  </Tabs>
);
