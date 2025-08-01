import { useMemo, useState } from "react";

export interface DownloadItemData {
  id: string;
  label: string;
  filesize?: string;
  progress: number;

  // @todo - Add functionality.
  // readonly done: boolean;
  // readonly aborted: boolean;
  // readonly paused: boolean;
}

export class DownloadItem implements DownloadItemData {
  id: string;
  filesize?: string;
  label: string;
  progress: number;

  constructor({ id, filesize, label, progress = 0 }: DownloadItemData) {
    this.id = id;
    this.filesize = filesize;
    this.label = label;
    this.progress = progress;
  }

  isDone(): boolean {
    return this.progress >= 100;
  }

  setProgress(progress: number): this {
    this.progress = progress;

    return this;
  }
}

export const useDownloadQueue = () => {
  const [items, setItems] = useState<DownloadItem[]>();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const current = useMemo(() => {
    return items?.[index];
  }, [items, index]);

  function next() {
    setIndex((prev) => prev + 1);

    if (index + 1 === (items?.length ?? 0) - 1) {
      setDone(true);
    }
  }

  function update(itemProgress: number) {
    if (Number.isNaN(itemProgress)) {
      throw Error("Cannot use NaN for progress.");
    }

    if (current) {
      current.setProgress(itemProgress);
      setProgress(getProgress());

      if (itemProgress >= 100) {
        console.log("next");
        next();
      }
    }
  }

  function getProgress(): number {
    const item = items?.[index];

    console.log(
      index,
      item,
      item
        ? Math.round(
            (index / items.length + item.progress / (items.length * 100)) * 100
          )
        : 0
    );

    return item
      ? Math.round(
          (index / items.length + item.progress / (items.length * 100)) * 100
        )
      : 0;
  }

  return {
    items,
    index,
    current,
    done,
    progress,
    setIndex,
    setItems,
    next,
    getProgress,
    update,
  };
};
