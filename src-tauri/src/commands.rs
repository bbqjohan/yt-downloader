use anyhow::Result as AnyResult;
use regex::Regex;
use serde::Serialize;
use std::{
    io::{BufRead, BufReader, Stdout},
    process::{Command, Stdio},
};
use tauri::ipc::Channel;

/// Events that can be sent back to the frontend during a download operation.
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
    ///   available audio quality that uses the HTTP protocol.
    fn get_audio_format_arg(worst_audio: Option<&bool>) -> String {
        if (worst_audio.is_some_and(|x| x == &true)) {
            return "wa[protocol^=http]".to_string();
        }

        return "ba[protocol^=http]".to_string();
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
    on_event: Channel<DownloadEvent>,
) -> Result<(), ()> {
    let mut cmd = Command::new("yt-dlp")
        .arg("-f")
        .arg(Download::get_audio_format_arg(Some(&worst_audio)))
        .arg("--force-overwrites")
        .arg("--progress-template")
        .arg("%(progress._percent)s|%(progress._total_bytes_str)s|%(progress._speed_str)s|%(progress._eta_str)s")
        .arg("--progress-delta")
        .arg("1")
        .arg("-o")
        .arg("..\\test-downloads\\%(title)s.%(ext)s")
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
