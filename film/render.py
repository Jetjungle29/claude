"""Render pilot.html to MP4.

    python3 render.py stills            # contact sheet of key frames -> out/stills/
    python3 render.py video [--fps 30] [--no-captions]

Frames are drawn deterministically by window.renderAt(t) in headless Chromium,
captured as JPEG, and piped into ffmpeg. Work is split across parallel workers
and the parts are joined losslessly, with a silent stereo track added.
"""
import argparse, base64, functools, http.server, json, os, subprocess, sys, threading
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
CHROMIUM = "/opt/pw-browsers/chromium"


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]


def open_page(pw, port, captions):
    exe = CHROMIUM if Path(CHROMIUM).exists() else None
    browser = pw.chromium.launch(executable_path=exe, args=["--disable-gpu"])
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.goto(f"http://127.0.0.1:{port}/pilot.html?captions={1 if captions else 0}")
    page.evaluate("window.ready")
    return browser, page


def render_part(args):
    idx, f0, f1, fps, port, captions = args
    part = OUT / f"part{idx:02d}.mp4"
    ff = subprocess.Popen([FFMPEG, "-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg",
                           "-framerate", str(fps), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                           "-crf", "19", "-pix_fmt", "yuv420p", "-r", str(fps), str(part)],
                          stdin=subprocess.PIPE)
    with sync_playwright() as pw:
        browser, page = open_page(pw, port, captions)
        for f in range(f0, f1):
            url = page.evaluate(f"window.frameJPEG({f / fps})")
            ff.stdin.write(base64.b64decode(url.split(",", 1)[1]))
        browser.close()
    ff.stdin.close(); ff.wait()
    return str(part)


def srt_time(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["stills", "video"])
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    ap.add_argument("--no-captions", action="store_true")
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    port = serve()
    captions = not a.no_captions

    with sync_playwright() as pw:
        browser, page = open_page(pw, port, captions)
        info = page.evaluate("window.getInfo()")
        # cue sheet for recording the voiceover
        with open(OUT / "guide-vo.srt", "w") as fh:
            for i, c in enumerate(info["captions"], 1):
                fh.write(f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n\n")
        (OUT / "shots.json").write_text(json.dumps(info["shots"], indent=1))
        print(f"total {info['total']:.1f}s, {len(info['shots'])} shots, {len(info['captions'])} captions")
        if a.mode == "stills":
            d = OUT / "stills"; d.mkdir(exist_ok=True)
            for s in info["shots"]:
                for k, frac in enumerate((.2, .55, .92)):
                    t = s["start"] + s["dur"] * frac
                    url = page.evaluate(f"window.frameJPEG({t}, .85)")
                    (d / f"{s['id']}_{k}.jpg").write_bytes(base64.b64decode(url.split(",", 1)[1]))
            browser.close(); print("stills ->", d); return
        browser.close()

    n = int(info["total"] * a.fps)
    step = -(-n // a.workers)
    jobs = [(i, i * step, min(n, (i + 1) * step), a.fps, port, captions) for i in range(a.workers) if i * step < n]
    with ProcessPoolExecutor(len(jobs)) as ex:
        parts = list(ex.map(render_part, jobs))
    lst = OUT / "parts.txt"; lst.write_text("".join(f"file '{p}'\n" for p in parts))
    name = OUT / ("joy-plant-pilot" + ("" if captions else "-clean") + ".mp4")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-c:v", "copy", "-c:a", "aac",
                    "-shortest", "-movflags", "+faststart", str(name)], check=True)
    for p in parts: os.remove(p)
    lst.unlink()
    print("video ->", name, f"{name.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    sys.exit(main())
