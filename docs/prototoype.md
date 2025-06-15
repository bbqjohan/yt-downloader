# Prototype

## UI

### URL Input

- Text field.
- Go button.
    - When pressed, fetches information about the available video & audio resolutions.
    - Text field and button are disabled.
    - If successful: Render download options.
    - If failure: Display error message underneath text field and highlight field and button.

### Download options

- When given data, select default options.
    - Pair low audio + 480p video.
- Select box for audio resolution.
    - List audio only options.
    - Display size, audio format, and low/mid/high quality tag, on the option
- Select box for video resolution.
    - List video only options.
    - Display video size and resolution on the option.
- Button to restore default selection.
- Button to download.

### Download list

- Progress bar for the downloading url.