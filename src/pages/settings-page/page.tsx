import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  SharedSelection,
  Tab,
  Tabs,
  TabsProps,
} from "@heroui/react";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { useStore as usePageStore, createStore } from "./store";
import { useStores } from "../../store/stores";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Key } from "@react-types/shared";
import {
  VideoHeightConstraints,
  VideoHeights,
  VideoSettingsSchema,
} from "../../lib/fs/settings";
import { ZodError } from "zod";
import { open } from "@tauri-apps/plugin-dialog";
import { stat } from "@tauri-apps/plugin-fs";
import "./css.css";

createStore();

export function DefaultSettingsPage() {
  const [selectedTab, setSelectedTab] = useState<Key>("general");

  return (
    <div className="grid grid-rows-[4rem_1fr] grid-cols-[200px_1fr] w-full max-w-4xl h-screen">
      <div className="flex col-span-2 p-4">{/* Top bar */}</div>
      <Sidebar selectedKey={selectedTab} onSelectionChange={setSelectedTab} />
      <Content selectedTab={selectedTab} />
    </div>
  );
}

const Sidebar = ({
  selectedKey,
  onSelectionChange,
}: {
  selectedKey: TabsProps["selectedKey"];
  onSelectionChange: TabsProps["onSelectionChange"];
}) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Tabs
        variant="light"
        selectedKey={selectedKey}
        onSelectionChange={onSelectionChange}
        isVertical
        classNames={{
          tab: "justify-start",
        }}
      >
        <Tab key="general" title="General settings"></Tab>
        <Tab key="audio" title="Audio settings"></Tab>
        <Tab key="video" title="Video settings"></Tab>
      </Tabs>
    </div>
  );
};

const Content = ({
  selectedTab,
}: {
  selectedTab: TabsProps["selectedKey"];
}) => {
  return (
    (selectedTab === "audio" && <AudioSettings />) ||
    (selectedTab === "general" && <GeneralSettings />) ||
    (selectedTab === "video" && <VideoSettings />)
  );
};

const AudioSettings = () => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      {/* Content */}
      <h1 className="text-2xl">Default audio settings</h1>
      <AudioQuality />
    </div>
  );
};

const AudioQuality = () => {
  const { isWorstQuality, setIsWorstQuality } = usePageStore(
    (state) => state.audio
  );
  const isWorstQualityChanged = usePageStore((s) =>
    s.audio.hasIsWorstQualityChanged()
  );
  const isWorstQualityOg = useStores().settings((s) => s.audio.isWorstQuality);

  const resetIsWorstAudioQuality = () => {
    setIsWorstQuality(isWorstQualityOg);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="text-sm px-1">Audio quality</div>
        {isWorstQualityChanged && (
          <Button isIconOnly variant="light" onPress={resetIsWorstAudioQuality}>
            <BsArrowCounterclockwise />
          </Button>
        )}
      </div>
      <div className="flex gap-4">
        <Checkbox isSelected={isWorstQuality} onValueChange={setIsWorstQuality}>
          Worst quality
        </Checkbox>
      </div>
    </div>
  );
};

const VideoSettings = () => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      {/* Content */}
      <h1 className="text-2xl">Default video settings</h1>
      <VideoHeight />
      <VideoHeightContraint />
    </div>
  );
};

const VideoHeight = () => {
  const { height, setHeight } = usePageStore((state) => state.video);
  const hasChanged = usePageStore((s) => s.video.hasHeightChanged());
  const originalVal = useStores().settings((s) => s.video.height);
  const selValue = useMemo(() => [height], [height]);
  const error = useMemo(() => {
    return VideoSettingsSchema.shape.height.safeParse(height).error instanceof
      ZodError
      ? "This is not a valid video resolution!"
      : "";
  }, [height]);

  const reset = () => {
    setHeight(originalVal);
  };

  const handleSelection = useCallback((value: SharedSelection) => {
    if (value instanceof Set) {
      setHeight(value.values().next().value as VideoHeights);
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="text-sm px-1">Video resoultion</div>
        {hasChanged && (
          <Button isIconOnly variant="light" onPress={reset}>
            <BsArrowCounterclockwise />
          </Button>
        )}
      </div>
      <div className="flex gap-4">
        <Select
          aria-label="Video resolution"
          selectedKeys={selValue}
          onSelectionChange={handleSelection}
          isInvalid={Boolean(error)}
          errorMessage={error}
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
    </div>
  );
};

const VideoHeightContraint = () => {
  const { heightConstraint, setHeightConstraint } = usePageStore(
    (state) => state.video
  );
  const hasChanged = usePageStore((s) => s.video.hasHeightConstraintChanged());
  const originalVal = useStores().settings((s) => s.video.heightConstraint);
  const selValue = useMemo(() => [heightConstraint], [heightConstraint]);
  const error = useMemo(() => {
    return VideoSettingsSchema.shape.heightConstraint.safeParse(
      heightConstraint
    ).error instanceof ZodError
      ? "This is not a valid video constraint!"
      : "";
  }, [heightConstraint]);

  const reset = () => {
    setHeightConstraint(originalVal);
  };

  const handleSelection = useCallback((value: SharedSelection) => {
    if (value instanceof Set) {
      setHeightConstraint(
        value.values().next().value as VideoHeightConstraints
      );
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="text-sm px-1">Video resoultion constraint</div>
        {hasChanged && (
          <Button isIconOnly variant="light" onPress={reset}>
            <BsArrowCounterclockwise />
          </Button>
        )}
      </div>
      <div className="flex gap-4">
        <Select
          aria-label="Video resolution constraint"
          selectedKeys={selValue}
          onSelectionChange={handleSelection}
          classNames={{
            base: "flex-1 min-w-32",
          }}
          errorMessage={error}
          isInvalid={Boolean(error)}
        >
          <SelectItem key="=">=</SelectItem>
          <SelectItem key="<=">{"<="}</SelectItem>
          <SelectItem key=">=">{">="}</SelectItem>
        </Select>
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-4">
      {/* Content */}
      <h1 className="text-2xl">Default general settings</h1>
      <OutputPath />
    </div>
  );
};

const OutputPath = () => {
  const { outputPath, setOutputPath } = usePageStore((state) => state.general);
  const hasChanged = usePageStore((s) => s.general.hasOutputPathChanged());
  const originalVal = useStores().settings((s) => s.general.outputPath);
  const [error, setError] = useState("");
  const [checkingPath, setCheckingPath] = useState(false);

  useEffect(() => {
    let ongoing = true;

    async function tryPath() {
      try {
        const entry = await stat(outputPath);

        if (entry.isFile) {
          throw "";
        }

        setError("");
      } catch (e: any) {
        if (typeof e === "string") {
          setError("This path does not point to a directory.");
        } else {
          setError("Error: " + e);
        }
      }

      setCheckingPath(false);
    }

    setTimeout(() => {
      if (ongoing) {
        tryPath();
      }
    }, 1250);

    setCheckingPath(true);

    return () => {
      ongoing = false;
    };
  }, [outputPath]);

  const reset = () => {
    setOutputPath(originalVal);
  };

  const handleOutputPathSelect = async () => {
    const dirPath = await open({
      multiple: false,
      directory: true,
    });

    if (dirPath) {
      setOutputPath(dirPath);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="text-sm px-1">Output directory</div>
        {hasChanged && (
          <Button isIconOnly variant="light" onPress={reset}>
            <BsArrowCounterclockwise />
          </Button>
        )}
      </div>
      <div className="flex gap-4">
        <Input
          value={outputPath}
          onValueChange={setOutputPath}
          errorMessage={error}
          isInvalid={error !== ""}
        />
        <Button
          onPress={handleOutputPathSelect}
          variant="solid"
          color="primary"
        >
          <div className="flex flex-col items-centers justify-center">
            {checkingPath ? <div className="loader scale-150"></div> : "Select"}
          </div>
        </Button>
      </div>
    </div>
  );
};
