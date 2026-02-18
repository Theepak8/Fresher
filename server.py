#!/usr/bin/env python3
import json
import os
import urllib.parse
import urllib.request
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
INVIDIOUS_INSTANCES = [
    "https://invidious.nerdvpn.de",
    "https://invidious.private.coffee",
    "https://yt.artemislena.eu",
]


def fetch_json(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent": "BulbyBeats/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def search_youtube(query):
    q = urllib.parse.quote(query)
    last_error = None
    for base in INVIDIOUS_INSTANCES:
        try:
            url = f"{base}/api/v1/search?q={q}&type=video"
            data = fetch_json(url)
            results = []
            for item in data[:15]:
                video_id = item.get("videoId")
                if not video_id:
                    continue
                thumbnails = item.get("videoThumbnails") or []
                thumb = thumbnails[-1]["url"] if thumbnails else ""
                results.append(
                    {
                        "id": video_id,
                        "title": item.get("title", "Unknown title"),
                        "artist": item.get("author", "Unknown artist"),
                        "duration": item.get("lengthSeconds", 0),
                        "thumb": thumb,
                    }
                )
            return {"source": base, "results": results}
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            continue
    raise RuntimeError(last_error or "No Invidious instance reachable")


def resolve_stream(video_id):
    last_error = None
    for base in INVIDIOUS_INSTANCES:
        try:
            url = f"{base}/api/v1/videos/{urllib.parse.quote(video_id)}"
            data = fetch_json(url)
            formats = data.get("adaptiveFormats", [])
            audio_formats = [fmt for fmt in formats if "audio" in (fmt.get("type") or "") and fmt.get("url")]
            if not audio_formats:
                raise RuntimeError("No playable audio stream found")
            best = sorted(audio_formats, key=lambda fmt: fmt.get("bitrate", 0), reverse=True)[0]
            thumbs = data.get("videoThumbnails") or []
            thumb = thumbs[-1]["url"] if thumbs else ""
            return {
                "id": video_id,
                "title": data.get("title", "Unknown title"),
                "artist": data.get("author", "Unknown artist"),
                "duration": data.get("lengthSeconds", 0),
                "thumb": thumb,
                "streamUrl": best.get("url"),
                "source": base,
            }
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            continue
    raise RuntimeError(last_error or "Failed to resolve stream")


class BulbyHandler(SimpleHTTPRequestHandler):
    def _json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/search":
            query = urllib.parse.parse_qs(parsed.query).get("q", [""])[0].strip()
            if not query:
                self._json({"error": "Missing query parameter q"}, status=HTTPStatus.BAD_REQUEST)
                return
            try:
                self._json(search_youtube(query))
            except Exception as exc:  # noqa: BLE001
                self._json({"error": f"Search failed: {exc}"}, status=HTTPStatus.BAD_GATEWAY)
            return

        if parsed.path == "/api/resolve":
            video_id = urllib.parse.parse_qs(parsed.query).get("id", [""])[0].strip()
            if not video_id:
                self._json({"error": "Missing id parameter"}, status=HTTPStatus.BAD_REQUEST)
                return
            try:
                self._json(resolve_stream(video_id))
            except Exception as exc:  # noqa: BLE001
                self._json({"error": f"Resolve failed: {exc}"}, status=HTTPStatus.BAD_GATEWAY)
            return

        if parsed.path == "/":
            self.path = "/index.html"
        return super().do_GET()


def run():
    os.chdir(ROOT)
    port = int(os.environ.get("PORT", "4173"))
    server = ThreadingHTTPServer(("0.0.0.0", port), BulbyHandler)
    print(f"Bulby Beats server running on http://0.0.0.0:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
