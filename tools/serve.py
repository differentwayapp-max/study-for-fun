"""Serve public/ for tests the way Firebase Hosting does: an address with no file behind it (/teach, …) gets index.html.
Usage: python3 tools/serve.py [port]   (default 8765)"""
import http.server, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and '.' not in os.path.basename(self.path.split('?')[0]):
            self.path = '/index.html'
        return super().send_head()

    def guess_type(self, path):
        return 'application/manifest+json' if path.endswith('.webmanifest') else super().guess_type(path)

    def log_message(self, *a):
        pass

http.server.ThreadingHTTPServer(('', int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
