import base64, functools, http.server, threading, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parent; OUT = ROOT / "out" / "style"; OUT.mkdir(parents=True, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    p = b.new_page(viewport={"width": 1920, "height": 1080})
    errs = []; p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto(f"http://127.0.0.1:{srv.server_address[1]}/frames.html"); p.evaluate("window.ready")
    for i in range(3):
        url = p.evaluate(f"window.drawFrame({i}, 2.0)")
        (OUT / f"frame_{'ABC'[i]}.jpg").write_bytes(base64.b64decode(url.split(",", 1)[1]))
    print("errors:", errs)
