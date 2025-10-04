import { Settings } from "../../lib/fs/settings";
import { SettingsStoreCreator } from "../../store/settings";

export let useStore: ReturnType<typeof SettingsStoreCreator>;

export function Create(settings?: Settings) {
  if (!useStore) {
    useStore = SettingsStoreCreator(settings);
  }
}
