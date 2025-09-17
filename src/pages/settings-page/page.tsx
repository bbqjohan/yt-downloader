import { Button, Checkbox, Tab, Tabs, TabsProps } from "@heroui/react";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { useStore, createStore } from "./store";
import { useStores } from "../../store/stores";
import { useState } from "react";
import { Key } from "@react-types/shared";

createStore();

export function DefaultSettingsPage() {
  const [selectedTab, setSelectedTab] = useState<Key>("audio");

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
        {/* <Tab key="general" title="General settings"></Tab> */}
        <Tab key="audio" title="Audio settings"></Tab>
        {/* <Tab key="video" title="Video settings"></Tab> */}
      </Tabs>
    </div>
  );
};

const Content = ({
  selectedTab,
}: {
  selectedTab: TabsProps["selectedKey"];
}) => {
  return selectedTab === "audio" && <AudioSettings />;
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
  const { isWorstQuality, setIsWorstQuality } = useStore(
    (state) => state.audio
  );
  const isWorstQualityChanged = useStore((s) =>
    s.audio.hasIsWorstQualityChanged()
  );
  const isWorstQualityOg = useStores().settings((s) => s.audio.isWorstQuality);

  const resetIsWorstAudioQuality = () => {
    setIsWorstQuality(isWorstQualityOg);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        Audio quality{" "}
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
