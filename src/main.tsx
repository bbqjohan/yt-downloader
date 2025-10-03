import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { createAllStores } from "./store/global-stores";
import { File as SettingsFile } from "./lib/fs/settings";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { DefaultSettingsPage } from "./pages/settings-page/page";
import { SettingsPageStoreCreator } from "./pages/settings-page/store";
import { DownloadPage } from "./pages/download-page";

await SettingsFile.create();
const settingsFileData = await SettingsFile.read();

createAllStores({
  settings: {
    ...settingsFileData,
  },
  app: {
    app: {
      url: "",
    },
  },
});

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
          SettingsPageStoreCreator(await SettingsFile.read());
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
