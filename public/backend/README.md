
# CyberSentry Network Monitor Backend

This Python-based backend server uses Scapy to monitor network traffic from a USB tethered phone and sends alerts to the CyberSentry web application via WebSockets.

## Requirements

- Python 3.7 or higher
- Root/administrator privileges (required for packet sniffing)
- USB tethering capable smartphone

## Installation

1. Install the required Python packages:

```bash
pip install fastapi uvicorn scapy websockets requests
```

2. Download the `cyber_sentry_backend.py` file from this directory.

## Setup USB Tethering

### Android:

1. Connect your phone to your laptop via USB cable
2. On your Android phone, go to Settings > Network & Internet > Hotspot & Tethering
3. Enable USB tethering
4. Your computer should recognize the new network connection

### iPhone:

1. Connect your iPhone to your laptop via USB cable
2. On your iPhone, go to Settings > Personal Hotspot
3. Toggle on "Allow Others to Join"
4. Your computer should recognize the new network connection

## Running the Backend

1. Open a terminal/command prompt with administrator privileges
2. Navigate to the directory containing `cyber_sentry_backend.py`
3. Run the script:

```bash
# Linux/macOS
sudo python3 cyber_sentry_backend.py

# Windows (in Administrator Command Prompt)
python cyber_sentry_backend.py
```

4. The server will start and listen on port 8000
5. You can access the standalone web interface at http://localhost:8000

## Configuring the Interface

By default, the script monitors the `usb0` interface, which is common for USB tethering on Linux. You may need to change this based on your operating system:

- **Linux**: Usually `usb0` or `eth1`
- **macOS**: Usually `en5` or `en6`
- **Windows**: Usually named something like `USB Ethernet` or `Local Area Connection`

To find your interface name:

- **Linux/macOS**: Run `ifconfig` in terminal
- **Windows**: Run `ipconfig` in command prompt

Modify the `interface` variable in the script before running:

```python
# Set the interface to monitor
interface = "your_interface_name_here"
```

## Creating a Custom Blocklist

You can create a file named `blocklist.txt` in the same directory as the script with one IP address per line:

```
192.168.1.100
10.0.0.50
198.51.100.123
```

The script will automatically load this file if present.

## Using with CyberSentry Web Application

1. Start this backend server using the instructions above
2. Open your CyberSentry web application
3. Go to the USB & Network Monitor tab
4. Click "Start Network Monitoring"
5. The application will connect to this backend via WebSockets

## Security Considerations

- This tool should only be used to monitor your own network traffic or with explicit permission
- Running packet sniffers requires admin privileges, which poses security risks
- The WebSocket server accepts connections from any origin by default (modify CORS settings for production use)
- Consider using HTTPS and WSS (secure WebSockets) for production environments

## Troubleshooting

- **Permission errors**: Make sure you're running the script with administrator/root privileges
- **Interface not found**: Verify the correct interface name for your USB tethering connection
- **Connection refused**: Ensure the server is running and accessible on port 8000
- **No traffic captured**: Check that USB tethering is properly enabled on your phone

## Performance Optimization

For better performance on resource-constrained systems:

1. Use BPF filters to limit captured packets:
   ```python
   # Example: Only capture TCP traffic to/from the phone
   sniff(iface=interface, filter="tcp and host 192.168.42.129", prn=process_packet, store=False)
   ```

2. Reduce the amount of data stored in memory:
   ```python
   # Limit the number of alerts stored
   max_stored_alerts = 100
   ```

3. Use more efficient data structures for IP lookups with large blocklists
