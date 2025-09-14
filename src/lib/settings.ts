import { path } from "@tauri-apps/api";
import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import z from "zod";
import {
  VideoHeightConstraintValues,
  VideoHeightValues,
} from "../hooks/download-video";

export async function defaultSettings(): Promise<SettingsSchema> {
  return {
    audio: {
      isWorstQuality: false,
    },
    video: {
      height: "360",
      heightConstraint: "=",
    },
    general: {
      outputPath: await path.downloadDir(),
    },
  };
}

export async function createSettings() {
  mkdir("data", {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  });

  try {
    await writeTextFile(
      "data/settings.json",
      JSON.stringify(await defaultSettings(), null, 2),
      {
        baseDir: BaseDirectory.AppData,
        createNew: true,
      }
    );
  } catch (e) {
    // File already exists, do nothing.
  }
}

export async function read(): Promise<SettingsSchema> {
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

export async function write(data: SettingsSchema): Promise<void> {
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

const AudioSettingsSchema = z.object({
  isWorstQuality: z.boolean(),
});

type AudioSettingsSchema = z.infer<typeof AudioSettingsSchema>;

const VideoSettingsSchema = z.object({
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

class VideoSettings implements VideoSettingsSchema {
  height: VideoHeightValues = "360";
  heightConstraint: VideoHeightConstraintValues = "=";

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
    path
      .downloadDir()
      .then((path) => {
        this.outputPath = path;
      })
      .then(() => {
        mergeClassArgs(GeneralSettingsSchema, this, data);
      });
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

    mergeClassArgs(SettingsSchema, this, data);
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
