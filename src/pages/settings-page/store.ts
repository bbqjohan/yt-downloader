import { Settings } from "../../lib/fs/settings";
import { SettingsStoreCreator } from "../../store/settings";

export let usePageStore: ReturnType<typeof SettingsStoreCreator>;

export function SettingsPageStoreCreator(settings?: Settings) {
  usePageStore = SettingsStoreCreator(settings);
}
