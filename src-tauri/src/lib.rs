// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#![allow(warnings)]

use std::{io::{BufRead, BufReader, Stdout}, process::{Command, Stdio}};

use serde::Serialize;
use tauri::ipc::Channel;

mod ytdlp;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_data(url: &str) -> Result<ytdlp::YtdlpResponse, String> {
    // let output = Command::new("yt-dlp").arg(format!("-F {}", url)).output();

    match ytdlp::read() {
        Some(resp) => Ok(resp),
        None => Err("Error fetching data".to_string()),
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", rename_all_fields = "camelCase", tag = "event", content = "data")]
enum DownloadEvent {
  Started {
    // url: &'a str,
    download_id: usize,
    // content_length: usize,
  },
  Progress {
    download_id: usize,
    output: String,
  },
  Finished {
    download_id: usize,
  },
}

#[tauri::command]
async fn download(on_event: Channel<DownloadEvent>) {
    // let output = Command::new("yt-dlp").arg(format!("-F {}", url)).output();
    let mut cmd = Command::new("yt-dlp")
        .arg("-f 397")
        // .arg(format!("{}+{}", audio_format, video_format))
        // .arg("-o")
        // .arg("C:\\Users\\korvb\\Downloads\\%(title)s.%(ext)s")
        .arg("https://www.youtube.com/watch?v=Dl2vf04UCAM")
        .stdout(Stdio::piped())
        // .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    let download_id = 1;

    {
        let stdout = cmd.stdout.as_mut().unwrap();
        let stdout_reader = BufReader::new(stdout);
        let stdout_lines = stdout_reader.split(b'\r');

        for line in stdout_lines {
            let str = String::from_utf8(line.unwrap()).unwrap();
            println!("{:?}", str);
            on_event.send(DownloadEvent::Progress { download_id, output: str }).unwrap();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, fetch_data, download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
