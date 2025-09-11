// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(warnings)]

use std::io::{BufRead, BufReader, Read, Write};

mod ytdlp;

fn main() {
    yt_dler_lib::run()
}
