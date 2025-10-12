import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { createAllStores, getStore } from "./store/global-stores";
import { File as SettingsFile } from "./lib/fs/settings";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { DefaultSettingsPage } from "./pages/settings-page/page";
import { PageStore as DownloadPageStore } from "./pages/download-page/store";
import { DownloadPage } from "./pages/download-page/page";
import { PageStore as SettingsPageStore } from "./pages/settings-page/store";

await SettingsFile.create();
const settingsFileData = await SettingsFile.read();

createAllStores({
  settings: {
    ...settingsFileData,
  },
  app: {
    download: {
      url: "",
    },
  },
});

DownloadPageStore.create(settingsFileData);
SettingsPageStore.create(settingsFileData);

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw Error("Cannot find root element.");
}

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

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HeroUIProvider>
      <RouterProvider router={router} key="settings" />
    </HeroUIProvider>
  </React.StrictMode>
);
