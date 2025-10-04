import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TabsProps,
} from "@heroui/react";
import { BsArrowCounterclockwise, BsArrowLeft } from "react-icons/bs";

import { getStore, useSettingsStore } from "../../store/global-stores";
import { createContext, useContext, useEffect, useState } from "react";
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
import { SettingsStoreCreator } from "../../store/settings";
import PageStore from "./store";

type PageContext = {
  settingsStore: ReturnType<typeof SettingsStoreCreator>;
};
const PageContext = createContext<PageContext>(null!);

export function DefaultSettingsPage() {
  const [selectedTab, setSelectedTab] = useState<Key>("audio");
  const settingsStore = getStore((s) => s.settings);

  return (
    <PageContext.Provider value={{ settingsStore }}>
      <div className="flex justify-center">
        <div className="grid grid-rows-[4rem_1fr] grid-cols-[200px_1fr] w-full max-w-4xl h-screen px-2">
          <Topbar />
          <Sidebar
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
          />
          <Content selectedTab={selectedTab} />
        </div>
      </div>
    </PageContext.Provider>
  );
}

function useSettingsFile() {
  const [newState, setNewState] = useState<Settings>();
  const [isWriting, setIsWriting] = useState(false);
  const [promise, setPromise] = useState<Promise<void>>();

  useEffect(() => {
    let mounted = true;

    if (newState) {
      const updateSettings = async () => {
        try {
          await SettingsFile.write(newState);
          getStore((s) => s.settings)
            .getState()
            .hydrate(newState);
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
  const { settingsStore } = useContext(PageContext);
  const hasUnsavedChanges = PageStore.useStore((s) => {
    return !s.isEqual(settingsStore.getState());
  });
  const settingsFile = useSettingsFile();
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const applySettings = () => {
    settingsFile.write(PageStore.useStore().toData());
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
    if (settingsFile.promise && openModal) {
      settingsFile.promise.then(() => {
        setOpenModal(false);
        navigate("/");
      });
    }
  }, [settingsFile.promise, openModal]);

  return (
    <div className="flex col-span-full py-4 border-b-1 border-gray-300 items-center">
      <div className="grow">
        <Button variant="light" onPress={onPageLeave}>
          <BsArrowLeft />
          Go back
        </Button>
      </div>
      <div>
        <Button
          variant="solid"
          color="primary"
          onPress={applySettings}
          isDisabled={settingsFile.isWriting || !hasUnsavedChanges}
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
  const { settingsStore } = useContext(PageContext);
  const { quality } = PageStore.useStore((state) => state.audio);
  const hasChanged = PageStore.useStore((s) => {
    return !s.audio.quality.isEqual(settingsStore.getState());
  });
  const ogValue = useSettingsStore((s) => s.audio.quality.value);

  const resetIsWorstAudioQuality = () => {
    quality.setValue(ogValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="text-sm px-1">Audio quality</div>
        {hasChanged && (
          <Button isIconOnly variant="light" onPress={resetIsWorstAudioQuality}>
            <BsArrowCounterclockwise />
          </Button>
        )}
      </div>
      <div className="flex gap-4">
        <RadioGroup
          value={quality.value}
          onValueChange={(v) => quality.setValue(v as any)}
        >
          <Radio value="wa">Worst</Radio>
          <Radio value="ba">Best</Radio>
        </RadioGroup>
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
  const { settingsStore } = useContext(PageContext);
  const height = PageStore.useStore((state) => state.video.height);
  const hasChanged = PageStore.useStore(
    (s) => !s.video.height.isEqual(settingsStore.getState())
  );
  const ogValue = useSettingsStore((s) => s.video.height.value);

  const reset = () => {
    height.setValue(ogValue);
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
        <VideoHeightSelect height={height.value} setHeight={height.setValue} />
      </div>
    </div>
  );
};

const VideoHeightConstraint = () => {
  const { settingsStore } = useContext(PageContext);
  const heightConstraint = PageStore.useStore(
    (state) => state.video.heightConstraint
  );
  const hasChanged = PageStore.useStore(
    (s) => !s.video.heightConstraint.isEqual(settingsStore.getState())
  );
  const ogValue = useSettingsStore((s) => s.video.heightConstraint.value);

  const reset = () => {
    heightConstraint.setValue(ogValue);
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
          constraint={heightConstraint.value}
          setConstraint={heightConstraint.setValue}
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
  const { settingsStore } = useContext(PageContext);
  const { outputPath } = PageStore.useStore((state) => state.general);
  const hasChanged = PageStore.useStore(
    (s) => !s.general.outputPath.isEqual(settingsStore.getState())
  );
  const ogValue = useSettingsStore((s) => s.general.outputPath.value);

  const reset = () => {
    outputPath.setValue(ogValue);
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
      <VideoOutputPath
        value={outputPath.value}
        setValue={outputPath.setValue}
      />
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
