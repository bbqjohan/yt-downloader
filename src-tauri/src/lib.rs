// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#![allow(warnings)]

use std::{
    io::{BufRead, BufReader, Stdout},
    process::{Command, Stdio},
};

use serde::Serialize;
use tauri::ipc::Channel;

mod ytdlp;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn fetch_data(url: &str) -> Result<ytdlp::YtdlpResponse, String> {
    // let output = Command::new("yt-dlp").arg(format!("-F {}", url)).output();

    match ytdlp::read() {
        Some(resp) => Ok(resp),
        None => Err("Error fetching data".to_string()),
    }
}

#[derive(Clone, Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "event",
    content = "data"
)]
enum DownloadEvent {
    Started {
        url: String,
        audio_format: String,
        video_format: String,
        // download_id: usize,
    },
    Progress {
        // download_id: usize,
        output: String,
    },
    Finished {
        // download_id: usize,
    },
}

#[tauri::command]
async fn download(
    url: &str,
    audio_format: &str,
    video_format: &str,
    on_event: Channel<DownloadEvent>,
) -> Result<(), ()> {
    // let output = Command::new("yt-dlp").arg(format!("-F {}", url)).output();
    let mut cmd = Command::new("yt-dlp")
        .arg(format!("-f {}+{}", audio_format, video_format))
        .arg("-o")
        .arg("C:\\Users\\korven\\Downloads\\%(title)s.%(ext)s")
        .arg("https://www.youtube.com/watch?v=Dl2vf04UCAM")
        .stdout(Stdio::piped())
        // .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    on_event.send(DownloadEvent::Started {
        url: url.to_string(),
        audio_format: audio_format.to_string(),
        video_format: video_format.to_string(),
    });

    {
        let stdout = cmd.stdout.as_mut().unwrap();
        let stdout_reader = BufReader::new(stdout);

        // Every line that displays download progress in output includes \r instead of \n. By
        // splitting them we can parse out the progress %, download speed and file size.
        let stdout_lines = stdout_reader.split(b'\r');

        for line in stdout_lines {
            let str = String::from_utf8(line.unwrap()).unwrap();

            println!("{:?}", str);

            on_event
                .send(DownloadEvent::Progress { output: str })
                .unwrap();
        }

        on_event.send(DownloadEvent::Finished {}).unwrap();
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, fetch_data, download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
