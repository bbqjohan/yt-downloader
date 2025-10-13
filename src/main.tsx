import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { createAllStores, getStore } from "./store/global-stores";
import { Settings, File as SettingsFile } from "./lib/fs/settings";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { DefaultSettingsPage } from "./pages/settings-page/page";
import { PageStore as DownloadPageStore } from "./pages/download-page/store";
import { DownloadPage } from "./pages/download-page/page";
import { PageStore as SettingsPageStore } from "./pages/settings-page/store";
import { ZodError } from "zod";
import { Result } from "./lib/try-catch";

// --------------------------------------------------
// Settings file initialization.
// --------------------------------------------------

await SettingsFile.create();

async function InitSettingsFile() {
  // let settingsFileData: Settings;

  const readSettingsFileResult = await SettingsFile.read();
  console.log(readSettingsFileResult);

  if (readSettingsFileResult.error) {
    // If the file cannot be read, fails to parse from JSON, or
    // the data doesn't follow the schema, create a new file
    // with default values.
    // settingsFileData = new Settings();
    // SettingsFile.write(settingsFileData);
  } else {
    // settingsFileData = readSettingsFileResult.data;
  }

  if (readSettingsFileResult.error instanceof SyntaxError) {
    console.log("SYNTAX ERROR");
  } else if (readSettingsFileResult.error instanceof ZodError) {
    console.log("ZOD ERROR");
  } else if (readSettingsFileResult.error instanceof Error) {
    console.log("Could not read");
  }

  return readSettingsFileResult;
}

let settingsFileResult: Result<Settings> | undefined = await InitSettingsFile();

// --------------------------------------------------
// Frontend stores initialization.
// --------------------------------------------------

const storeSettingsData = settingsFileResult.data ?? new Settings();

createAllStores({
  settings: storeSettingsData,
  app: {
    download: {
      url: "",
    },
  },
});

DownloadPageStore.create(storeSettingsData);
SettingsPageStore.create(storeSettingsData);

// --------------------------------------------------
// Router initialization.
// --------------------------------------------------

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: DownloadPage,
      },
      {
        path: "settings",
        Component: DefaultSettingsPage,
        loader: async () => {
          if (SettingsPageStore.isCreated()) {
            SettingsPageStore.getStoreDef()
              .getState()
              .hydrate(getStore((s) => s.settings.getState().toData()));
          }
        },
      },
    ],
  },
]);

// --------------------------------------------------
// Markup initialization.
// --------------------------------------------------

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw Error("Cannot find root element.");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HeroUIProvider>
      <RouterProvider router={router} key="settings" />
    </HeroUIProvider>
  </React.StrictMode>
);
