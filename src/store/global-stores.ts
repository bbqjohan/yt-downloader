import { SettingsStore, SettingsStoreCreator } from "./settings";
import { AppStore, AppStoreCreator } from "./app";

let globalStores: {
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

export function getStore<U>(fn: (stores: typeof globalStores) => U): U {
  return fn(globalStores);
}

export function useSettingsStore<U>(fn: (state: SettingsStore) => U): U {
  return globalStores.settings(fn);
}

export function useAppStore<U>(fn: (state: AppStore) => U): U {
  return globalStores.app(fn);
}
