#!/usr/bin/env python3
import http.server
import json
import os
import pathlib
import secrets
import shutil
import socket
import subprocess
import threading
import time
import urllib.parse
import urllib.request
import ipaddress

ROOT = pathlib.Path(__file__).resolve().parent
STORAGE = ROOT / 'storage'
TMP = STORAGE / 'tmp'
OUT = STORAGE / 'out'
for d in (TMP, OUT): d.mkdir(parents=True, exist_ok=True)

PORT = int(os.environ.get('PORT', '3000'))
MAX_UPLOAD_MB = int(os.environ.get('MAX_UPLOAD_MB', '500'))
MAX_REMOTE_MB = int(os.environ.get('MAX_REMOTE_MB', '500'))
DOWNLOAD_TTL = 30 * 60
ALLOWED_ORIGINS = {o.strip().rstrip('/') for o in os.environ.get('ALLOWED_ORIGINS','').split(',') if o.strip()}
DOWNLOADS = {}
LOCK = threading.Lock()

BLOCKED_HOSTS = {
    'youtube.com','www.youtube.com','m.youtube.com','youtu.be',
    'music.youtube.com','youtube-nocookie.com'
}

def add_cors(handler):
    origin = (handler.headers.get('Origin') or '').rstrip('/')
    if origin and ('*' in ALLOWED_ORIGINS or origin in ALLOWED_ORIGINS):
        handler.send_header('Access-Control-Allow-Origin', origin)
        handler.send_header('Vary', 'Origin')
    handler.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type,X-Filename')

def safe_json(handler, status, payload):
    body = json.dumps(payload).encode()
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    add_cors(handler)
    handler.send_header('Content-Length', str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)

def random_path(folder, suffix):
    return folder / f"{int(time.time())}-{secrets.token_hex(8)}{suffix}"

def run_ffmpeg(src, fmt):
    if fmt == 'mp3':
        dst = random_path(OUT, '.mp3')
        cmd = ['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-vn','-codec:a','libmp3lame','-q:a','2',str(dst)]
        filename, mime = 'converted.mp3', 'audio/mpeg'
    elif fmt == 'mp4':
        dst = random_path(OUT, '.mp4')
        cmd = ['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(src),'-c:v','libx264','-preset','veryfast','-crf','22','-c:a','aac','-b:a','160k','-movflags','+faststart',str(dst)]
        filename, mime = 'converted.mp4', 'video/mp4'
    else:
        raise ValueError('Format must be mp3 or mp4')
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        dst.unlink(missing_ok=True)
        raise ValueError((p.stderr or 'Conversion failed').strip()[-500:])
    return dst, filename, mime

def is_public_host(host):
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        return False
    if not infos:
        return False
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if not ip.is_global:
            return False
    return True

def validate_remote(raw):
    u = urllib.parse.urlparse(raw)
    if u.scheme not in ('http','https') or not u.hostname:
        raise ValueError('Only valid http/https URLs are allowed')
    host = u.hostname.lower().rstrip('.')
    if host in BLOCKED_HOSTS or any(host.endswith('.' + h) for h in BLOCKED_HOSTS):
        raise ValueError('YouTube URLs are not supported. Use a file you own or a direct media URL you are authorized to download.')
    if not is_public_host(host):
        raise ValueError('Local/private network URLs are not allowed')
    return raw

def fetch_remote(raw):
    validate_remote(raw)
    req = urllib.request.Request(raw, headers={'User-Agent':'MediaDrop/1.0'})
    opener = urllib.request.build_opener()
    resp = opener.open(req, timeout=30)
    validate_remote(resp.geturl())
    max_bytes = MAX_REMOTE_MB * 1024 * 1024
    content_len = int(resp.headers.get('Content-Length') or 0)
    if content_len and content_len > max_bytes:
        resp.close()
        raise ValueError(f'Remote file is larger than {MAX_REMOTE_MB} MB')
    dst = random_path(TMP, '.download')
    total = 0
    try:
        with open(dst,'wb') as f:
            while True:
                chunk = resp.read(1024*1024)
                if not chunk: break
                total += len(chunk)
                if total > max_bytes:
                    raise ValueError(f'Remote file exceeded {MAX_REMOTE_MB} MB')
                f.write(chunk)
    except Exception:
        dst.unlink(missing_ok=True)
        raise
    finally:
        resp.close()
    return dst

def register_download(path, filename, mime):
    token = secrets.token_hex(24)
    with LOCK:
        DOWNLOADS[token] = {'path': path, 'filename': filename, 'mime': mime, 'expires': time.time() + DOWNLOAD_TTL}
    return token

def cleanup_loop():
    while True:
        time.sleep(300)
        now = time.time()
        expired = []
        with LOCK:
            for token, item in list(DOWNLOADS.items()):
                if item['expires'] <= now:
                    expired.append((token,item))
                    del DOWNLOADS[token]
        for _, item in expired:
            pathlib.Path(item['path']).unlink(missing_ok=True)
threading.Thread(target=cleanup_loop, daemon=True).start()

class Handler(http.server.SimpleHTTPRequestHandler):
    server_version = 'MediaDrop/1.0'
    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {self.address_string()} {fmt%args}")

    def do_OPTIONS(self):
        self.send_response(204)
        add_cors(self)
        self.send_header('Content-Length', '0')
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            return safe_json(self, 200, {'ok': True})
        if self.path.startswith('/download/'):
            return self.handle_download(self.path.split('/download/',1)[1].split('?',1)[0])
        self.send_error(404)

    def do_POST(self):
        if self.path.startswith('/api/convert/upload'):
            return self.handle_upload()
        if self.path == '/api/convert/url':
            return self.handle_url()
        self.send_error(404)

    def handle_upload(self):
        src = None
        try:
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            fmt = (q.get('format') or [''])[0]
            length = int(self.headers.get('Content-Length') or 0)
            max_bytes = MAX_UPLOAD_MB * 1024 * 1024
            if length <= 0: raise ValueError('Choose a media file first.')
            if length > max_bytes: raise ValueError(f'File is too large. Limit: {MAX_UPLOAD_MB} MB.')
            src = random_path(TMP, '.upload')
            remaining = length
            with open(src,'wb') as f:
                while remaining:
                    chunk = self.rfile.read(min(1024*1024, remaining))
                    if not chunk: break
                    f.write(chunk); remaining -= len(chunk)
            if remaining: raise ValueError('Upload ended unexpectedly.')
            out, filename, mime = run_ffmpeg(src, fmt)
            token = register_download(out, filename, mime)
            return safe_json(self, 200, {'ok':True,'downloadUrl':f'/download/{token}','expiresAt':int((time.time()+DOWNLOAD_TTL)*1000)})
        except Exception as e:
            return safe_json(self, 400, {'error': str(e) or 'Conversion failed.'})
        finally:
            if src: src.unlink(missing_ok=True)

    def handle_url(self):
        src = None
        try:
            length = int(self.headers.get('Content-Length') or 0)
            if length > 1024*1024: raise ValueError('Request too large')
            body = self.rfile.read(length)
            data = json.loads(body or b'{}')
            raw = data.get('url','').strip(); fmt=data.get('format','')
            if not raw: raise ValueError('Paste a direct media URL first.')
            src = fetch_remote(raw)
            out, filename, mime = run_ffmpeg(src, fmt)
            token = register_download(out, filename, mime)
            return safe_json(self, 200, {'ok':True,'downloadUrl':f'/download/{token}','expiresAt':int((time.time()+DOWNLOAD_TTL)*1000)})
        except Exception as e:
            return safe_json(self, 400, {'error': str(e) or 'Download/conversion failed.'})
        finally:
            if src: src.unlink(missing_ok=True)

    def handle_download(self, token):
        with LOCK:
            item = DOWNLOADS.pop(token, None)
        if not item or item['expires'] <= time.time():
            if item: pathlib.Path(item['path']).unlink(missing_ok=True)
            self.send_error(404, 'Download expired or not found'); return
        path = pathlib.Path(item['path'])
        if not path.exists(): self.send_error(404); return
        try:
            self.send_response(200)
            self.send_header('Content-Type', item['mime'])
            add_cors(self)
            self.send_header('Content-Disposition', f'attachment; filename="{item["filename"]}"')
            self.send_header('Content-Length', str(path.stat().st_size))
            self.end_headers()
            with open(path,'rb') as f: shutil.copyfileobj(f, self.wfile)
        finally:
            path.unlink(missing_ok=True)

if __name__ == '__main__':
    if not shutil.which('ffmpeg'):
        raise SystemExit('FFmpeg is required and was not found on PATH.')
    server = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print(f'MediaDrop running at http://localhost:{PORT}')
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()
