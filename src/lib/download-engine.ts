export interface DownloadSpeed {
  rate: number;
  size: string;
}

export interface DownloadEvent<Name, Data> {
  event: Name;
  data: Data;
}

export interface DownloadItemData {
  progress: number;
  speed: DownloadSpeed;
  size: string;
  items: DownloadItem[];
  label: string;
  id: string;
  readonly done: boolean;
}

export class DownloadItem implements DownloadItemData {
  progress = 0;
  speed: DownloadSpeed = { rate: 0, size: "" };
  size = "";
  items: DownloadItem[] = [];
  label = "";
  id = "";

  get done(): boolean {
    return this.progress >= 100;
  }

  get current(): DownloadItem {
    return this.items.find((i) => !i.done) ?? this;
  }

  constructor(args: Partial<DownloadItemData>) {
    for (const key of Object.keys(args)) {
      if (Object.hasOwn(this, key)) {
        this[key as keyof this] = args[key as keyof DownloadItemData] as any;
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

  updateProgress(progress: number) {
    if (this.items.length && !this.done) {
      this.current.updateProgress(progress);
      this.setProgress(this.getProgress());
    } else if (!this.items.length && !this.done) {
      this.setProgress(progress);
    }
  }

  get(id: string): DownloadItem | undefined {
    return this.id === id ? this : this.items.find((i) => i.get(id));
  }
}

function recProgressUpdate(
  progress: number,
  items: DownloadItem[],
  path: number[],
  curItem: DownloadItem | undefined = undefined,
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

function genQueue(queue: DownloadItem[]): number[] {
  if (!queue.length) {
    return [];
  }

  const path: number[] = [];

  function inner(items: DownloadItem[]) {
    for (let i = 0; i < items.length; i++) {
      if (items[i] && !items[i].done) {
        path.push(i);
        inner(items[i].items);
        break;
      }
    }
  }

  inner(queue);

  return path;
}
