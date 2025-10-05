import { SingletonStoreBase } from "../../lib/store";
import { SettingsStore, SettingsStoreCreator } from "../../store/settings";

export const PageStore = new SingletonStoreBase<
  SettingsStore,
  typeof SettingsStoreCreator
>(SettingsStoreCreator);
