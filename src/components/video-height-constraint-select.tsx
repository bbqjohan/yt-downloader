import {
  Select,
  SelectItem,
  SelectProps,
  SharedSelection,
} from "@heroui/react";
import {
  VideoHeightConstraintList,
  VideoHeightConstraints,
  VideoSettingsSchema,
} from "../lib/fs/settings";
import { useCallback, useMemo } from "react";
import { ZodError } from "zod";

type Option<T> = {
  key: T;
  label: string;
};

type Options = {
  [K in VideoHeightConstraintList[number]]: Option<K>;
} & {
  ss: {
    key: "ss";
    label: "asdf";
  };
};

const _options: Options = {
  "=": {
    key: "=",
    label: "=",
  },
  "<=": {
    key: "<=",
    label: "<=",
  },
  ">=": {
    key: ">=",
    label: ">=",
  },
  ss: {
    key: "ss",
    label: "asdf",
  },
};

const optionsArr = Object.entries(_options).map(([_, value]) => value);

export const VideoHeightConstraintSelect = ({
  constraint,
  setConstraint,
  errorMessage,
  isInvalid,
}: {
  constraint: VideoHeightConstraints;
  setConstraint: (value: VideoHeightConstraints) => void;
  errorMessage?: SelectProps["errorMessage"];
  isInvalid?: SelectProps["isInvalid"];
}) => {
  const _height = useMemo(() => [constraint], [constraint]);
  const _heightError = useMemo(() => {
    return VideoSettingsSchema.shape.heightConstraint.safeParse(constraint)
      .error instanceof ZodError
      ? errorMessage ?? "This is not a valid resolution constraint!"
      : "";
  }, [constraint]);

  const onSelectionChange = useCallback((value: SharedSelection) => {
    if (value instanceof Set) {
      setConstraint(value.values().next().value as VideoHeightConstraints);
    }
  }, []);

  return (
    <Select
      aria-label="Video resolution constraint"
      selectedKeys={_height}
      onSelectionChange={onSelectionChange}
      isInvalid={isInvalid ?? Boolean(_heightError)}
      errorMessage={_heightError}
      description="Not all videos have all resolutions available. The selected resolution
          will be used if available, otherwise, the closest available resolution
          will be chosen based on your constraint."
      items={optionsArr}
      classNames={{
        base: "flex-1 min-w-32",
      }}
    >
      {(item) => {
        return <SelectItem key={item.key}>{item.label}</SelectItem>;
      }}
    </Select>
  );
};
