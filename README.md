# Fresher - Bulby Beats

Bulby Beats is a Spotify-inspired web music player with a neon glass "bulby" UI and **search-driven playback** powered by YouTube stream resolution.

## Features

- Search for songs by name (YouTube-backed search)
- Play/pause/next/previous controls
- Queue management (add/remove)
- Playlist management (create/select/add songs)
- Like/unlike songs and replay liked tracks
- Seek + volume controls
- Shuffle and repeat modes (`all`, `one`, `off`)

## Run

```bash
python3 server.py
```

Then open: `http://localhost:4173`

## Tech

- Vanilla HTML/CSS/JavaScript frontend
- Python standard-library HTTP server backend
- Invidious API integration for YouTube search + stream URL resolution

## Notes

- Internet access is required.
- Playback relies on available public Invidious instances.
