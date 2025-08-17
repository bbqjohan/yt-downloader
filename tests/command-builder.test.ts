import { AudioArgs, FormatArgs, VideoArgs } from "../src/lib/av-args";

describe("Testing command builder", () => {
  test("Audio quality must be specified", () => {
    expect(() => new AudioArgs({ quality: "" }).build()).toThrow();
    expect(() => new AudioArgs({ quality: "anything" }).build()).not.toThrow();
  });

  test("Audio arg default build", () => {
    const mock = jest.fn(() => new AudioArgs({ quality: "anything" }).build());

    mock();

    expect(mock).toHaveReturnedWith("(anything[protocol^=http]/anything)");
  });

  test("Audio language argument inclusion", () => {
    expect(
      new AudioArgs({ quality: "anything", language: "de-DE" }).build()
    ).toContain("[language=de-DE]");
  });

  test("Audio direct download preference", () => {
    expect(
      new AudioArgs({
        quality: "anything",
        preferDirectDownload: true,
        forceNoFragments: false,
      }).build()
    ).toContain("[protocol^=http]");

    expect(
      new AudioArgs({
        quality: "anything",
        forceNoFragments: true,
        preferDirectDownload: false,
      }).build()
    ).toContain("[protocol^=http]");
  });

  test("Audio fallback to any download protocol", () => {
    expect(
      new AudioArgs({
        quality: "anything",
        preferDirectDownload: true,
        forceNoFragments: false,
      }).build()
    ).toContain("/anything");

    expect(
      new AudioArgs({
        quality: "anything",
        forceNoFragments: true,
        preferDirectDownload: false,
      }).build()
    ).not.toContain("/anything");

    expect(
      new AudioArgs({
        quality: "anything",
        forceNoFragments: false,
        preferDirectDownload: false,
      }).build()
    ).not.toContain("/anything");
  });

  test("Video quality must be specified", () => {
    expect(() => new VideoArgs({ quality: "" }).build()).toThrow();
    expect(() => new VideoArgs({ quality: "anything" }).build()).not.toThrow();
  });

  test("Build format string", () => {
    expect(
      new FormatArgs({
        audio: new AudioArgs({ quality: "wa" }),
        video: new VideoArgs({ quality: "wv" }),
        fragmentThreads: 20,
      }).build()
    ).toBe("(wa[protocol^=http]/wa)+(wv[protocol^=http]/wv) -N 20");
  });

  test("forceNoFragments takes precedent over fallback", () => {
    expect(
      new AudioArgs({
        quality: "anything",
        forceNoFragments: true,
        preferDirectDownload: true,
      }).build()
    ).not.toContain("/anything");
  });
});
