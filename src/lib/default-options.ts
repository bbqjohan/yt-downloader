import { path } from "@tauri-apps/api";
import { createContext } from "react";

export async function setup(): Promise<string> {
  return await path.downloadDir();
}

interface DefaultsContext {
  outputDir: string;
  videoResolution: string;
}

export const DefaultsContext = createContext<DefaultsContext>({
  outputDir: "",
  videoResolution: "360",
});
