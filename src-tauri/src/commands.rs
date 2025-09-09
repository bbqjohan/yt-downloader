use anyhow::Result as AnyResult;
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
    Progress {},
    Finished {},
}

/// Downloads an audio only version of the video from the given URL using yt-dlp and sends
/// progress events back to the frontend via the provided channel.
///
/// The downloaded video will be of the best available quality which has a direct download
/// strategy.
#[tauri::command]
pub async fn download(url: &str, on_event: Channel<DownloadEvent>) -> Result<(), ()> {
    // let output = Command::new("yt-dlp").arg(format!("-F {}", url)).output();
    let mut cmd = Command::new("yt-dlp")
        .arg("-f ba[protocol^=http]")
        .arg("--force-overwrites")
        .arg("-o")
        .arg(".\\test-downloads\\%(title)s.%(ext)s")
        .arg("https://www.youtube.com/watch?v=Dl2vf04UCAM")
        .stdout(Stdio::piped())
        // .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    on_event.send(DownloadEvent::Started {});

    {
        let stdout = cmd.stdout.as_mut().unwrap();
        let stdout_reader = BufReader::new(stdout);

        // Every line that displays download progress in output includes \r instead of \n. By
        // splitting them we can parse out the progress %, download speed and file size.
        let stdout_lines = stdout_reader.split(b'\r');

        for line in stdout_lines {
            let str = String::from_utf8(line.unwrap()).unwrap();

            println!("{:?}", str);
        }

        on_event.send(DownloadEvent::Finished {}).unwrap();
    }

    Ok(())
}
