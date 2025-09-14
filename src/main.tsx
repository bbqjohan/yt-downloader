import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { setup, DefaultsContext } from "./lib/default-options";
import { createStore } from "./store/store";
import { File } from "./lib/fs/settings";

await File.create();
const settings = await File.read();

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
      <DefaultsContext.Provider
        value={{
          outputDir: await setup(),
          videoHeight: "360",
          videoHeightConstraint: "=",
        }}
      >
        <App />
      </DefaultsContext.Provider>
    </HeroUIProvider>
  </React.StrictMode>
);
