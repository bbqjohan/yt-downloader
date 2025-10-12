import { SingletonStore } from "../../lib/store";
import { SettingsStore, SettingsStoreCreator } from "../../store/settings";

export const PageStore = new SingletonStore<
  SettingsStore,
  typeof SettingsStoreCreator
>(SettingsStoreCreator);
