import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { createAllStores } from "./store/stores";
import { File as SettingsFile } from "./lib/fs/settings";
import { createStore as createSettingsPageStore } from "./pages/settings-page/store";

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>
);
