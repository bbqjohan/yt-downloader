import { Button, Input } from "@heroui/react";
import { open } from "@tauri-apps/plugin-dialog";
import "./video-output-path.css";
import { useCheckOutputPath } from "../hooks/check-output-path";

export const VideoOutputPath = ({
  value,
  setValue,
}: {
  value: string;
  setValue: (value: string) => void;
}) => {
  const checkPath = useCheckOutputPath(value);

  const handleOutputPathSelect = async () => {
    const dirPath = await open({
      multiple: false,
      directory: true,
    });

    if (dirPath) {
      setValue(dirPath);
    }
  };

  return (
    <div className="flex gap-4">
      <Input
        value={value}
        onValueChange={setValue}
        errorMessage={checkPath.error}
        isInvalid={checkPath.error !== ""}
        description="To what directory the video will be downloaded to. Any directory in the path that doesn't exist will be created."
      />
      <Button onPress={handleOutputPathSelect} variant="solid" color="primary">
        <div className="flex flex-col items-centers justify-center">
          {checkPath.isCheckingPath ? (
            <div className="loader scale-150"></div>
          ) : (
            "Select"
          )}
        </div>
      </Button>
    </div>
  );
};
