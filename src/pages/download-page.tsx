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
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type MaybeNull<T> = NonNullable<T> | null;

interface YtdlpResponse {
  id: string;
  title: string;
  audio: YtdlpFormat[];
  video: YtdlpFormat[];
}

interface YtdlpFormat {
  audio_ext: string;
  ext: string;
  format_id: string;
  resolution: string;
  video_ext: string;
  abr: MaybeNull<number>;
  vbr: MaybeNull<number>;
  filesize: MaybeNull<number>;
  vcodec: string;
  protocol: string;
  fps: MaybeNull<number>;
  filesize_conversion: MaybeNull<string>;
}

interface YtdlpFormatItem extends YtdlpFormat {
  id: string;
}

export function DownloadPage() {
  const [progressValue, setProgressValue] = useState(0); // Example progress value, can be dynamic
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [audioFormats, setAudioFormats] = useState<YtdlpFormatItem[]>([]);
  const [videoFormats, setVideoFormats] = useState<YtdlpFormatItem[]>([]);
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<Selection>(
    new Set([])
  );
  const [selectedVideoFormat, setSelectedVideoFormat] = useState<Selection>(
    new Set([])
  );
  const [isFetchingFormats, setIsFetchingFormats] = useState(false);

  const handleFetch = () => {
    setIsFetchingFormats(true);
  };

  useEffect(() => {
    if (isFetchingFormats) {
      invoke<YtdlpResponse>("fetch_data", {
        url: url,
      })
        .then((response) => {
          setAudioFormats(
            response.audio.map((format) => ({
              ...format,
              id: format.format_id,
            }))
          );

          setVideoFormats(
            response.video.map((format) => ({
              ...format,
              id: format.format_id,
            }))
          );

          setVideoTitle(response.title);

          // Update progress or handle response as needed
          setProgressValue(50); // Example: set to 50% after fetching
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsFetchingFormats(false);
        });
    }

    return () => {};
  }, [isFetchingFormats]);

  function makeItemLabel(item: YtdlpFormatItem): string {
    return `${item.format_id} | ${item.ext} ${
      item.filesize_conversion ? `| ${item.filesize_conversion}` : ""
    }`;
  }

  return (
    <OneColumnLayout>
      <div className="text-black flex items-center gap-4">
        <Input label="URL" type="url" value={url} onValueChange={setUrl} />
        <Button color="primary" onPress={handleFetch}>
          Fetch
        </Button>
      </div>
      <Divider className="my-6" />
      <div className="text-black flex flex-col items-center gap-4">
        <Select
          label="Audio"
          placeholder="Select format"
          selectedKeys={selectedAudioFormat}
          onSelectionChange={setSelectedAudioFormat}
          items={audioFormats}
        >
          {(item) => {
            return <SelectItem>{makeItemLabel(item)}</SelectItem>;
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
            return <SelectItem>{makeItemLabel(item)}</SelectItem>;
          }}
        </Select>
        <Button color="primary" className="self-start">
          Download
        </Button>
      </div>
      <Divider className="my-6" />
      <Progress
        aria-label="Downloading..."
        color="success"
        label="Downloading..."
        showValueLabel={true}
        size="md"
        value={progressValue}
      />
    </OneColumnLayout>
  );
}
