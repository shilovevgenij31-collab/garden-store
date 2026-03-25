#!/usr/bin/env python3
"""
Simple GitHub webhook listener for auto-deploy.
Listens on port 9000, triggers deploy on push events.
"""

import hashlib
import hmac
import os
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer

SECRET = os.environ.get("WEBHOOK_SECRET", "garden-deploy-secret")
PROJECT_DIR = "/var/www/garden-store"
DEPLOY_LOG = "/var/log/garden-deploy.log"


class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/deploy":
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        # Verify GitHub signature
        signature = self.headers.get("X-Hub-Signature-256", "")
        expected = "sha256=" + hmac.new(
            SECRET.encode(), body, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"Invalid signature")
            return

        # Run deploy in background
        subprocess.Popen(
            [
                "bash", "-c",
                f"cd {PROJECT_DIR} && "
                f"git pull origin main && "
                f"npm run build && "
                f"cd backend && source venv/bin/activate && "
                f"PYTHONPATH={PROJECT_DIR}/backend alembic upgrade head && "
                f"systemctl restart garden-backend && "
                f"echo '[$(date)] Deploy OK' >> {DEPLOY_LOG}"
            ],
            stdout=open(DEPLOY_LOG, "a"),
            stderr=subprocess.STDOUT,
        )

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Deploy started")

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Webhook listener is running")

    def log_message(self, format, *args):
        pass  # silence request logs


if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", 9000), WebhookHandler)
    print("Webhook listener running on :9000")
    server.serve_forever()
