import {
  Select,
  SelectItem,
  SelectProps,
  SharedSelection,
} from "@heroui/react";
import {
  VideoHeightList,
  VideoHeights,
  VideoSettingsSchema,
} from "../lib/fs/settings";
import { useCallback, useMemo } from "react";
import { ZodError } from "zod";

type Option<T> = {
  key: T;
  label: string;
};

type Options = {
  [K in VideoHeightList[number]]: Option<K>;
} & {
  ss: {
    key: "ss";
    label: "asdf";
  };
};

const _options: Options = {
  144: {
    key: "144",
    label: "144p",
  },
  240: {
    key: "240",
    label: "240p",
  },
  360: {
    key: "360",
    label: "360p",
  },
  480: {
    key: "480",
    label: "480p",
  },
  720: {
    key: "720",
    label: "720p",
  },
  1080: {
    key: "1080",
    label: "1080p",
  },
  1440: {
    key: "1440",
    label: "1440p",
  },
  2160: {
    key: "2160",
    label: "2160p",
  },
  ss: {
    key: "ss",
    label: "asdf",
  },
};

const optionsArr = Object.entries(_options).map(([_, value]) => value);

export const VideoHeightSelect = ({
  height,
  setHeight,
  errorMessage,
  isInvalid,
}: {
  height: VideoHeights;
  setHeight: (value: VideoHeights) => void;
  errorMessage?: SelectProps["errorMessage"];
  isInvalid?: SelectProps["isInvalid"];
}) => {
  const _height = useMemo(() => [height], [height]);
  const _heightError = useMemo(() => {
    return VideoSettingsSchema.shape.height.safeParse(height).error instanceof
      ZodError
      ? errorMessage ?? "This is not a valid video resolution!"
      : "";
  }, [height]);

  const onSelectionChange = useCallback((value: SharedSelection) => {
    if (value instanceof Set) {
      setHeight(value.values().next().value as VideoHeights);
    }
  }, []);

  return (
    <Select
      aria-label="Video resolution"
      selectedKeys={_height}
      onSelectionChange={onSelectionChange}
      isInvalid={isInvalid ?? Boolean(_heightError)}
      errorMessage={_heightError}
      description="Not all videos have all resolutions available. The selected resolution
          will be used if available, otherwise, the closest available resolution
          will be chosen based on your constraint."
      items={optionsArr}
    >
      {(item) => {
        return <SelectItem key={item.key}>{item.label}</SelectItem>;
      }}
    </Select>
  );
};
