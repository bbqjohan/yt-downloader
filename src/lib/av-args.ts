interface IAvArgs {
  quality: string;
  preferDirectDownload: boolean;
  forceNoFragments: boolean;
}

interface IAudioArgs extends IAvArgs {
  language: string;
}

interface IVideoArgs extends IAvArgs {}

interface IFormatArgs {
  video: VideoArgs;
  audio: AudioArgs;
  fragmentThreads: number;
}

class GenArgs {
  static gen(name: string, operator: string, value: string): string {
    return `[${name}${operator}${value}]`;
  }
  static directDownload(): string {
    return GenArgs.gen("protocol", "^=", "http");
  }
  static language(lang: string): string {
    return GenArgs.gen("language", "=", lang);
  }
}

export class AudioArgs implements IAudioArgs {
  forceNoFragments: boolean = false;
  preferDirectDownload: boolean = true;
  quality: string = "";
  language: string = "";

  constructor(args: Partial<IAudioArgs>) {
    Object.keys(args).forEach((key) => {
      if (Object.hasOwn(this, key)) {
        this[key as keyof this] = args[
          key as keyof typeof args
        ] as this[keyof this];
      }
    });
  }

  build(): string {
    let cmdArgs: string[] = [];

    if (this.quality === "") {
      throw Error("Audio quality must be set.");
    }

    if (this.language) {
      cmdArgs.push(GenArgs.language(this.language));
    }

    if (this.forceNoFragments || this.preferDirectDownload) {
      cmdArgs.push(GenArgs.directDownload());
    }

    if (this.preferDirectDownload && !this.forceNoFragments) {
      cmdArgs.push(`/${this.quality}`);
    }

    return `(${this.quality}${cmdArgs.join("")})`;
  }
}

export class VideoArgs implements IVideoArgs {
  forceNoFragments: boolean = false;
  preferDirectDownload: boolean = true;
  quality: string = "";

  constructor(args: Partial<IVideoArgs>) {
    Object.keys(args).forEach((key) => {
      if (Object.hasOwn(this, key)) {
        this[key as keyof this] = args[
          key as keyof typeof args
        ] as this[keyof this];
      }
    });
  }

  build(): string {
    let cmdArgs: string[] = [];

    if (this.quality === "") {
      throw Error("Video quality must be set.");
    }

    if (this.forceNoFragments || this.preferDirectDownload) {
      cmdArgs.push(GenArgs.directDownload());
    }

    if (this.preferDirectDownload && !this.forceNoFragments) {
      cmdArgs.push(`/${this.quality}`);
    }

    return `(${this.quality}${cmdArgs.join("")})`;
  }
}

export class FormatArgs implements IFormatArgs {
  audio: AudioArgs;
  video: VideoArgs;
  fragmentThreads: number;

  constructor(args: IFormatArgs) {
    this.audio = args.audio;
    this.video = args.video;
    this.fragmentThreads = args.fragmentThreads;
  }

  build(): string {
    return `${this.audio.build()}+${this.video.build()} -N ${
      this.fragmentThreads
    }`;
  }
}
