import {
  Button,
  Divider,
  Input,
  Progress,
  Select,
  SelectItem,
} from "@heroui/react";
import { OneColumnLayout } from "../layouts/one-column";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function DownloadPage() {
  const [progressValue, setProgressValue] = useState(0); // Example progress value, can be dynamic
  const [url, setUrl] = useState("");

  const handleFetch = () => {
    console.log("Fetching data for: ", url);
    invoke("fetch_data", { url: "https://example.com/api/data" })
      .then((response) => {
        console.log(response);
        // Update progress or handle response as needed
        setProgressValue(50); // Example: set to 50% after fetching
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
        <Select label="Audio" placeholder="Select format">
          <SelectItem key="mp3">MP3</SelectItem>
          <SelectItem key="mp4">MP4</SelectItem>
        </Select>
        <Select label="Video" placeholder="Select format">
          <SelectItem key="360p">360p</SelectItem>
          <SelectItem key="480p">480p</SelectItem>
          <SelectItem key="720p">720p</SelectItem>
          <SelectItem key="1080p">1080p</SelectItem>
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
