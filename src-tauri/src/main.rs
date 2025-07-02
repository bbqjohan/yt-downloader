// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(warnings)]

// use serde::{Deserialize, Serialize};
// use serde_json::{from_str, Value};

use std::io::{BufRead, BufReader, Read, Write};

mod ytdlp;

fn main() {
    // yt_dler_lib::run()
    // ytdlp();
    let mut child = ytdlp::download();

    match child {
        Ok(mut child) => {
            let out = child.wait_with_output().expect("No exit status");

            if (!out.status.success()) {
                println!("Error, {:#?}", String::from_utf8_lossy(&out.stderr));
                for line in String::from_utf8_lossy(&out.stdout).lines() {
                    eprintln!("ERR: {:#?}", line);
                }
            }
        }
        Err(err) => println!("{:#?}", err),
    }
}

// fn ytdlp() {
//     use regex::Regex;
//     use std::process::Command;
//     let re = Regex::new(r"^(\d+\-?\w+)\s+(\w+)\s+(\w+\s?\w+)(.*)").expect("Invalid regex");

// let cmd_output = Command::new("yt-dlp")
//     .arg("-j")
//     .arg("https://www.youtube.com/watch?v=Dl2vf04UCAM")
//     .output()
//     .expect("Failed to execute command");

// if output.status.success() {
//     for line in String::from_utf8_lossy(&output.stdout).lines() {
//         let help = from_str::<serde_json::Value>(line).unwrap();
//         let formats = help.get("formats").unwrap().as_array().unwrap().to_owned();
//         let title = help.get("title").unwrap();
//         let id = help.get("id").unwrap();

//         let formats: Vec<YtdlpFormat> = formats
//             .iter()
//             .map(|format: &Value| YtdlpFormat {
//                 // Using {.as_str.unwrap().to_owned()} to remove lingering \" escapes in
//                 // property values that would otherwise be there with a {.to_string()}.
//                 ext: format["ext"].as_str().unwrap().to_owned(),
//                 abr: format["abr"].as_f64(),
//                 vbr: format["vbr"].as_f64(),
//                 audio_ext: format["audio_ext"].as_str().unwrap().to_owned(),
//                 format_id: format["format_id"].as_str().unwrap().to_owned(),
//                 resolution: format["resolution"].as_str().unwrap().to_owned(),
//                 video_ext: format["video_ext"].as_str().unwrap().to_owned(),
//                 filesize: format["filesize"].as_u64(),
//                 vcodec: format["vcodec"].as_str().unwrap().to_owned(),
//                 protocol: format["protocol"].as_str().unwrap().to_owned(),
//                 fps: format["fps"].as_f64(),
//             })
//             .collect();

//         println!("{:#?}", formats);

//         let mut audio_only: Vec<YtdlpFormat> = vec![];
//         let mut video_only: Vec<YtdlpFormat> = vec![];

//         for format in formats {
//             println!("{:?}", &format.resolution,);

//             if format.resolution == "audio only" {
//                 audio_only.push(format);
//             } else if format.audio_ext == "none" && format.ext != "mhtml" {
//                 video_only.push(format);
//             }
//         }

//         let resp = YtdlpResponse {
//             id: id.to_string(),
//             title: title.to_string(),
//             audio: audio_only,
//             video: video_only,
//         };

//         println!("{:#?}", resp);

// println!(
//     "{:#?}\n\n{:#?}",
//     &serde_json::to_string(&resp).unwrap(),
//     serde_json::from_str::<YtdlpResponse>(&serde_json::to_string(&resp).unwrap())
// );

// if line.contains("audio only") {
//     for (_, [id, ext, resolution, fps]) in re.captures_iter(&line).map(|c| c.extract()) {
//         println!("{:?}", [id, ext, resolution, fps]);
//     }

//     // line.split(r"^\d+").for_each(|part| {
//     //     println!("{}", part);
//     // });
//     // println!("{}", line);
// }
// }

// let stdout = String::from_utf8_lossy(&output.stdout);
// println!("Output: {}", stdout);
// } else {
// let stderr = String::from_utf8_lossy(&output.stderr);
// eprintln!("Error: {}", stderr);
// }
// }
