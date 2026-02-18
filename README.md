# Fresher - Bulby Beats

Bulby Beats is a Spotify-inspired, fully functional web music player clone with a neon "bulby" glassmorphism UI.

## Features

- Play, pause, next, previous
- Seek timeline and volume slider
- Shuffle and repeat modes (`all`, `one`, `off`)
- Playback queue with add/remove
- Multiple playlists + create custom playlists
- Add track to active playlist
- Search/discover catalog by title, artist, album
- Like/unlike songs and instant play from liked list
- Auto-play next track + repeat handling

## Run

No build step required.

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

## Tech

- Vanilla HTML, CSS, JavaScript
- HTML5 Audio API for playback controls
- Public streaming track URLs from SoundHelix demo catalog
