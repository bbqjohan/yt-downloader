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

function assertStore(
  boundStore: unknown
): asserts boundStore is ReturnType<typeof SettingsStoreCreator> {
  if (!boundStore) {
    throw Error("No store");
  }
}

function useStore(): SettingsStore;
function useStore<U>(fn?: (state: SettingsStore) => U): U;
function useStore<U>(fn?: (state: SettingsStore) => U): U | SettingsStore {
  assertStore(boundStore);

  if (typeof fn === "function") {
    return boundStore(fn);
  } else {
    return boundStore();
  }
}

const SettingsPageStore: SingletonStore<
  Settings,
  SettingsStore,
  ReturnType<typeof SettingsStoreCreator>
> = {
  useStore,
  getStoreDef: () => {
    assertStore(boundStore);

    return boundStore;
  },
  create,
  isCreated,
};

export default SettingsPageStore;
