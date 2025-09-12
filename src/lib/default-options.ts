import { path } from "@tauri-apps/api";
import { createContext } from "react";
import {
  VideoHeightConstraintValues,
  VideoHeightValues,
} from "../hooks/download-video";

export async function setup(): Promise<string> {
  return await path.downloadDir();
}

interface DefaultsContext {
  outputDir: string;
  videoHeight: VideoHeightValues;
  videoHeightConstraint: VideoHeightConstraintValues;
}

export const DefaultsContext = createContext<DefaultsContext>({
  outputDir: "",
  videoHeight: "360",
  videoHeightConstraint: "=",
});
