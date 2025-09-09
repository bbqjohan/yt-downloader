## Personas

### User

- Uses 4g internet.
- Have limited bandwidth.
- Internet stability is poor.
- Is on a paid data plan.
- Is going to be off-grid.
- Wants to minimize the data used by downloading videos with a lower bitrate.

### Key points

- Minimize download.
    - Audio only downloads weighs much less than a full video.
    - Many videos can be treated as podcasts, so loss of video is not a big deal.
    - Quick testing shows 23-65% reduction in size, measured in MB, depending on the video bitrate.

- Download speed.
    - Avoid segmented downloads. These can be hundreds to thousands of seperate downloads, making a one minute download take 10 minutes easily.
    - Always use direct downloads (https).

## Stories

### Epic: Basic download

As a user,
I want an input field that I can paste a URL into and start downloading a video,
So that I can watch it later on my device.

- Add input field for URL.
- Add download button.
- Backend takes the URL and executes yt-dlp command to download the video.
    - Fetch video information and take out the lowest bitrate, audio only format.
    - Avoid m3u, use direct download.

### Story: Add input field for youtube URL.

The user needs an input field to paste a YouTube video URL into, and a download button to start downloading the video to their device.

### Task: Send the Youtube URL to the backend for processing.

In order to download the video the URL needs to be sent to the backend so that the `yt-dlp` command can be executed.

- Send the URL to the backend when the "Download" button is pressed.
- Execute the `yt-dlp` command.
- Respond to frontend with a "Download started" message.

### Task: Build backend response

The frontend needs responses from the backend when download has started, progress updates and when the download has finished.

- Build response object.
- Responses should be empty of data as of now.

### Task: Fetch video information

Use the URL to fetch video information with `yt-dlp`.

- The fetched data will be JSON. It needs to be converted to an object where the lowest audio bitrate format is selected.

### Epic: Download progression

As a user,
I want a progression bar,
So that I know when my download is complete.

###