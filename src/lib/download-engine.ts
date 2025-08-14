export interface DownloadSpeed {
  rate: number;
  size: string;
}

export interface DownloadEvent<Name, Data> {
  event: Name;
  data: Data;
}

export interface DownloadItemData<T, E> {
  progress: number;
  speed: DownloadSpeed;
  size: string;
  children: DownloadItem<T>[];
  label: string;
  id: string;
  ongoing: boolean;
  params: T | undefined;
  error: E | undefined;
  readonly done: boolean;
}

export class DownloadItem<T, E = unknown> implements DownloadItemData<T, E> {
  progress = 0;
  speed: DownloadSpeed = { rate: 0, size: "" };
  size = "";
  children: DownloadItem<T>[] = [];
  label = "";
  id = "";
  ongoing = false;
  params: T | undefined;
  error: E | undefined;

  get done(): boolean {
    return this.progress >= 100;
  }

  get current(): DownloadItem<T> {
    return this.children.find((i) => !i.done) ?? this;
  }

  constructor(args: Partial<DownloadItemData<T, E>>) {
    for (const key of Object.keys(args)) {
      if (Object.hasOwn(this, key)) {
        this[key as keyof this] = args[
          key as keyof DownloadItemData<T, E>
        ] as any;
      }
    }

    this.params = args.params as T;
  }

  getProgress(): number {
    return this.children.length > 0
      ? Math.floor(
          (this.children.reduce((a, i) => a + i.getProgress(), 0) /
            (this.children.length * 100)) *
            100
        )
      : this.progress;
  }

  setProgress(progress: number) {
    this.progress = Math.min(progress, 100);
  }

  updateProgress(progress: number) {
    if (this.children.length && !this.done) {
      this.current.updateProgress(progress);
      this.setProgress(this.getProgress());
    } else if (!this.children.length && !this.done) {
      this.setProgress(progress);
    }
  }

  get(id: string): DownloadItem<T> | undefined {
    return this.id === id ? this : this.children.find((i) => i.get(id));
  }
}
