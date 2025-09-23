import { path } from "@tauri-apps/api";
import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import z from "zod";

const DEFAULT_DOWNLOAD_DIR = await path.downloadDir();

/**
 * Represents the settings file on the user's machine.
 */
export class File {
  /**
   * Creates and returns default data for the settings file.
   *
   * @returns Default data for the settings file.
   */
  static defaults(): Settings {
    return new Settings();
  }

  /**
   * Attempts to create the settings file. If it already exists, it does nothing.
   */
  static async create() {
    mkdir("data", {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });

    try {
      await writeTextFile(
        "data/settings.json",
        JSON.stringify(File.defaults(), null, 2),
        {
          baseDir: BaseDirectory.AppData,
          createNew: true,
        }
      );
    } catch (e) {
      // File already exists, do nothing.
    }
  }

  /**
   * Attemps to read the settings file. Throws on failure.
   *
   * @returns The settings file, on a successful read.
   */
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

  /**
   * Writes to the settings file. Overwrites the whole file, so be sure to pass in the full
   * settings object.
   *
   * @param data Data to write to the settings file.
   */
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

export const VideoSettingsSchema = z.object({
  height: z.literal<VideoHeightList>([
    "144",
    "240",
    "360",
    "480",
    "720",
    "1080",
    "1440",
    "2160",
  ]),
  heightConstraint: z.literal<VideoHeightConstraintList>(["=", "<=", ">="]),
});

/**
 * Represents the possible video height resolutions supported by the application.
 *
 * This tuple type is used to constrain the allowed values for video resolution selection.
 * The values correspond to common vertical pixel resolutions for video content.
 *
 * If you need to a type for selecting a value from this list, use `VideoHeights`.
 */
export type VideoHeightList = [
  "144",
  "240",
  "360",
  "480",
  "720",
  "1080",
  "1440",
  "2160"
];

/**
 * Represents the possible video height values as defined by the `height` property
 * in the `VideoSettingsSchema`.
 *
 * Provides type safety in situations where you, for example, need to use only one of the
 * available values from {@link VideoHeightList}.
 */
export type VideoHeights = z.infer<typeof VideoSettingsSchema.shape.height>;

/**
 * Represents the possible constraints you can put on video height resolution.
 * This tuple type is used to constrain what resolutions the video can be downloaded in.
 *
 * If you need to a type for selecting a value from this list, use `VideoHeightConstraints`.
 */
export type VideoHeightConstraintList = ["=", "<=", ">="];

/**
 * Represents the constraints for the height of a video as defined by the `heightConstraint`
 * property in the `VideoSettingsSchema` Zod schema.
 *
 * Provides type safety in situations where you, for example, need to use only one of the
 * available values from {@link VideoHeightConstraintList}.
 */
export type VideoHeightConstraints = z.infer<
  typeof VideoSettingsSchema.shape.heightConstraint
>;

export type VideoSettingsSchema = z.infer<typeof VideoSettingsSchema>;

/**
 * This class represents a part of the settings file shcema.
 *
 * Only includes defaulted data unless otherwise specified. As such, if you ever want the original
 * default values of the settings, just make an instance without arguments.
 */
export class VideoSettings implements VideoSettingsSchema {
  height: VideoHeights = "360";
  heightConstraint: VideoHeightConstraints = "=";

  constructor(data?: DeepPartial<VideoSettingsSchema>) {
    mergeClassArgs(VideoSettingsSchema, this, data);
  }
}

export const AudioSettingsSchema = z.object({
  isWorstQuality: z.boolean(),
});

export type AudioSettingsSchema = z.infer<typeof AudioSettingsSchema>;

/**
 * This class represents a part of the settings file shcema.
 *
 * Only includes defaulted data unless otherwise specified. As such, if you ever want the original
 * default values of the settings, just make an instance without arguments.
 */
export class AudioSettings implements AudioSettingsSchema {
  isWorstQuality = false;

  constructor(data?: DeepPartial<AudioSettingsSchema>) {
    mergeClassArgs(AudioSettingsSchema, this, data);
  }
}

export const GeneralSettingsSchema = z.object({
  outputPath: z.string(),
});

export type GeneralSettingsSchema = z.infer<typeof GeneralSettingsSchema>;

/**
 * This class represents a part of the settings file shcema.
 *
 * Only includes defaulted data unless otherwise specified. As such, if you ever want the original
 * default values of the settings, just make an instance without arguments.
 */
export class GeneralSettings implements GeneralSettingsSchema {
  outputPath = DEFAULT_DOWNLOAD_DIR;

  constructor(data?: DeepPartial<GeneralSettingsSchema>) {
    mergeClassArgs(GeneralSettingsSchema, this, data);
  }
}

export const SettingsSchema = z.object({
  audio: AudioSettingsSchema,
  video: VideoSettingsSchema,
  general: GeneralSettingsSchema,
});

export type SettingsSchema = z.infer<typeof SettingsSchema>;

/**
 * This class represents the entire settings file schema.
 *
 * Only includes defaulted data unless otherwise specified. As such, if you ever want the original
 * default values of the settings, just make an instance without arguments.
 */
export class Settings implements SettingsSchema {
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

/**
 * Merges a class instance with optional data. Merged object is then parsed by Zod, and will
 * throw if it doesn't adhere to the provided schema.
 *
 * @param schema - What schema to compare the merged object to.
 * @param obj - The class instance to merge with optional data.
 * @param data - Optional data to merge with the class instance.
 */
function mergeClassArgs<T extends object, S extends z.ZodObject>(
  schema: S,
  obj: T,
  data?: DeepPartial<z.infer<S>>
) {
  let keys = data ? Object.keys(data) : [];

  keys.forEach((key) => {
    if (Object.hasOwn(obj, key)) {
      obj[key as keyof typeof obj] = (data as object)[
        key as keyof typeof data
      ] as (typeof obj)[keyof typeof obj];
    }
  });

  schema.parse(obj);
}
