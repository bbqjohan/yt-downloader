import { Settings } from "../../lib/fs/settings";
import { SingletonStore } from "../../lib/store";
import { SettingsStore, SettingsStoreCreator } from "../../store/settings";

let boundStore: ReturnType<typeof SettingsStoreCreator> | undefined;

function create(data?: Settings) {
  if (!boundStore) {
    boundStore = SettingsStoreCreator(data);
  }
}

function isCreated() {
  return !!boundStore;
}

function useStore(): SettingsStore;
function useStore<U>(fn?: (state: SettingsStore) => U): U;
function useStore<U>(fn?: (state: SettingsStore) => U): U | SettingsStore {
  if (!boundStore) {
    throw Error("No store");
  }

  if (typeof fn === "function") {
    return boundStore(fn);
  } else {
    return boundStore();
  }
}

const SettingsPageStore: SingletonStore<Settings, SettingsStore> = {
  useStore,
  create,
  isCreated,
};

export default SettingsPageStore;
