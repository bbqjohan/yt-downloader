import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { createAllStores } from "./store/stores";
import { File as SettingsFile } from "./lib/fs/settings";
import {
  createStore as createSettingsPageStore,
  useStore,
} from "./pages/settings-page/store";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { DownloadPage } from "./pages/download-page";
import { DefaultSettingsPage } from "./pages/settings-page/page";

await SettingsFile.create();
const settings = await SettingsFile.read();

createAllStores({
  settings: {
    ...settings,
  },
  app: {
    url: "",
  },
});

createSettingsPageStore({ ...settings });

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw Error("Cannot find root element.");
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: DownloadPage },
      {
        path: "settings",
        Component: DefaultSettingsPage,
        loader: async () => {
          // Discard any state changes on this page.
          useStore.replaceState({ ...settings });
        },
      },
    ],
  },
]);

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HeroUIProvider>
      <RouterProvider router={router} />
    </HeroUIProvider>
  </React.StrictMode>
);
