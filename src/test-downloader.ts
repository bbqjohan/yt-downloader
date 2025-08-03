import { Channel } from "@tauri-apps/api/core";

interface DlItemData {
  progress: number;
  speed: string;
  size: string;
  items: DlItem[];
  label: string;
  id: string;
}

class DlItem implements DlItemData {
  progress = 0;
  speed = "";
  size = "";
  items: DlItem[] = [];
  label = "";
  id = "";

  get done(): boolean {
    return this.progress >= 100;
  }

  constructor(args: Partial<DlItemData> = { progress: 0 }) {
    for (const key of Object.keys(args)) {
      if (Object.hasOwn(this, key)) {
        this[key as keyof this] = args[key as keyof DlItemData] as any;
      }
    }
  }

  getProgress(): number {
    return this.items.length > 0
      ? Math.floor(
          (this.items.reduce((a, i) => a + i.getProgress(), 0) /
            (this.items.length * 100)) *
            100
        )
      : this.progress;
  }

  setProgress(progress: number) {
    this.progress = Math.min(progress, 100);
  }

  get(id: string): DlItem | undefined {
    return this.id === id ? this : this.items.find((i) => i.get(id));
  }
}

const _items = [
  new DlItem({
    id: "file",
    label: "File",
    items: [
      new DlItem({
        id: "audio",
        label: "Audio",
      }),
      new DlItem({
        id: "video",
        label: "Video",
      }),
    ],
  }),
];

function recProgressUpdate(
  progress: number,
  items: DlItem[],
  path: number[],
  curItem: DlItem | undefined,
  start: number = 0
) {
  const idx = path[start];
  const next = idx === undefined ? undefined : items[idx];

  if (next) {
    recProgressUpdate(progress, next.items, path, next, start + 1);
    next.setProgress(next.getProgress());
  } else if (curItem) {
    curItem.setProgress(progress);
  }
}

function genQueue(queue: DlItem[]): number[] {
  if (!queue.length) {
    return [];
  }

  function inner(items: DlItem[], path: number[]): number[] {
    for (let i = 0; i < items.length; i++) {
      if (items[i] && !items[i].done) {
        path.push(i);
        inner(items[i].items, path);
        break;
      }
    }

    return path;
  }

  return inner(queue, []);
}

recProgressUpdate(50, _items, [0, 0], undefined, 0);
recProgressUpdate(50, _items, [0, 1], undefined, 0);
recProgressUpdate(100, _items, [0, 2], undefined, 0);
recProgressUpdate(100, _items, [1, 0], undefined, 0);

console.dir(_items, { depth: null, colors: true });
console.log(genQueue(_items));

// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================

interface DlItemData_parents {
  progress: number;
  speed: string;
  size: string;
  label: string;
  id: string;
}

class DlItem_parents implements DlItemData_parents {
  progress = 0;
  speed = "";
  size = "";
  items: DlItem_parents[] = [];
  label = "";
  id = "";
  #parent: DlItem_parents | undefined;

  constructor(args: Partial<DlItemData_parents> = { progress: 0 }) {
    for (const key of Object.keys(args)) {
      if (Object.hasOwn(this, key)) {
        this[key as keyof this] = args[key as keyof DlItemData_parents] as any;
      }
    }
  }

  get parent(): DlItem_parents | undefined {
    return this.#parent;
  }

  getProgress(): number {
    return this.items.length > 0
      ? Math.floor(
          (this.items.reduce((a, i) => a + +i.getProgress(), 0) /
            (this.items.length * 100)) *
            100
        )
      : this.progress;
  }

  setProgress(progress: number) {
    this.progress = Math.min(progress, 100);
  }

  get(id: string): DlItem_parents | undefined {
    return this.id === id ? this : this.items.find((i) => i.get(id));
  }

  add(item: DlItem_parents) {
    item.#parent = this;
    this.items.push(item);
  }
}

const _items_parents_file = new DlItem_parents({
  id: "file",
  label: "File",
});
const _items_parents_audio = new DlItem_parents({
  id: "audio",
  label: "Audio",
});
const _items_parents_video = new DlItem_parents({
  id: "video",
  label: "Video",
});

_items_parents_file.add(_items_parents_audio);
_items_parents_file.add(_items_parents_video);

const _items_parents = [_items_parents_file];

_items_parents_audio.setProgress(20);

let _item_parent = _items_parents_audio.parent;

while (_item_parent) {
  _item_parent.setProgress(_item_parent.getProgress());
  _item_parent = _item_parent.parent;
}
