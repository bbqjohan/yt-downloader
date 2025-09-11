import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HeroUIProvider } from "@heroui/react";
import { setup, DefaultsContext } from "./lib/default-options";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <DefaultsContext.Provider
        value={{
          outputDir: await setup(),
          videoResolution: "360",
        }}
      >
        <App />
      </DefaultsContext.Provider>
    </HeroUIProvider>
  </React.StrictMode>
);
