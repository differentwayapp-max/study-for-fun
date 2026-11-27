"""Serve public/ for tests the way Firebase Hosting does: an address with no file behind it (/teach, …) gets index.html,
and every file gets the app's headers from firebase.json (target "app", source "**": Referrer-Policy, the CSP…).
The CSP is ENFORCED here (firebase.json may still have it as Content-Security-Policy-Report-Only), so a test sees a violation
as a failure; SFF_CSP=off serves without it.
Usage: python3 tools/serve.py [port]   (default 8765)"""
import http.server, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', 'public')
def app_headers():
    cfg = json.load(open(os.path.join(HERE, '..', 'firebase.json')))
    h = cfg['hosting']; h = next((x for x in h if x.get('target') == 'app'), h[0]) if isinstance(h, list) else h
    out = []
    for rule in h.get('headers', []):
        if rule.get('source') != '**': continue
        for x in rule['headers']:
            k = x['key']
            if k == 'Content-Security-Policy-Report-Only': k = 'Content-Security-Policy'
            if k == 'Content-Security-Policy' and os.environ.get('SFF_CSP') == 'off': continue
            out.append((k, x['value']))
    return out
HEADERS = app_headers()

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and '.' not in os.path.basename(self.path.split('?')[0]):
            self.path = '/index.html'
        return super().send_head()

    def end_headers(self):
        for k, v in HEADERS: self.send_header(k, v)
        super().end_headers()

    def guess_type(self, path):
        return 'application/manifest+json' if path.endswith('.webmanifest') else super().guess_type(path)

    def log_message(self, *a):
        pass

http.server.ThreadingHTTPServer(('', int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
