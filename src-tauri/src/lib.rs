// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn fetch_data(url: &str) -> String {
    let output = Command::new("yt-dlp")
        .arg(format!("-F {}", url))
        .output();

    match output {
        Ok(output) => format!("Data fetched successfully: {}", String::from_utf8_lossy(&output.stdout)),
        Err(error) => format!("Error fetching data: {}", error),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, fetch_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
