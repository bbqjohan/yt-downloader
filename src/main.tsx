import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { setup, DefaultsContext } from "./lib/default-options";
import { createStore } from "./store/store";
import { createSettings, read } from "./lib/settings";

await createSettings();
const settings = await read();

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
