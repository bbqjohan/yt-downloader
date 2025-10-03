import { createStore as createSettingsStore } from "./settings";
import { createStore as createAppStore } from "./app";

let useStores: {
  settings: ReturnType<typeof createSettingsStore>;
  app: ReturnType<typeof createAppStore>;
};

export function createAllStores(data?: {
  settings: Parameters<typeof createSettingsStore>[0];
  app: Parameters<typeof createAppStore>[0];
}) {
  useStores = {
    settings: createSettingsStore(data?.settings),
    app: createAppStore(data?.app),
  };

  return useStores;
}
