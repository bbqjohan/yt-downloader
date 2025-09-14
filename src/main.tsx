import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { setup, DefaultsContext } from "./lib/default-options";
import { createStore } from "./store/store";

createStore({
  general: { url: "bajs", outputPath: "haha" },
  audio: {
    isWorstQuality: true,
  },
  video: {
    height: "240",
    heightConstraint: "=",
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
