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
    AlreadyDownloaded {
        download_id: String,
    },
}

#[tauri::command]
async fn download(
    download_id: &str,
    url: &str,
    audio_format: &str,
    video_format: &str,
    output_dir: &str,
    video_title: &str,
    on_event: Channel<DownloadEvent>,
) -> Result<(), ()> {
    // let output = Command::new("yt-dlp").arg(format!("-F {}", url)).output();
    let mut cmd = Command::new("yt-dlp")
        .arg(format!("-f {}+{}", audio_format, video_format))
        .arg("-o")
        .arg(format!("{}\\{}.%(ext)s", output_dir, video_title))
        .arg(url)
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
        let mut last_line: String = String::from("");

        for line in stdout_lines {
            let str = String::from_utf8(line.unwrap()).unwrap();

            println!("{:?}", str);

            last_line = str.to_owned();

            on_event
                .send(DownloadEvent::Progress { output: str })
                .unwrap();
        }

        if !last_line.is_empty() {
            if is_already_downloaded(&last_line, output_dir) {
                on_event
                    .send(DownloadEvent::AlreadyDownloaded {
                        download_id: download_id.to_string(),
                    })
                    .unwrap();
            }
        }

        on_event.send(DownloadEvent::Finished {}).unwrap();
    }

    Ok(())
}

fn is_format_unavailable(str: &str) -> bool {
    return str.contains("ERROR: [youtube]")
        && str.contains(
            "Requested format is not available. Use --list-formats for a list of available formats",
        );
}

fn is_already_downloaded(str: &str, output_dir: &str) -> bool {
    return match str.split("\n[download]").find(|s| s.contains(output_dir)) {
        Some(_) => true,
        None => false,
    };
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, fetch_data, download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
