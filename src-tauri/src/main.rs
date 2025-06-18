// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use serde_json::{from_str, Value};

fn main() {
    // yt_dler_lib::run()
    ytdlp();
}

fn to_ytdlp_format(format: &serde_json::Value) -> YtdlpFormat {
    YtdlpFormat {
        // Using {.as_str.unwrap().to_owned()} to remove lingering \" escapes in
        // property values that would otherwise be there with a {.to_string()}.
        ext: format["ext"].as_str().unwrap().to_owned(),
        abr: format["abr"].as_f64(),
        vbr: format["vbr"].as_f64(),
        audio_ext: format["audio_ext"].as_str().unwrap().to_owned(),
        format_id: format["format_id"].as_str().unwrap().to_owned(),
        resolution: format["resolution"].as_str().unwrap().to_owned(),
        video_ext: format["video_ext"].as_str().unwrap().to_owned(),
        filesize: format["filesize"].as_u64(),
        vcodec: format["vcodec"].as_str().unwrap().to_owned(),
        protocol: format["protocol"].as_str().unwrap().to_owned(),
        fps: format["fps"].as_f64(),
    }
}

const RESOLUTION_AUDIO_ONLY: &str = "audio only";
const EXT_NONE: &str = "none";
const EXT_MHTML: &str = "mhtml";

fn ytdlp() {
    use regex::Regex;
    use std::process::Command;
    let re = Regex::new(r"^(\d+\-?\w+)\s+(\w+)\s+(\w+\s?\w+)(.*)").expect("Invalid regex");

    // let cmd_output = Command::new("yt-dlp")
    //     .arg("-j")
    //     .arg("https://www.youtube.com/watch?v=Dl2vf04UCAM")
    //     .output()
    //     .expect("Failed to execute command");

    let test_output = serde_json::from_str::<serde_json::Value>(
        &std::fs::read_to_string("./yt-test.json").unwrap(),
    )
    .unwrap();

    let formats: Vec<YtdlpFormat> = test_output
        .get("formats")
        .unwrap()
        .as_array()
        .unwrap()
        .to_owned()
        .iter()
        .map(to_ytdlp_format)
        .collect();

    let title = test_output
        .get("title")
        .unwrap()
        .as_str()
        .unwrap()
        .to_owned();

    let id = test_output.get("id").unwrap().as_str().unwrap().to_owned();

    let mut audio_only: Vec<YtdlpFormat> = vec![];
    let mut video_only: Vec<YtdlpFormat> = vec![];

    for format in formats {
        if format.ext == EXT_MHTML {
            continue;
        }

        if format.resolution == RESOLUTION_AUDIO_ONLY {
            audio_only.push(format);
        } else if format.audio_ext == EXT_NONE {
            video_only.push(format);
        }
    }

    let resp = YtdlpResponse {
        id: id,
        title: title,
        audio: audio_only,
        video: video_only,
    };

    println!("{:#?}", resp);

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
}

#[derive(Serialize, Deserialize, Debug)]
struct YtdlpResponse {
    id: String,
    title: String,
    audio: Vec<YtdlpFormat>,
    video: Vec<YtdlpFormat>,
}

#[derive(Serialize, Deserialize, Debug)]
struct YtdlpFormat {
    audio_ext: String,
    ext: String,
    format_id: String,
    resolution: String,
    video_ext: String,
    abr: Option<f64>,
    vbr: Option<f64>,
    filesize: Option<u64>,
    vcodec: String,
    protocol: String,
    fps: Option<f64>,
}

// struct YtDlpFormat {
//     // Metadata
//     format_id: String,
//     protocol: String,
//     total_bitrate: Option<String>,
//     more_info: Option<String>,

//     // File
//     extension: String,
//     file_size: Option<String>,

//     // Audio
//     audio_codec: Option<String>,
//     audio_bitrate: Option<String>,
//     audio_sample_rate: Option<String>,
//     audio_channels: Option<String>,

//     // Video
//     video_codec: String,
//     video_bitrate: Option<String>,
//     framerate: Option<String>,
//     resolution: String,
// }

// impl YtDlpFormat {
//     fn new(format_id: String, protocol: String, total_bitrate: Option<String>, more_info: Option<String>,
//            extension: String, file_size: Option<String>, audio_codec: Option<String>,
//            audio_bitrate: Option<String>, audio_sample_rate: Option<String>, audio_channels: Option<String>,
//            video_codec: String, video_bitrate: Option<String>, framerate: Option<String>, resolution: String) -> Self {
//         YtDlpFormat {
//             format_id,
//             protocol,
//             total_bitrate,
//             more_info,
//             extension,
//             file_size,
//                 audio_codec,
//                 audio_bitrate,
//             audio_sample_rate,
//             audio_channels,
//             video_codec,
//             video_bitrate,
//             framerate,
//             resolution,
//         }
//     }
//     fn default() -> Self {
//         YtDlpFormat {
//             format_id: String::new(),
//             protocol: String::new(),
//             total_bitrate: None,
//             more_info: None,
//             extension: String::new(),
//             file_size: None,
//             audio_codec: None,
//             audio_bitrate: None,
//             audio_sample_rate: None,
//             audio_channels: None,
//             video_codec: String::new(),
//             video_bitrate: None,
//             framerate: None,
//             resolution: String::new(),
//         }
//     }
// }
