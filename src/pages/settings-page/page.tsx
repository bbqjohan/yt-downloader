import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  TabsProps,
} from "@heroui/react";
import { BsArrowCounterclockwise, BsArrowLeft } from "react-icons/bs";
import { useStore as usePageStore } from "./store";
import { useStores } from "../../store/stores";
import { useEffect, useState } from "react";
import { Key } from "@react-types/shared";
import {
  Settings,
  File as SettingsFile,
  SettingsSchema,
} from "../../lib/fs/settings";
import { useNavigate } from "react-router";
import { VideoHeightSelect } from "../../components/video-height-select";
import { VideoHeightConstraintSelect } from "../../components/video-height-constraint-select";
import { VideoOutputPath } from "../../components/video-output-path";

export function DefaultSettingsPage() {
  const [selectedTab, setSelectedTab] = useState<Key>("general");

  return (
    <div className="flex justify-center">
      <div className="grid grid-rows-[4rem_1fr] grid-cols-[200px_1fr] w-full max-w-4xl h-screen px-2">
        <Topbar />
        <Sidebar selectedKey={selectedTab} onSelectionChange={setSelectedTab} />
        <Content selectedTab={selectedTab} />
      </div>
    </div>
  );
}

function useSettings() {
  const [newState, setNewState] = useState<Settings>();
  const [isWriting, setIsWriting] = useState(false);
  const [promise, setPromise] = useState<Promise<void>>();

  useEffect(() => {
    let mounted = true;

    if (newState) {
      const updateSettings = async () => {
        try {
          await SettingsFile.write(newState);
          useStores().settings.setState(newState);
        } catch (e: any) {
          // Do nothing.
        }

        if (mounted) {
          setNewState(undefined);
          setIsWriting(false);
        }
      };

      setPromise(updateSettings());
      setIsWriting(true);
    }

    return () => {
      mounted = false;
    };
  }, [newState]);

  const write = (newState: Settings) => {
    SettingsSchema.parse(newState);
    setNewState(newState);
  };

  return {
    newState,
    isWriting,
    promise,
    write,
  };
}

const Topbar = () => {
  const hasUnsavedChanges = usePageStore(usePageStore.hasChanged);
  const settings = useSettings();
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const applySettings = () => {
    settings.write(
      JSON.parse(
        JSON.stringify({
          ...usePageStore.getState(),
        })
      )
    );
  };

  const onPageLeave = () => {
    if (hasUnsavedChanges) {
      setOpenModal(true);
    } else {
      navigate("/");
    }
  };

  const onModalClose = () => {
    setOpenModal(false);
  };

  const onDiscardChanges = () => {
    setOpenModal(false);
    navigate("/");
  };

  useEffect(() => {
    if (settings.promise) {
      settings.promise.then(() => {
        setOpenModal(false);
        navigate("/");
      });
    }
  }, [settings.promise]);

  return (
    <div className="flex col-span-full py-4 border-b-1 border-gray-300 items-center">
      <div className="grow">
        {/* <Link to="/"> */}
        <Button variant="light" onPress={onPageLeave}>
          <BsArrowLeft />
          Go back
        </Button>
        {/* </Link> */}
      </div>
      <div>
        <Button
          variant="solid"
          color="primary"
          onPress={applySettings}
          isDisabled={settings.isWriting || !hasUnsavedChanges}
        >
          Apply
        </Button>
      </div>
      <GoBackModal
        isOpen={openModal}
        onClose={onModalClose}
        onDiscard={onDiscardChanges}
        onSave={applySettings}
      />
    </div>
  );
};

const Sidebar = ({
  selectedKey,
  onSelectionChange,
}: {
  selectedKey: TabsProps["selectedKey"];
  onSelectionChange: TabsProps["onSelectionChange"];
}) => {
  return (
    <div className="flex flex-col gap-4 py-4">
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
    <div className="py-4 pl-4 ">
      {(selectedTab === "audio" && <AudioSettings />) ||
        (selectedTab === "general" && <GeneralSettings />) ||
        (selectedTab === "video" && <VideoSettings />)}
    </div>
  );
};

const AudioSettings = () => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
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
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      {/* Content */}
      <h1 className="text-2xl">Default video settings</h1>
      <VideoHeight />
      <VideoHeightConstraint />
    </div>
  );
};

const VideoHeight = () => {
  const { height, setHeight } = usePageStore((state) => state.video);
  const hasChanged = usePageStore((s) => s.video.hasHeightChanged());
  const originalVal = useStores().settings((s) => s.video.height);

  const reset = () => {
    setHeight(originalVal);
  };

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
        <VideoHeightSelect height={height} setHeight={setHeight} />
      </div>
    </div>
  );
};

const VideoHeightConstraint = () => {
  const { heightConstraint, setHeightConstraint } = usePageStore(
    (state) => state.video
  );
  const hasChanged = usePageStore((s) => s.video.hasHeightConstraintChanged());
  const originalVal = useStores().settings((s) => s.video.heightConstraint);

  const reset = () => {
    setHeightConstraint(originalVal);
  };

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
        <VideoHeightConstraintSelect
          constraint={heightConstraint}
          setConstraint={setHeightConstraint}
        />
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto h-full">
      <h1 className="text-2xl">Default general settings</h1>
      <OutputPath />
    </div>
  );
};

const OutputPath = () => {
  const { outputPath, setOutputPath } = usePageStore((state) => state.general);
  const hasChanged = usePageStore((s) => s.general.hasOutputPathChanged());
  const originalVal = useStores().settings((s) => s.general.outputPath);

  const reset = () => {
    setOutputPath(originalVal);
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
      <VideoOutputPath value={outputPath} setValue={setOutputPath} />
    </div>
  );
};

const GoBackModal = ({
  isOpen,
  onClose,
  onDiscard,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) => {
  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            Unsaved changes
          </ModalHeader>
          <ModalBody>
            <p>
              You have made changes to the settings that's not been saved yet.
              Do you wish to save before leaving this page?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onDiscard}>
              Discard changes
            </Button>
            <Button color="primary" onPress={onSave}>
              Save changes
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};
