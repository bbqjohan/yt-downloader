import { Button, ButtonProps, Input, InputProps } from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { useState } from "react";

import { useDownloadVideo } from "../hooks/download-video";

export function DownloadPage() {
  const [url, setUrl] = useState("https://www.youtube.com/watch?v=Dl2vf04UCAM");
  const downloadVideo = useDownloadVideo();

  const handleDownload = () => {
    downloadVideo.startDownload({ url });
  };

  return (
    <OneColumnLayout>
      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onDownload={handleDownload}
        isDisabled={downloadVideo.downloadItem?.ongoing || false}
      />
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
