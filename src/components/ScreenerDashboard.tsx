import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

type PairAlert = {
  id: string;
  name: string;
  level:
    | "PDH" | "PDL"
    | "PWH" | "PWL"
    | "iHOD" | "iLOD"
    | "1H LVL" | "4H LVL"
    | "GAP FILLED"
    | "UNKNOWN";
  exchange: string;
  timestamp: number;
};

const levelColors: Record<string, string> = {
  PDH: "#000000",
  PDL: "#000000",
  PWH: "#22c55e",
  PWL: "#22c55e",
  iHOD: "#FFA500",
  iLOD: "#FFA500",
  "1H LVL": "#FF0000",
  "4H LVL": "#FF0000",
  "GAP FILLED": "#3b82f6",
  UNKNOWN: "#6b7280",
};

export default function ScreenerDashboard() {
  const [alerts, setAlerts] = useState<PairAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "webhooks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts: PairAlert[] = [];

      querySnapshot.forEach((docItem) => {
        const data = docItem.data();
        fetchedAlerts.push({
          id: docItem.id,
          name: data.name,
          level: data.level,
          exchange: data.Exchange || "Unknown",
          timestamp: data.timestamp?.seconds ? data.timestamp.seconds * 1000 : Date.now(),
        });
      });

      setAlerts(fetchedAlerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTimer = (timestamp: number) => {
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    const formattedHours = hours > 0 ? `${hours}:` : "";
    const formattedMinutes = String(minutes).padStart(2, "0");

    if (elapsed < 60) {
      const formattedSeconds = String(seconds).padStart(2, "0");
      return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedHours}${formattedMinutes} mins ago`;
    }
  };

  const pageStyle = {
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    minHeight: "100vh",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
    maxWidth: "800px",
    width: "100%",
  };

  const cardStyle = {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    alignItems: "flex-start" as const,
    position: "relative" as const,
  };

  const headerStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  };

  const badgeStyle = (level: string) => ({
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    backgroundColor: levelColors[level] || "#6b7280",
    color: "#ffffff",
    fontSize: "12px",
    marginTop: "8px",
  });

  const timerStyle = {
    fontSize: "14px",
    color: "#555555",
    marginTop: "8px",
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
        🚀 Liquidity Screener
      </h1>

      {loading ? (
        <p>Loading Data...</p>
      ) : alerts.length === 0 ? (
        <p>No Liquidity Events Yet</p>
      ) : (
        <div style={gridStyle}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={headerStyle}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>
                  {alert.name}
                </div>
                <div style={{ fontSize: "14px", color: "#666666" }}>{alert.exchange}</div>
              </div>
              <div style={badgeStyle(alert.level)}>{alert.level}</div>
              <div style={timerStyle}>⏱️ {formatTimer(alert.timestamp)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
