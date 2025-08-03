export interface DownloadEvent<Name, Data> {
  event: Name;
  data: Data;
}

export interface DownloadItemData {
  progress: number;
  speed: string;
  size: string;
  items: DownloadItem[];
  label: string;
  id: string;
  readonly done: boolean;
}

export class DownloadItem implements DownloadItemData {
  progress = 0;
  speed = "";
  size = "";
  items: DownloadItem[] = [];
  label = "";
  id = "";

  get done(): boolean {
    return this.progress >= 100;
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

  get(id: string): DownloadItem | undefined {
    return this.id === id ? this : this.items.find((i) => i.get(id));
  }
}
