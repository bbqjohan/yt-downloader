import { path } from "@tauri-apps/api";
import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import z from "zod";

const defaultDownloadDir = await path.downloadDir();

const AudioSettingsSchema = z.object({
  isWorstQuality: z.boolean(),
});

type AudioSettingsSchema = z.infer<typeof AudioSettingsSchema>;

export const VideoSettingsSchema = z.object({
  height: z.literal([
    "144",
    "240",
    "360",
    "480",
    "720",
    "1080",
    "1440",
    "2160",
  ]),
  heightConstraint: z.literal(["=", "<=", ">="]),
});

export type VideoHeights = z.infer<typeof VideoSettingsSchema.shape.height>;
export type VideoHeightConstraints = z.infer<
  typeof VideoSettingsSchema.shape.heightConstraint
>;
type VideoSettingsSchema = z.infer<typeof VideoSettingsSchema>;

const GeneralSettingsSchema = z.object({
  outputPath: z.string(),
});

type GeneralSettingsSchema = z.infer<typeof GeneralSettingsSchema>;

const SettingsSchema = z.object({
  audio: AudioSettingsSchema,
  video: VideoSettingsSchema,
  general: GeneralSettingsSchema,
});

type SettingsSchema = z.infer<typeof SettingsSchema>;

export class File {
  static async defaults(): Promise<Settings> {
    const hello = new Settings({
      general: new GeneralSettings({
        outputPath: defaultDownloadDir,
      }),
    });

    return hello;
  }

  static async create() {
    mkdir("data", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });

    try {
      await writeTextFile(
        "data/settings.json",
        JSON.stringify(await File.defaults(), null, 2),
        {
          baseDir: BaseDirectory.AppData,
          createNew: true,
        }
      );
    } catch (e) {
      // File already exists, do nothing.
    }
  }

  static async read(): Promise<SettingsSchema> {
    let result: SettingsSchema;

    try {
      const file = await readTextFile("data/settings.json", {
        baseDir: BaseDirectory.AppData,
      });

      result = SettingsSchema.parse(JSON.parse(file));
    } catch (e) {
      console.log(e);
      throw e;
    }

    return result;
  }

  static async write(data: SettingsSchema): Promise<void> {
    try {
      SettingsSchema.parse(data);

      await writeTextFile("data/settings.json", JSON.stringify(data, null, 2), {
        baseDir: BaseDirectory.AppData,
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}

class VideoSettings implements VideoSettingsSchema {
  height: VideoHeights = "360";
  heightConstraint: VideoHeightConstraints = "=";

  constructor(data?: DeepPartial<VideoSettingsSchema>) {
    mergeClassArgs(VideoSettingsSchema, this, data);
  }
}

class AudioSettings implements AudioSettingsSchema {
  isWorstQuality = false;

  constructor(data?: DeepPartial<AudioSettingsSchema>) {
    mergeClassArgs(AudioSettingsSchema, this, data);
  }
}

class GeneralSettings implements GeneralSettingsSchema {
  outputPath = "";

  constructor(data?: DeepPartial<GeneralSettingsSchema>) {
    mergeClassArgs(GeneralSettingsSchema, this, data);
  }
}

class Settings implements SettingsSchema {
  audio: AudioSettings;
  video: VideoSettings;
  general: GeneralSettings;

  constructor(data?: DeepPartial<SettingsSchema>) {
    this.audio = new AudioSettings(data?.audio);
    this.video = new VideoSettings(data?.video);
    this.general = new GeneralSettings(data?.general);

    SettingsSchema.parse(this);
  }
}

function mergeClassArgs<T, S extends z.ZodObject>(
  schema: S,
  obj: T,
  data?: DeepPartial<z.infer<S>>
) {
  let keys = data ? Object.keys(data) : [];

  keys.forEach((key) => {
    obj[key as keyof typeof obj] = (data as object)[
      key as keyof typeof data
    ] as (typeof obj)[keyof typeof obj];
  });

  return schema.parse(obj);
}
