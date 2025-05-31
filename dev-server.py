#!/usr/bin/env python3
"""
Simple HTTP server for local development
Usage: python3 dev-server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3001

class DevHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), DevHTTPRequestHandler) as httpd:
        print(f"🚀 Development server running at:")
        print(f"   http://localhost:{PORT}")
        print(f"   http://127.0.0.1:{PORT}")
        print()
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🔗 Main app: http://localhost:{PORT}/index.html")
        print(f"🔗 Enhanced cards dev: http://localhost:{PORT}/dev-enhanced-cards.html")
        print()
        print("Press Ctrl+C to stop the server")
        
        # Try to open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()