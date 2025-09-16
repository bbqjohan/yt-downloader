import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { createStore } from "./store/store";
import { File as SettingsFile } from "./lib/fs/settings";

await SettingsFile.create();
const settings = await SettingsFile.read();

createStore({
  settings: {
    ...settings,
  },
  app: {
    url: "",
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>
);
