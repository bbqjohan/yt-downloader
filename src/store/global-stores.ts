import { SettingsStoreCreator } from "./settings";
import { AppStoreCreator } from "./app";

export let globalStores: {
  settings: ReturnType<typeof SettingsStoreCreator>;
  app: ReturnType<typeof AppStoreCreator>;
};

export function createAllStores(data?: {
  settings: Parameters<typeof SettingsStoreCreator>[0];
  app: Parameters<typeof AppStoreCreator>[0];
}) {
  globalStores = {
    settings: SettingsStoreCreator(data?.settings),
    app: AppStoreCreator(data?.app),
  };

  return globalStores;
}

export function useSettingsStore() {
  return globalStores.settings;
}
