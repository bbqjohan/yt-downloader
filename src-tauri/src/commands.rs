use anyhow::{anyhow, Result as AnyResult};
use regex::Regex;
use serde::Serialize;
use std::{
    io::{BufRead, BufReader, Stdout},
    process::{Command, Stdio},
};
use tauri::ipc::Channel;

/// Represents the possible events that can be sent back to the frontend during a download
/// operation.
///
/// # Variants
///
/// - `Started {}`: Indicates that the download operation has started.
/// - `Progress { progress: f64 }`: Indicates the progress of the download as a floating-point percentage (0.0 to 100.0).
/// - `Finished {}`: Indicates that the download operation has finished successfully.
/// - `Error { message: String, help: String }`: Indicates that an error occurred during the
/// download operation, providing an error message and an optional help string with suggestions for
/// resolution.
#[derive(Clone, Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "event",
    content = "data"
)]
pub enum DownloadEvent {
    Started {},
    Progress { progress: f64 },
    Finished {},
    Error { message: String, help: String },
}

struct DownloadError {
    message: String,
    help: String,
}

/// Namespace for the download command.
struct Download {}
impl Download {
    /// Checks the download command output for any errors messages.
    ///
    /// The returned value contains both the original error message and a text describing what can
    /// be done to fix the issue.
    fn get_error_message(output: &[u8]) -> AnyResult<DownloadError> {
        let text = String::from_utf8_lossy(output).into_owned();
        let pattern_sign_in = Regex::new(r"ERROR:.*Sign in to confirm you.re not a bot")?;

        if (pattern_sign_in.is_match(&text)) {
            return Ok(DownloadError {
                message: "Sign in to confirm you're not a bot.".to_string(),
                help:
                    "This error can happen if you're behind a VPN. Try disabling the VPN and try again."
                        .to_string(),
            });
        }

        let pattern_format_not_available =
            Regex::new(r"ERROR:.*Requested format is not available")?;

        if (pattern_format_not_available.is_match(&text)) {
            return Ok(DownloadError {
                message: "Requested format is not available.".to_string(),
                help: "This error can sometimes be fixed by updating yt-dlp. Try updating it and try again. Alternatively, if you know the format is available, sometimes just trying again will work.".to_string()
            });
        }

        Ok(DownloadError {
            message: text.to_string(),
            help: "".to_string(),
        })
    }

    /// Returns the appropriate yt-dlp format argument for audio downloads based on the specified
    /// preferences.
    ///
    /// - If `worst_audio` is `Some(true)`, the function returns the format string for the worst
    ///   available audio quality.
    fn get_audio_format_arg(worst_audio: Option<&bool>) -> String {
        if (worst_audio.is_some_and(|x| x == &true)) {
            return "wa".to_string();
        }

        return "ba".to_string();
    }

    /// Returns the appropriate yt-dlp format argument for video downloads based on the specified
    /// preferences.
    fn get_video_format_arg(height: VideoHeight, constraint: VideoHeightConstraint) -> String {
        return format!("bv[height{}{}]", constraint.to_string(), height.to_string());
    }

    /// Collects audio and video format arguments to one string argurment that can be passed
    /// to the yt-dlp download command.
    ///
    /// The argument uses direct download only, ignoring fragmented downloads.
    fn get_format_arg(audio_format: &str, video_format: &str) -> String {
        return format!("({}+{})[protocol^=http]", audio_format, video_format);
    }
}

/// Represents the possible video resolutions (heights) that can be selected for a video download.
///
/// Each variant corresponds to a specific vertical resolution in pixels, commonly used in video
/// formats:
/// - `P144`: 144p (144 pixels high)
/// - `P240`: 240p
/// - `P360`: 360p
/// - `P480`: 480p
/// - `P720`: 720p (HD)
/// - `P1080`: 1080p (Full HD)
/// - `P1440`: 1440p (2K)
/// - `P2160`: 2160p (4K)
///
/// This enum is used to specify or restrict the desired video quality when downloading videos.
enum VideoHeight {
    P144,
    P240,
    P360,
    P480,
    P720,
    P1080,
    P1440,
    P2160,
}

impl VideoHeight {
    pub fn to_string(&self) -> String {
        match (&self) {
            Self::P144 => "144",
            Self::P240 => "240",
            Self::P360 => "360",
            Self::P480 => "480",
            Self::P720 => "720",
            Self::P1080 => "1080",
            Self::P1440 => "1440",
            Self::P2160 => "2160",
        }
        .to_owned()
    }
}

impl TryFrom<&str> for VideoHeight {
    type Error = anyhow::Error;

    fn try_from(value: &str) -> AnyResult<Self> {
        Ok(match (value) {
            "144" => Self::P144,
            "240" => Self::P240,
            "360" => Self::P360,
            "480" => Self::P480,
            "720" => Self::P720,
            "1080" => Self::P1080,
            "1440" => Self::P1440,
            "2160" => Self::P2160,
            _ => return Err(anyhow!(format!("{value} is an invalid video resolution."))),
        })
    }
}

/// Represents constraints that can be applied to video height selection when downloading videos.
///
/// This enum is used to specify how the desired video resolution should be matched:
/// - `Eq` (`=`): Select videos with a height exactly equal to the specified value.
/// - `Gte` (`>=`): Select videos with a height greater than or equal to the specified value.
/// - `Lte` (`<=`): Select videos with a height less than or equal to the specified value.
///
/// Used in conjunction with [`VideoHeight`] to control the quality of the downloaded video.
enum VideoHeightConstraint {
    Eq,
    Gte,
    Lte,
}

impl VideoHeightConstraint {
    pub fn to_string(&self) -> String {
        match (&self) {
            Self::Eq => "=",
            Self::Gte => ">=",
            Self::Lte => "<=",
        }
        .to_owned()
    }
}

impl TryFrom<&str> for VideoHeightConstraint {
    type Error = anyhow::Error;

    fn try_from(value: &str) -> AnyResult<Self> {
        Ok(match (value) {
            "=" => Self::Eq,
            ">=" => Self::Gte,
            "<=" => Self::Lte,
            _ => {
                return Err(anyhow!(format!(
                    "{value} is an invalid video resolution constraint."
                )))
            }
        })
    }
}

/// Downloads an audio only version of the video from the given URL using yt-dlp and sends
/// progress events back to the frontend via the provided channel.
///
/// The downloaded video will be of the best available quality which has a direct download
/// strategy.
#[tauri::command]
pub async fn download(
    url: &str,
    worst_audio: bool,
    output_path: &str,
    video_height: &str,
    video_height_constraint: &str,
    on_event: Channel<DownloadEvent>,
) -> Result<(), ()> {
    let vh = match VideoHeight::try_from(video_height) {
        Ok(v) => v,
        Err(e) => {
            on_event
                .send(DownloadEvent::Error {
                    message: e.to_string(),
                    help: "".to_string(),
                })
                .unwrap();

            return Ok(());
        }
    };

    let vhc = match VideoHeightConstraint::try_from(video_height_constraint) {
        Ok(v) => v,
        Err(e) => {
            on_event
                .send(DownloadEvent::Error {
                    message: e.to_string(),
                    help: "".to_string(),
                })
                .unwrap();

            return Ok(());
        }
    };

    let mut cmd = Command::new("yt-dlp")
        .arg("-f")
        .arg(Download::get_format_arg(
            &Download::get_audio_format_arg(Some(&worst_audio)),
            &Download::get_video_format_arg(vh, vhc)
        ))
        .arg("--force-overwrites")
        .arg("--progress-template")
        .arg("%(progress._percent)s|%(progress._total_bytes_str)s|%(progress._speed_str)s|%(progress._eta_str)s")
        .arg("--progress-delta")
        .arg("1")
        .arg("-o")
        .arg(format!("{}\\%(title)s.%(ext)s", output_path))
        .arg("https://www.youtube.com/watch?v=Dl2vf04UCAM")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    on_event.send(DownloadEvent::Started {});

    {
        let stdout = cmd.stdout.as_mut().unwrap();
        let stdout_reader = BufReader::new(stdout);

        // Every line that displays download progress in output includes \r instead of \n.
        let stdout_lines = stdout_reader.split(b'\r');

        for line in stdout_lines {
            let line_str = String::from_utf8(line.unwrap()).unwrap();
            let splits: Vec<&str> = line_str.split('|').collect();
            let progress = splits.get(0).unwrap_or(&"").to_string();
            let progress: f64 = progress.trim().parse().unwrap_or(-1.0);

            if (!(progress == -1.0)) {
                on_event
                    .send(DownloadEvent::Progress { progress: progress })
                    .unwrap();
            }

            println!("{:?}", line_str);
        }

        on_event.send(DownloadEvent::Finished {}).unwrap();
    }

    {
        let stderr = cmd.stderr.as_mut().unwrap();
        let stderr_reader = BufReader::new(stderr);

        // Every line that displays download progress in output includes \r instead of \n.
        let stderr_lines = stderr_reader.split(b'\r');

        for line in stderr_lines {
            match line {
                Ok(arr) => {
                    let error_message = Download::get_error_message(&arr);

                    match error_message {
                        Ok(message) => on_event.send(DownloadEvent::Error {
                            message: message.message,
                            help: message.help,
                        }),
                        Err(_) => Ok(()),
                    };
                }
                Err(_) => (),
            }
        }
    }

    Ok(())
}
