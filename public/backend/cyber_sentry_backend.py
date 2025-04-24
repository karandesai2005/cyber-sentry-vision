
#!/usr/bin/env python3
"""
CyberSentry Network Traffic Monitor
----------------------------------
A Python-based backend server that uses Scapy to monitor network traffic
from a USB tethered phone and sends alerts to a web browser via WebSockets.

Requirements:
- Python 3.7+
- FastAPI
- Uvicorn
- Scapy
- WebSockets

Usage:
- Connect your phone via USB tethering
- Run this script with admin/root privileges
- Access the web interface at http://localhost:8000

Note: This script requires root/admin privileges to capture packets.
"""

import json
import time
import asyncio
import threading
import ipaddress
import requests
from datetime import datetime
from typing import List, Dict, Set, Optional

# FastAPI imports
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Scapy for packet sniffing
from scapy.all import sniff, IP

# Import intrusion detection system components
try:
    from scapy.layers.http import HTTP
except ImportError:
    HTTP = None

# Initialize FastAPI application
app = FastAPI(title="CyberSentry Network Monitor")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Error sending message: {e}")

manager = ConnectionManager()

# Load suspicious IPs from a file or use default blocklist
suspicious_ips: Set[str] = set()

def load_suspicious_ips(filepath: str = "blocklist.txt"):
    global suspicious_ips
    try:
        with open(filepath, "r") as f:
            suspicious_ips = {line.strip() for line in f if line.strip()}
        print(f"Loaded {len(suspicious_ips)} suspicious IPs from {filepath}")
    except FileNotFoundError:
        print(f"Blocklist file {filepath} not found. Using default blocklist.")
        # Default suspicious IPs (for demonstration)
        suspicious_ips = {"192.168.1.100", "10.0.0.50"}

# Check IP against AbuseIPDB (you'll need an API key)
async def check_ip_abuse(ip: str, api_key: Optional[str] = None) -> Dict:
    if not api_key:
        return {"risk_level": 0, "reason": "No API key provided for AbuseIPDB"}
    
    try:
        headers = {
            'Key': api_key,
            'Accept': 'application/json',
        }
        params = {
            'ipAddress': ip,
            'maxAgeInDays': '90',
        }
        response = requests.get(
            'https://api.abuseipdb.com/api/v2/check',
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            result = response.json()
            data = result.get('data', {})
            abuse_score = data.get('abuseConfidenceScore', 0)
            
            reason = "Clean IP"
            if abuse_score > 80:
                reason = f"Highly abusive IP (score: {abuse_score})"
            elif abuse_score > 50:
                reason = f"Suspicious IP (score: {abuse_score})"
            elif abuse_score > 20:
                reason = f"Potentially suspicious IP (score: {abuse_score})"
                
            return {
                "risk_level": min(10, abuse_score // 10),
                "reason": reason
            }
        else:
            return {"risk_level": 0, "reason": f"AbuseIPDB API error: {response.status_code}"}
    except Exception as e:
        return {"risk_level": 0, "reason": f"Error checking IP: {str(e)}"}

# Phone's IP range (customize based on your USB tethering configuration)
phone_ip_range = "192.168.42.0/24"  # Common Android USB tethering range

def is_phone_ip(ip):
    try:
        return ipaddress.ip_address(ip) in ipaddress.ip_network(phone_ip_range)
    except ValueError:
        return False

# Packet callback function
async def packet_callback(packet):
    if IP in packet:
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        
        # Only process packets related to the phone
        if not (is_phone_ip(src_ip) or is_phone_ip(dst_ip)):
            return
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        alert = None
        
        # Check if IP is in our blocklist
        if src_ip in suspicious_ips or dst_ip in suspicious_ips:
            suspicious_ip = src_ip if src_ip in suspicious_ips else dst_ip
            alert = {
                "srcIp": src_ip,
                "dstIp": dst_ip,
                "timestamp": timestamp,
                "riskLevel": 8,  # High risk for known suspicious IPs
                "reason": f"IP {suspicious_ip} found in blocklist"
            }
        
        # Additional checks could be performed here for more sophisticated detection
        # For example, checking for unusual ports, protocol anomalies, etc.
        
        # If an alert was generated, send it to connected clients
        if alert:
            await manager.broadcast(json.dumps(alert))

# Start sniffing in a separate thread
def start_sniffing(interface="usb0"):
    def sniff_packets():
        asyncio.set_event_loop(asyncio.new_event_loop())
        loop = asyncio.get_event_loop()
        
        def process_packet(packet):
            loop.create_task(packet_callback(packet))
        
        print(f"Starting packet sniffing on interface {interface}")
        sniff(
            iface=interface,
            prn=process_packet,
            filter="ip",  # Only capture IP packets
            store=False   # Don't store packets in memory
        )
    
    thread = threading.Thread(target=sniff_packets, daemon=True)
    thread.start()
    return thread

# WebSocket endpoint for real-time alerts
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial connection message
        await websocket.send_json({
            "srcIp": "0.0.0.0",
            "dstIp": "0.0.0.0",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "riskLevel": 0,
            "reason": "Connected to CyberSentry Network Monitor"
        })
        
        # Keep the connection alive
        while True:
            # Wait for any messages (can be used for control commands)
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Root endpoint serving basic HTML
@app.get("/", response_class=HTMLResponse)
async def root():
    html = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>CyberSentry Network Monitor</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    margin: 0;
                    padding: 2rem;
                    background-color: #0f1419;
                    color: #e2e8f0;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1, h2 {
                    color: #38b2ff;
                }
                .card {
                    background-color: #1a2330;
                    border: 1px solid #38b2ff80;
                    border-radius: 8px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                .alert {
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    border-radius: 6px;
                }
                .high-risk {
                    background-color: rgba(220, 38, 38, 0.2);
                    border: 1px solid rgba(220, 38, 38, 0.3);
                }
                .medium-risk {
                    background-color: rgba(245, 158, 11, 0.2);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }
                .low-risk {
                    background-color: rgba(16, 185, 129, 0.2);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                #alerts {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .alert-details {
                    display: flex;
                    justify-content: space-between;
                }
                .timestamp {
                    font-size: 0.75rem;
                    color: #94a3b8;
                }
                code {
                    display: block;
                    background-color: #1e2937;
                    padding: 0.75rem;
                    border-radius: 6px;
                    margin: 1rem 0;
                    white-space: pre;
                }
                .risk-level {
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-weight: 500;
                }
                .risk-high {
                    background-color: rgba(220, 38, 38, 0.2);
                    color: #f87171;
                }
                .risk-medium {
                    background-color: rgba(245, 158, 11, 0.2);
                    color: #fbbf24;
                }
                .risk-low {
                    background-color: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                }
                .status {
                    padding: 0.5rem;
                    margin-bottom: 1rem;
                    border-radius: 6px;
                    text-align: center;
                    background-color: #1e2937;
                    color: #94a3b8;
                }
                .status.connected {
                    background-color: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                }
                .status.disconnected {
                    background-color: rgba(220, 38, 38, 0.2);
                    color: #f87171;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>CyberSentry Network Monitor</h1>
                
                <div id="connection-status" class="status disconnected">
                    Disconnected
                </div>
                
                <div class="card">
                    <h2>Network Traffic Alerts</h2>
                    <div id="alerts"></div>
                </div>
                
                <div class="card">
                    <h2>Backend Status</h2>
                    <div id="stats">
                        <p>Monitoring interface: <span id="interface">usb0</span></p>
                        <p>Alerts detected: <span id="alert-count">0</span></p>
                        <p>WebSocket status: <span id="ws-status">Connecting...</span></p>
                        <p>Server uptime: <span id="uptime">0:00:00</span></p>
                    </div>
                </div>
                
                <div class="card">
                    <h2>Setup Instructions</h2>
                    <p>1. Connect your phone via USB and enable USB tethering</p>
                    <p>2. Run this backend with admin/root privileges</p>
                    <p>3. Open the CyberSentry web application</p>
                    <p>4. Start network monitoring from the web interface</p>
                    
                    <h3>Command to run backend:</h3>
                    <code>sudo python3 cyber_sentry_backend.py</code>
                </div>
            </div>
            
            <script>
                let alertCount = 0;
                let startTime = new Date();
                const alerts = document.getElementById('alerts');
                const statusElement = document.getElementById('connection-status');
                const wsStatusElement = document.getElementById('ws-status');
                const alertCountElement = document.getElementById('alert-count');
                const uptimeElement = document.getElementById('uptime');
                
                // Update uptime every second
                setInterval(() => {
                    const now = new Date();
                    const diff = Math.floor((now - startTime) / 1000);
                    const hours = Math.floor(diff / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    const seconds = diff % 60;
                    uptimeElement.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }, 1000);
                
                // Connect to WebSocket
                function connectWebSocket() {
                    const ws = new WebSocket('ws://' + window.location.host + '/ws');
                    
                    ws.onopen = function(event) {
                        console.log('WebSocket connected');
                        statusElement.textContent = 'Connected';
                        statusElement.className = 'status connected';
                        wsStatusElement.textContent = 'Connected';
                    };
                    
                    ws.onmessage = function(event) {
                        try {
                            const alert = JSON.parse(event.data);
                            
                            // Don't count the initial connection message as an alert
                            if (alert.srcIp === "0.0.0.0" && alert.dstIp === "0.0.0.0") {
                                return;
                            }
                            
                            alertCount++;
                            alertCountElement.textContent = alertCount;
                            
                            let riskClass = 'low-risk';
                            let riskBadgeClass = 'risk-low';
                            
                            if (alert.riskLevel > 6) {
                                riskClass = 'high-risk';
                                riskBadgeClass = 'risk-high';
                            } else if (alert.riskLevel > 3) {
                                riskClass = 'medium-risk';
                                riskBadgeClass = 'risk-medium';
                            }
                            
                            const alertElement = document.createElement('div');
                            alertElement.className = `alert ${riskClass}`;
                            alertElement.innerHTML = `
                                <div class="alert-details">
                                    <div><strong>${alert.srcIp} → ${alert.dstIp}</strong></div>
                                    <div>Risk: <span class="risk-level ${riskBadgeClass}">${alert.riskLevel}</span></div>
                                </div>
                                <div>${alert.reason}</div>
                                <div class="timestamp">${alert.timestamp}</div>
                            `;
                            
                            // Add to the top of the list
                            alerts.insertBefore(alertElement, alerts.firstChild);
                            
                            // Limit the number of visible alerts
                            if (alerts.children.length > 50) {
                                alerts.removeChild(alerts.lastChild);
                            }
                        } catch (error) {
                            console.error('Error parsing alert:', error);
                        }
                    };
                    
                    ws.onclose = function(event) {
                        console.log('WebSocket disconnected');
                        statusElement.textContent = 'Disconnected';
                        statusElement.className = 'status disconnected';
                        wsStatusElement.textContent = 'Disconnected';
                        
                        // Try to reconnect after a delay
                        setTimeout(connectWebSocket, 3000);
                    };
                    
                    ws.onerror = function(event) {
                        console.error('WebSocket error:', event);
                        wsStatusElement.textContent = 'Error';
                    };
                }
                
                // Initial connection
                connectWebSocket();
            </script>
        </body>
    </html>
    """
    return HTMLResponse(html)

@app.get("/status")
async def status():
    """Return the status of the server."""
    return {
        "status": "running",
        "monitoring_interface": interface,
        "connected_clients": len(manager.active_connections),
        "blocklist_size": len(suspicious_ips)
    }

# Load blocklist and start the server
if __name__ == "__main__":
    import uvicorn
    
    # Load suspicious IPs
    load_suspicious_ips()
    
    # Set the interface to monitor (default: usb0 for USB tethering)
    interface = "usb0"  # Change this to match your system's interface name
    
    # Start packet sniffing
    sniff_thread = start_sniffing(interface)
    
    # Run the FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8000)
