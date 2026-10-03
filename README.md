# Network Attack Visualizer

A real-time network security monitoring and attack visualization platform built for a controlled cybersecurity lab environment.

The project captures network traffic, detects suspicious activity, stores security events in SQLite, exposes them through a REST API and WebSocket stream, and visualizes the events through a React dashboard.

## Features

- Real-time packet capture using Scapy
- TCP port-scan detection
- Traffic-spike detection
- ICMP-burst detection
- SQLite event storage
- REST API using FastAPI
- Real-time event streaming using WebSockets
- React + Vite monitoring dashboard
- Live network topology visualization
- Attack source and destination tracking
- Event severity classification
- Security-event history
- API endpoints for querying events

## Architecture

```text
                    ┌─────────────────────────┐
                    │       Kali Linux        │
                    │     10.10.10.10/24      │
                    │                         │
                    │  Scapy Packet Capture   │
                    │          │              │
                    │          ▼              │
                    │   Detection Engine      │
                    │          │              │
                    │          ▼              │
                    │      SQLite DB          │
                    │          │              │
                    │          ▼              │
                    │      FastAPI            │
                    │       REST API          │
                    │          │              │
                    │       WebSocket         │
                    └───────────┬─────────────┘
                                │
                         Live Security Events
                                │
                                ▼
                    ┌─────────────────────────┐
                    │     React Dashboard     │
                    │                         │
                    │  Network Attack         │
                    │  Visualization          │
                    └───────────┬─────────────┘
                                │
                                │
                    ┌───────────▼─────────────┐
                    │     Ubuntu Server       │
                    │     10.10.10.20/24      │
                    │     Protected Target    │
                    └─────────────────────────┘
```

## Lab Environment

This project was developed and tested in an isolated VirtualBox lab.

| Component | Role | IP |
|---|---|---|
| Kali Linux | Detection engine / attacker | `10.10.10.10` |
| Ubuntu Server | Protected target | `10.10.10.20` |
| VirtualBox | Lab networking | Host-only / isolated network |

> **Important:** The IP addresses above are examples from the development lab. If you use a different network configuration, update the API, WebSocket and detection-engine configuration accordingly.

## Detection Engine

The detection engine monitors traffic and generates security events when predefined thresholds are reached.

### TCP Port Scan

The engine tracks destination ports contacted by a source within a time window.

Example event:

```json
{
  "event_type": "PORT_SCAN",
  "source_ip": "10.10.10.10",
  "destination_ip": "10.10.10.20",
  "protocol": "TCP",
  "severity": "medium",
  "details": {
    "unique_ports": 8,
    "ports": [21, 22, 23, 25, 53, 80, 87, 100],
    "window_seconds": 10
  }
}
```

### Traffic Spike

The engine monitors packet volume over a short period.

Example:

```json
{
  "event_type": "TRAFFIC_SPIKE",
  "source_ip": "10.10.10.10",
  "destination_ip": "10.10.10.20",
  "protocol": "IP",
  "severity": "medium",
  "details": {
    "packet_count": 50,
    "window_seconds": 5
  }
}
```

### ICMP Burst

The engine can detect an unusually high number of ICMP packets from a source within a defined time window.

## Technology Stack

### Backend

- Python
- Scapy
- FastAPI
- Uvicorn
- SQLite
- WebSockets

### Frontend

- React
- Vite
- JavaScript
- CSS

### Infrastructure

- Kali Linux
- Ubuntu Server
- Oracle VirtualBox
- Isolated virtual network

## Project Structure

```text
network-attack-visualizer/
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── public/
│
├── package.json
├── package-lock.json
├── index.html
├── vite.config.js
├── README.md
└── ...
```

The detection engine and API components are run separately from the React frontend.

## Requirements

### Kali Linux

Install the required Python dependencies for the backend/detection components.

The system should also have:

```text
Python 3
pip
Scapy
FastAPI
Uvicorn
```

### Node.js

The dashboard requires Node.js and npm.

Check:

```bash
node --version
npm --version
```

## Running the Dashboard

Clone the repository:

```bash
git clone git@github.com:MrWater00/network-attack-visualizer.git
cd network-attack-visualizer
```

Install frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The dashboard will normally be available at:

```text
http://localhost:5173
```

If the dashboard is being accessed from another machine on the lab network, use the appropriate Kali IP and ensure Vite is listening on the required interface.

For example:

```text
http://10.10.10.10:5173
```

## Starting the API

From the Kali environment, start the FastAPI server:

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

Verify the API:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## WebSocket

The dashboard receives real-time security events through:

```text
ws://10.10.10.10:8000/ws/events
```

A successful connection provides a real-time event stream without requiring the browser to continuously refresh the API.

## API Endpoints

### Health

```bash
curl http://127.0.0.1:8000/health
```

### All Events

```bash
curl http://127.0.0.1:8000/events
```

### Latest Event

```bash
curl http://127.0.0.1:8000/events/latest
```

### Limit Results

```bash
curl "http://127.0.0.1:8000/events?limit=10"
```

### Events by Type

```bash
curl http://127.0.0.1:8000/events/type/PORT_SCAN
```

### Events by Source

```bash
curl http://127.0.0.1:8000/events/source/10.10.10.10
```

## Testing the Detection Engine

The project can be tested inside the isolated VirtualBox lab.

For example, from Kali:

```bash
sudo nmap -sT -p 20-100 10.10.10.20
```

This generates TCP connection attempts toward the Ubuntu server and can trigger the port-scan detection logic depending on the configured thresholds.

Traffic-volume testing can also be performed inside the isolated lab:

```bash
ping -f -c 100 10.10.10.20
```

If the system rejects the default flood interval, use the interval permitted by your environment, for example:

```bash
ping -i 0.002 -c 100 10.10.10.20
```

> Only perform testing against systems you own or have explicit authorization to test. This project is intended for a controlled cybersecurity lab.

## Example Security Event Flow

```text
Network Traffic
      │
      ▼
Scapy Packet Capture
      │
      ▼
Detection Rules
      │
      ├── PORT_SCAN
      ├── TRAFFIC_SPIKE
      └── ICMP_BURST
      │
      ▼
SQLite Event Storage
      │
      ├───────────────┐
      ▼               ▼
   REST API       WebSocket
      │               │
      └───────┬───────┘
              ▼
       React Dashboard
              │
              ▼
       Live Visualization
```

## Dashboard

The dashboard provides:

- Connection status
- Total detected events
- Port-scan count
- Traffic-spike count
- ICMP-burst count
- Attacker/target topology
- Live attack activity
- Event timestamps
- Source and destination IPs
- Protocol information
- Severity
- Detailed event information
- Real-time WebSocket updates

## Security Considerations

This project is designed as a **cybersecurity learning and demonstration project**.

It should be deployed in an isolated environment such as:

- VirtualBox Host-Only networking
- A dedicated cybersecurity lab
- A controlled test network

Do not run network attack tests against systems or networks without authorization.

The repository intentionally does not contain:

- Credentials
- Private SSH keys
- API secrets
- Database credentials
- Personal `.env` files

## Future Improvements

Possible future development includes:

- Additional detection rules
- Improved severity scoring
- Historical event charts
- Event filtering and searching
- IP-based investigation views
- Protocol statistics
- Network traffic graphs
- Authentication for the dashboard/API
- Containerized deployment
- Automated testing
- Production deployment configuration

## Project Goal

The goal of this project is to demonstrate how a basic security monitoring pipeline can be built from the ground up:

```text
Packet Capture
      ↓
Detection
      ↓
Event Generation
      ↓
Event Storage
      ↓
API
      ↓
Real-Time WebSocket
      ↓
Security Dashboard
```

It combines networking, packet analysis, detection logic, backend development, databases, WebSockets and frontend visualization into a single cybersecurity project.

## License

This project is intended for educational and authorized security-testing purposes.
