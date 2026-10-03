import { useEffect, useState } from "react";
import "./App.css";

const API = "http://10.10.10.10:8000";
const WS = "ws://10.10.10.10:8000/ws/events";

function App() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    fetch(`${API}/events?limit=50`)
      .then((res) => res.json())
      .then((data) => {
        const loadedEvents = data.events || [];
        setEvents(loadedEvents);

        if (loadedEvents.length > 0) {
          setLastEvent(loadedEvents[0]);
        }
      })
      .catch((err) => {
        console.error("API error:", err);
      });

    const socket = new WebSocket(WS);

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = () => {
      setConnected(false);
    };

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);

        if (data.type === "security_event" && data.event) {
          setLastEvent(data.event);

          setEvents((previous) => {
            const updated = [
              data.event,
              ...previous.filter(
                (event) => event.event_id !== data.event.event_id
              ),
            ];

            return updated.slice(0, 50);
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const portScans = events.filter(
    (event) => event.event_type === "PORT_SCAN"
  ).length;

  const trafficSpikes = events.filter(
    (event) => event.event_type === "TRAFFIC_SPIKE"
  ).length;

  const icmpBursts = events.filter(
    (event) => event.event_type === "ICMP_BURST"
  ).length;

  const attackerEvents = events.filter(
    (event) => event.source_ip === "10.10.10.10"
  ).length;

  const targetEvents = events.filter(
    (event) => event.destination_ip === "10.10.10.20"
  ).length;

  const attackActive =
    lastEvent &&
    (lastEvent.source_ip === "10.10.10.10" ||
      lastEvent.destination_ip === "10.10.10.10");

  const attackClass = lastEvent
    ? lastEvent.event_type.toLowerCase().replace(/_/g, "-")
    : "";

  const statusText = lastEvent
    ? lastEvent.event_type === "PORT_SCAN"
      ? "PORT SCAN DETECTED"
      : lastEvent.event_type === "TRAFFIC_SPIKE"
      ? "TRAFFIC SPIKE DETECTED"
      : lastEvent.event_type === "ICMP_BURST"
      ? "ICMP BURST DETECTED"
      : "SECURITY EVENT DETECTED"
    : "MONITORING";

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Network Attack Visualizer</h1>
          <p>Real-Time Security Monitoring Dashboard</p>
        </div>

        <div className={`connection ${connected ? "online" : "offline"}`}>
          <span className="status-dot"></span>
          {connected ? "LIVE" : "OFFLINE"}
        </div>
      </header>

      <main>
        {/* STAT CARDS */}

        <section className="cards">
          <div className="card">
            <span>Total Events</span>
            <strong>{events.length}</strong>
          </div>

          <div className="card danger">
            <span>Port Scans</span>
            <strong>{portScans}</strong>
          </div>

          <div className="card warning">
            <span>Traffic Spikes</span>
            <strong>{trafficSpikes}</strong>
          </div>

          <div className="card info">
            <span>ICMP Bursts</span>
            <strong>{icmpBursts}</strong>
          </div>
        </section>

        {/* NETWORK TOPOLOGY */}

        <section className="panel topology-panel">
          <div className="panel-header">
            <div>
              <h2>Network Topology</h2>
              <p>Real-time attack path visualization</p>
            </div>

            <div className={`threat-status ${attackClass}`}>
              <span className="status-pulse"></span>
              {statusText}
            </div>
          </div>

          <div className="topology">
            {/* ATTACKER */}

            <div className="network-node attacker-node">
              <div className="node-icon">⚔</div>

              <div className="node-title">KALI ATTACKER</div>

              <div className="node-ip">10.10.10.10</div>

              <div className="node-role">Detection / Source</div>

              <div className="node-events">
                {attackerEvents} events
              </div>
            </div>

            {/* CONNECTION */}

            <div className="attack-link-area">
              <div
                className={`attack-link ${
                  attackActive ? "attack-active" : ""
                } ${attackClass}`}
              >
                <div className="packet packet-one"></div>
                <div className="packet packet-two"></div>
                <div className="packet packet-three"></div>
              </div>

              <div className="attack-label">
                {lastEvent ? (
                  <>
                    <span className={`attack-type ${attackClass}`}>
                      {lastEvent.event_type}
                    </span>

                    <span className="attack-protocol">
                      {lastEvent.protocol}
                    </span>
                  </>
                ) : (
                  <span className="waiting-label">
                    Waiting for traffic...
                  </span>
                )}
              </div>
            </div>

            {/* TARGET */}

            <div className="network-node target-node">
              <div className="node-icon">🖥</div>

              <div className="node-title">UBUNTU SERVER</div>

              <div className="node-ip">10.10.10.20</div>

              <div className="node-role">Protected Target</div>

              <div className="node-events">
                {targetEvents} events
              </div>
            </div>
          </div>

          <div className="topology-legend">
            <div>
              <span className="legend-dot attacker"></span>
              Attacker
            </div>

            <div>
              <span className="legend-dot target"></span>
              Target
            </div>

            <div>
              <span className="legend-dot traffic"></span>
              Live Traffic
            </div>
          </div>
        </section>

        {/* LIVE ATTACK ACTIVITY */}

        <section className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Live Attack Activity</h2>
              <p>
                Recent security activity received from the detection engine
              </p>
            </div>

            <span className="event-count">
              {Math.min(events.length, 10)} recent
            </span>
          </div>

          <div className="activity-list">
            {events.slice(0, 10).map((event) => {
              const eventClass = event.event_type
                .toLowerCase()
                .replace(/_/g, "-");

              return (
                <div className="activity-item" key={event.event_id}>
                  <div className={`activity-indicator ${eventClass}`}></div>

                  <div className="activity-main">
                    <div className="activity-title">
                      <span className={`activity-badge ${eventClass}`}>
                        {event.event_type}
                      </span>

                      <span className="activity-time">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="activity-route">
                      <span>{event.source_ip}</span>
                      <span className="route-arrow">→</span>
                      <span>{event.destination_ip}</span>
                    </div>
                  </div>

                  <div className="activity-protocol">
                    {event.protocol}
                  </div>

                  <div className={`activity-severity ${event.severity}`}>
                    {event.severity}
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="activity-empty">
                Waiting for security activity...
              </div>
            )}
          </div>
        </section>

        {/* SECURITY EVENTS */}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Live Security Events</h2>
              <p>Events received from the detection engine</p>
            </div>

            <span className="event-count">
              {events.length} events
            </span>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Protocol</th>
                  <th>Severity</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty">
                      Waiting for security events...
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.event_id}>
                      <td>
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </td>

                      <td>
                        <span
                          className={`event-badge ${event.event_type
                            .toLowerCase()
                            .replace(/_/g, "-")}`}
                        >
                          {event.event_type}
                        </span>
                      </td>

                      <td>{event.source_ip}</td>

                      <td>{event.destination_ip}</td>

                      <td>{event.protocol}</td>

                      <td>
                        <span
                          className={`severity ${event.severity}`}
                        >
                          {event.severity}
                        </span>
                      </td>

                      <td>
                        <details>
                          <summary>View</summary>

                          <pre>
                            {JSON.stringify(
                              event.details,
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
