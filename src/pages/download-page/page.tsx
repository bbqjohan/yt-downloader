import {
  Button,
  ButtonProps,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
} from "@heroui/react";
import { OneColumnLayout } from "../../layouts/one-column";
import { memo, useEffect, useState } from "react";
import { Key } from "@react-types/shared";
import {
  useDownloadVideo,
  VideoDownloadItem,
} from "../../hooks/download-video";
import { useAppStore, getStore } from "../../store/global-stores";

import { useLoaderData, useNavigate } from "react-router";
import { BiSolidCog } from "react-icons/bi";
import { VideoHeightSelect } from "../../components/video-height-select";
import { VideoHeightConstraintSelect } from "../../components/video-height-constraint-select";
import { VideoOutputPath } from "../../components/video-output-path";
import { PageStore } from "./store";
import { File, Settings } from "../../lib/fs/settings";
import { Result } from "../../lib/try-catch";

export function DownloadPage() {
  const downloadVideo = useDownloadVideo();
  const navigate = useNavigate();

  const handleDownload = () => {
    const settings = PageStore.getStoreDef().getState();
    const app = getStore((s) => s.app.getState());

    downloadVideo.startDownload({
      item: app.download.toData(),
      settings: settings.toData(),
    });
  };

  return (
    <OneColumnLayout>
      <SettingsErrorModal />
      <div className="flex py-4 border-gray-300 items-center justify-end">
        <Button
          isIconOnly
          className="text-2xl"
          variant="light"
          color="default"
          onPress={() => {
            navigate("/settings");
          }}
        >
          <BiSolidCog />
        </Button>
      </div>
      <div className="flex flex-col gap-4 h-full">
        <UrlInput
          onDownload={handleDownload}
          isDisabled={downloadVideo.downloadItem?.isStarted || false}
        />
        <DownloadProgress item={downloadVideo.downloadItem} />
        <DownloadError item={downloadVideo.downloadItem} />
        <Divider />
        <SettingsSection />
      </div>
    </OneColumnLayout>
  );
}

const SettingsErrorModal = () => {
  // Modal stuff
  const result = useLoaderData<Result<Settings>>();
  const [isOpen, setIsOpen] = useState(!!result.error);
  const [isFixed, setIsFixed] = useState(false);
  const [couldNotFix, setCouldNotFix] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const onClose = () => setIsOpen(false);
  const onReplace = async () => {
    setIsFixing(true);
  };

  useEffect(() => {
    let isMounted = true;

    if (isFixing) {
      setTimeout(() => {
        File.write(new Settings())
          .then(() => {
            if (isMounted) {
              setIsFixed(true);
            }
          })
          .catch(() => {
            if (isMounted) {
              setCouldNotFix(true);
            }
          });
      }, 1000);
    }

    return () => {
      isMounted = false;
    };
  }, [isFixing]);

  return (
    <Modal
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            Damaged settings!
          </ModalHeader>
          <ModalBody>
            {couldNotFix && (
              <div>
                <div>Problem could not be resolved.</div>
                <Button color="danger" onPress={() => setIsOpen(false)}>
                  {"OK :("}
                </Button>
              </div>
            )}
            {isFixed && (
              <div>
                <div>Problem fixed!</div>
                <Button color="primary" onPress={() => setIsOpen(false)}>
                  OK :D
                </Button>
              </div>
            )}
            {!isFixing && (
              <p>
                Something went wrong when reading the settings file. We can try
                replacing the file for you, but you will loose any settings that
                you've specified.
              </p>
            )}
            {isFixing && <div>Fixing problem...</div>}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Ignore
            </Button>
            <Button color="primary" onPress={onReplace}>
              Replace settings
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

interface UrlInputProps {
  isDisabled: boolean;
  onDownload: ButtonProps["onPress"];
}

const UrlInput = memo(({ isDisabled, onDownload }: UrlInputProps) => {
  const { url } = useAppStore((state) => state.download);

  return (
    <div className="text-black flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          label="URL"
          type="url"
          value={url.value}
          onValueChange={url.setValue}
          isDisabled={isDisabled}
        />
        <Button color="primary" onPress={onDownload} isDisabled={isDisabled}>
          Download
        </Button>
      </div>
    </div>
  );
});

const SettingsSection = memo(() => {
  const [selectedTab, setSelectedTab] = useState<Key>("");

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        variant="underlined"
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
      >
        <Tab key="general" title="General settings">
          <GeneralSettings />
        </Tab>
        <Tab key="audio" title="Audio settings">
          <AudioSettings />
        </Tab>
        <Tab key="video" title="Video settings">
          <VideoSettings />
        </Tab>
      </Tabs>
    </div>
  );
});

const AudioSettings = () => {
  const { quality } = PageStore.useStore((state) => state.audio);

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        value={quality.value}
        onValueChange={(v) => quality.setValue(v as any)}
      >
        <Radio value="wa">Worst</Radio>
        <Radio value="ba">Best</Radio>
      </RadioGroup>
    </div>
  );
};

const GeneralSettings = () => {
  const { outputPath } = PageStore.useStore((state) => state.general);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <VideoOutputPath
          value={outputPath.value}
          setValue={outputPath.setValue}
        />
      </div>
    </div>
  );
};

const VideoSettings = () => {
  const { height, heightConstraint } = PageStore.useStore(
    (state) => state.video
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="text-sm px-1">Video resolution</div>
        <div className="flex gap-4 items-start">
          <VideoHeightConstraintSelect
            constraint={heightConstraint.value}
            setConstraint={heightConstraint.setValue}
          />
          <VideoHeightSelect
            height={height.value}
            setHeight={height.setValue}
          />
        </div>
      </div>
    </div>
  );
};

const DownloadProgress = memo(
  ({ item }: { item: VideoDownloadItem | null }) => {
    return item && !item.hasError ? (
      <div className="text-black">
        {item.isFinished
          ? "Download finished!"
          : `Downloading... ${item.progressString || "0%"}`}
      </div>
    ) : undefined;
  }
);

const DownloadError = ({ item }: { item: VideoDownloadItem | null }) => {
  return item && item.hasError ? (
    <div className="bg-red-200 rounded-lg text-red-900 px-3 py-2 flex flex-col gap-4">
      <div>{`Error occurred: ${item.error.message}`}</div>
      {item.error.help && <div>{item.error.help}</div>}
    </div>
  ) : undefined;
};
