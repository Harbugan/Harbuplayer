HarbuPlayer

HarbuPlayer is a lightweight Android friendly web based audio player built for personal offline music libraries.

The app lets you add individual audio files or entire folders, stores your music locally in IndexedDB, reads basic ID3 metadata, shows album artwork when available, and supports playback directly from the browser or as an installable PWA.

Features

* Add music from files or folders
* Local library stored on device
* Offline friendly PWA setup
* Album, artist, favorites and search views
* Collapsible album and artist groups
* Embedded artwork support
* Automatic artwork lookup via iTunes Search API
* Mini player and full screen player
* Shuffle, repeat, seek and volume controls
* Android Media Session support for lock screen controls
* Dark mode support
* Mobile first UI with safe area handling

Tech

HarbuPlayer is built as a single HTML file using vanilla JavaScript, CSS and browser APIs:

* IndexedDB
* File System Access API
* HTML5 Audio
* Media Session API
* Progressive Web App manifest
* Service Worker support

Notes

This project is designed as a personal music player experiment, focused on keeping things simple, fast and device local. No accounts, no streaming service, no unnecessary backend. Just your music, stored and played from your own device.
