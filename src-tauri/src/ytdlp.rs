use std::{
    io::Error,
    process::{Child, Command, Output, Stdio},
};

use serde::{Deserialize, Serialize};
use serde_json::Value;

enum Props {
    AudioOnly,
    None,
    Mhtml,
}

impl Props {
    fn as_str(&self) -> &str {
        match self {
            Props::AudioOnly => "audio only",
            Props::None => "none",
            Props::Mhtml => "mhtml",
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct YtdlpResponse {
    id: String,
    title: String,
    audio: Vec<YtdlpFormat>,
    video: Vec<YtdlpFormat>,
    thumbnail: String,
    channel: String,
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
    filesize_exact: Option<u64>,
    vcodec: String,
    protocol: String,
    fps: Option<f64>,
    filesize: Option<String>,
}

impl From<&serde_json::Value> for YtdlpFormat {
    fn from(format: &Value) -> Self {
        let mut ret = YtdlpFormat {
            // Using {.as_str.unwrap().to_owned()} to remove lingering \" escapes in
            // property values that would otherwise be there with a {.to_string()}.
            ext: format["ext"].as_str().unwrap().to_owned(),
            abr: format["abr"].as_f64(),
            vbr: format["vbr"].as_f64(),
            audio_ext: format["audio_ext"].as_str().unwrap().to_owned(),
            format_id: format["format_id"].as_str().unwrap().to_owned(),
            resolution: format["resolution"].as_str().unwrap().to_owned(),
            video_ext: format["video_ext"].as_str().unwrap().to_owned(),
            filesize_exact: format["filesize"].as_u64(),
            vcodec: format["vcodec"].as_str().unwrap().to_owned(),
            protocol: format["protocol"].as_str().unwrap().to_owned(),
            fps: format["fps"].as_f64(),
            filesize: None,
        };

        ret.filesize = match ret.filesize_exact {
            Some(num) => Some(format!("{} MiB", to_mib(num))),
            _ => None,
        };

        ret
    }
}

fn to_mib(num: u64) -> f64 {
    ((num as f64 / 1024_u64.pow(2) as f64) * 100_f64).floor() / 100_f64
}

pub fn read() -> Option<YtdlpResponse> {
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
        .map(YtdlpFormat::from)
        .collect();

    let title = test_output
        .get("title")
        .unwrap()
        .as_str()
        .unwrap()
        .to_owned();

    let id = test_output.get("id").unwrap().as_str().unwrap().to_owned();
    let thumbnail = test_output
        .get("thumbnail")
        .unwrap()
        .as_str()
        .unwrap()
        .to_owned();
    let channel = test_output
        .get("channel")
        .unwrap()
        .as_str()
        .unwrap()
        .to_owned();

    let mut audio_only: Vec<YtdlpFormat> = vec![];
    let mut video_only: Vec<YtdlpFormat> = vec![];

    for format in formats {
        if format.ext == Props::Mhtml.as_str() {
            continue;
        }

        if format.resolution == Props::AudioOnly.as_str() {
            audio_only.push(format);
        } else if format.audio_ext == Props::None.as_str() {
            video_only.push(format);
        }
    }

    let resp = YtdlpResponse {
        id,
        title,
        audio: audio_only,
        video: video_only,
        thumbnail,
        channel,
    };

    Some(resp)
}

pub fn download(// audio_format: &str,
    // video_format: &str
) -> Result<Child, Error> {
    let cmd = Command::new("yt-dlp")
        .arg("-F")
        // .arg(format!("{}+{}", audio_format, video_format))
        // .arg("-o")
        // .arg("C:\\Users\\korvb\\Downloads\\%(title)s.%(ext)s")
        .arg("https://www.youtube.com/watch?v=Dl2vf04UCAM")
        // .stdout(Stdio::piped())
        // .stderr(Stdio::piped())
        .spawn();

    // let status = cmd.wait();
    // println!("Exited with status {:?}", status);

    cmd
}
