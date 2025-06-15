# Planning

## What problem will this application attempt to solve?

When I was without my fiber internet for a month I had to rely on my phone's 4G connection for watching YouTube. Since YouTube is an essential tool for both learning, for news, and entertainment, this quickly eats into the available data your phone provider gives you.

Viewing a video on YoutTube through your browser requires you to load the website with all of it's images, CSS, JS, HTML, video comments, the video itself and a list of recommended videos to watch next, and advertisements. This is not an exhaustive list of course, and there might be other data that's being sent to your browser that is not obvious.

Using `yt-dlp` you can reduce the amount of data that's required to view a video on YouTube by downloading it instead. It gives you the ability to download a video with separate video and audio quality and merge them together for a smaller file size. Otherwise, you're at the behest of YouTube's algorithm which will decide the best viewing experience for you based on your 4G connection, which may deplete your available data quicker then you'd like.

We aim for the following:

1. Give the user a simple and minimal application to interface with `yt-dlp`.
2. The application should have a small installation size.
3. Give the user a restricted set of controls to simplify the most common tasks.
4. Guide the user with sane defaults for best audio + video quality for the smallest file size.
5. Display progression on downloads with pause, resume and cancel functionality.

!!! info Power users
    
    Power users can and should be using the terminal and configuration files if they download a lot of content, but this is not the case for someone like myself and most others that only want need the occasional download. For us, remembering arguments for terminal commands is impractical and not a good user experience.

## Intended audience

- People on a limited data plan who wish to reduce the data they spend on videos.
- People that don't understand/don't have the time to bother installing and learning terminal commands to download some videos.
- People who wish to download and archive videos for various reasons. Could be for learning purposes, sleeping aid, documenting history, etc.

## Standouts

- **Tauri &mdash;** Most other projects are created using Electron which takes up a large amount of disk space (around 100 MB), while Tauri requires very little (around 10 MB, or less).
- **WebView &mdash;** There are projects written with a native UI, but they both look and feel antiquiated. With Tauri (which renders in a WebView) we can leverage HTML, CSS and JS to easily create an expressive and intuitive user experience using the vast UI ecosystem available for the web which is cross platform compatible.
- **Small downloads &mdash;** This application will focus on minimizing the download size of a video while still retaining an acceptable quality for viewing/listening.
- **Guidance &mdash;** I haven't seen a similar application that would explain to the user how they can save on bandwidth by pairing a low audio bitrate with a low to medium video bitrate, and what sort of videos would benefit from such things.

## Business

Fully open source. There will be no money generated from this product.

