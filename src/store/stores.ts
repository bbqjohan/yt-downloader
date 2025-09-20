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

/**
 * Utility function that checks if strore state has changed by looking for methods that have
 * "has" and "changed" in the name.
 *
 * If it finds a property called "hasMyPropertyChanged", it will check if it's a function, then
 * call it and return its value. If it's truthy, this function will conclude that the property's
 * value has changed.
 *
 * If the object doesn't have any comparison functions, then this function will not work as
 * expected.
 *
 * @param obj The object to check for changes.
 * @returns {Boolean} Whether the property has changed value.
 */
export function hasChanged<T extends {}>(obj: T) {
  const keys = Object.keys(obj) as (keyof T)[];

  return keys.some((key) => {
    let _key = (key as string).toLowerCase();
    let val = obj[key];

    if (_key.includes("has") && _key.includes("changed")) {
      return typeof val === "function" ? val() : false;
    }

    return false;
  });
}
