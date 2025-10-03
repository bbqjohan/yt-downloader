import { Button, Input } from "@heroui/react";
import * as TestStore from "../../store/settings";
import * as PageStore from "./store";

const settingsStore = TestStore.createStore();
const pageStore = PageStore.createPageStore(settingsStore);

export const Test_Page = () => {
  console.log("RENDER: Test_Page");

  return (
    <div className="flex justify-center">
      <div className="grid grid-rows-[4rem_1fr] grid-cols-[200px_1fr] w-full max-w-4xl h-screen px-2">
        <div />
        <div />
        <div className="flex flex-col gap-8">
          <TheStore />
          <GeneralSettings />
          <AudioSettings />
          <VideoSettings />
        </div>
      </div>
    </div>
  );
};

const TheStore = () => {
  const hydrateStore = () => {
    PageStore.hydrateStore(pageStore, {
      general: { outputPath: "Path" },
      audio: { quality: "wa" },
      video: { height: "144", heightConstraint: "=" },
    });
  };

  console.log("RENDER: The Store");

  return (
    <div className="flex flex-col gap-4">
      <h1>The Store</h1>
      <div className="flex gap-4">
        <Button onPress={hydrateStore}>Hydrate Store</Button>
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  const { outputPath } = settingsStore((s) => s.general);
  const { outputPath: newOutputPath } = pageStore((s) => s.general);

  const setValue = () => {
    newOutputPath.setValue(newOutputPath.value === "what" ? "huh" : "what");
  };

  const setError = () => {
    newOutputPath.setError(newOutputPath.error === null ? "ERROR" : null);
  };

  const validate = () => {
    newOutputPath.setError(newOutputPath.validate(""));
  };

  const update = () => {
    newOutputPath.update("");
  };

  const hydrateSlice = () => {
    pageStore.getState().general.hydrate({ outputPath: "what" });
  };

  const hasChanged = () => {
    console.log(newOutputPath.hasChanged());
    console.log(pageStore.getState().general.hasChanged());
  };

  console.log("RENDER: General Settings - ", newOutputPath);

  return (
    <div className="flex flex-col gap-4">
      <h1>General Settings</h1>
      <div className="flex gap-4">
        <Button onPress={setValue}>Toggle Value</Button>
        <Button onPress={setError}>Toggle Error</Button>
        <Button onPress={validate}>Validate</Button>
        <Button onPress={update}>Update</Button>
        <Button onPress={hydrateSlice}>Hydrate Slice</Button>
        <Button onPress={hasChanged}>Has Changed</Button>
      </div>
      <div className="flex gap-4 w-[500px]">
        <Input label="Output Path" value={outputPath.value} />
        <Input label="New Output Path" value={newOutputPath.value} />
      </div>
    </div>
  );
};

const AudioSettings = () => {
  const { quality } = pageStore((s) => s.audio);

  const toggleValue = () => {
    quality.setValue(
      quality.value === "" ? "wa" : quality.value === "wa" ? "ba" : ""
    );
  };

  const toggleError = () => {
    quality.setError(quality.error === null ? quality.validate(123) : null);
  };

  const update = () => {
    quality.update(quality.value);
  };

  const resetSlice = () => {
    pageStore.getState().audio.hydrate({ quality: "" });
  };

  console.log("RENDER: Audio Settings - ", quality);

  return (
    <div className="flex flex-col gap-4">
      <h1>Audio Settings</h1>
      <Input
        label="Audio quality"
        value={quality.value}
        onValueChange={(v) => quality.update(v as any)}
      />
      <div className="flex gap-4">
        <Button onPress={toggleValue}>Toggle value</Button>
        <Button onPress={toggleError}>Toggle error</Button>
        <Button onPress={update}>Update</Button>
        <Button onPress={resetSlice}>Reset slice</Button>
      </div>
      <div>
        Slice changed: {pageStore.getState().audio.hasChanged().toString()}
      </div>
      <div>Quality changed: {quality.hasChanged().toString()}</div>
    </div>
  );
};

const VideoSettings = () => {
  const { height } = settingsStore((s) => s.video);

  const setValue = () => {
    height.setValue(height.value === "144" ? "1080" : "144");
  };

  const setError = () => {
    height.setError(height.error === null ? "ERROR" : null);
  };

  const validate = () => {
    height.setError(height.validate(""));
  };

  const update = () => {
    height.update("240");
  };

  const hydrateSlice = () => {
    pageStore
      .getState()
      .video.hydrate({ height: "360", heightConstraint: "<=" });
  };

  console.log("RENDER: Video Settings - ", height);

  return (
    <div className="flex flex-col gap-4">
      <h1>Video Settings</h1>
      <div className="flex gap-4">
        <Button onPress={setValue}>Toggle Value</Button>
        <Button onPress={setError}>Toggle Error</Button>
        <Button onPress={validate}>Validate</Button>
        <Button onPress={update}>Update</Button>
        <Button onPress={hydrateSlice}>Hydrate Slice</Button>
      </div>
    </div>
  );
};
