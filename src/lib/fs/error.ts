export type FileErrorCode =
  | "invalid_json"
  | "could_not_read"
  | "invalid_value"
  | "not_sure";

export class FileError extends Error {
  code: FileErrorCode;

  constructor({
    message,
    code,
    options,
  }: {
    message: string;
    code: FileErrorCode;
    options?: ErrorOptions;
  }) {
    super(message, options);

    this.name = "FileError";
    this.code = code;

    Object.setPrototypeOf(this, FileError.prototype);
  }
}
