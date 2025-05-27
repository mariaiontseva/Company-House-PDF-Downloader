#!/usr/bin/env python3
"""
Simple HTTP server for testing the DocSpace authentication locally
Run with: python3 server.py
Then open: http://localhost:8000
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

# Change to the directory containing index.html
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"🚀 Server running at http://localhost:{PORT}")
    print(f"📁 Serving files from: {os.getcwd()}")
    print("\n✨ Open http://localhost:8000 in your browser")
    print("Press Ctrl+C to stop the server\n")
    httpd.serve_forever()