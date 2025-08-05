import { path } from "@tauri-apps/api";

export async function setup() {
  const defaultOutputDir = await path.downloadDir();
  window.defaultOutputDir = defaultOutputDir;
}
