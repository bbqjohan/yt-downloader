import {
  createStore as createSettingsStore,
  useStore as useSettingsStore,
} from "./settings";

import { createStore as createAppStore, useStore as useAppStore } from "./app";

let _useStores: {
  settings: typeof useSettingsStore;
  app: typeof useAppStore;
};

export function createAllStores(data?: {
  settings: Parameters<typeof createSettingsStore>[0];
  app: Parameters<typeof createAppStore>[0];
}) {
  _useStores = {
    settings: createSettingsStore(data?.settings),
    app: createAppStore(data?.app),
  };

  return useStores;
}

export function useStores() {
  return _useStores;
}
