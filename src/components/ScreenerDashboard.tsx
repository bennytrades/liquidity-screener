// ✅ React Core and Firestore Imports
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

// ✅ Type Definition for Alert Data
type PairAlert = {
  id: string;
  name: string;
  level: string;
  exchange: string;
  timestamp: number;
};

// ✅ Color Mapping for Levels
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

// ✅ Main Component
export default function ScreenerDashboard() {
  const [alerts, setAlerts] = useState<PairAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now()); // ⏱️ Keeps Current Time Updated for Live Timer

  // ✅ Real-time Firestore Data Fetch
  useEffect(() => {
    const q = query(collection(db, "webhooks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts: PairAlert[] = [];
      querySnapshot.forEach((docItem) => {
        const data = docItem.data();
        const timestamp = data.timestamp?.seconds ? data.timestamp.seconds * 1000 : Date.now();

        fetchedAlerts.push({
          id: docItem.id,
          name: data.name,
          level: data.level,
          exchange: data.exchange || "Unknown",
          timestamp,
        });
      });
      setAlerts(fetchedAlerts);
      setLoading(false);
    });

    return () => unsubscribe(); // ✅ Cleanup on Unmount
  }, []);

  // ✅ Global Timer to Force Re-render Every Second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Delete an Alert from Firestore
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "webhooks", id));
      console.log(`Deleted alert with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // ✅ Timer Formatting Logic with H:MM:SS + "mins ago" after 60s
  const formatTimer = (timestamp: number) => {
    const elapsed = Math.max(0, Math.floor((currentTime - timestamp) / 1000));

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

  return (
    <div style={{
      backgroundColor: "#1e1e1e", // ChatGPT-Like Dark Background
      color: "#ffffff",
      minHeight: "100vh",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
        🚀 Liquidity Screener 🚀
      </h1>

      {/* ✅ Loading or No Data */}
      {loading ? (
        <p>Loading Data...</p>
      ) : alerts.length === 0 ? (
        <p>No Liquidity Events Today</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
          maxWidth: "800px",
          width: "100%",
        }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: "#f9f9f9", // Light Card Background
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {/* ❌ Close Button */}
              <button
                onClick={() => handleDelete(alert.id)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ❌
              </button>

              {/* 📈 Name and Exchange Row */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>
                  {alert.name}
                </div>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#60a5fa" // Light Blue
                }}>
                  {alert.exchange}
                </div>
              </div>

              {/* 🏷️ Level Badge */}
              <div style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "12px",
                backgroundColor: levelColors[alert.level] || "#6b7280",
                color: "#ffffff",
                fontSize: "12px",
                marginBottom: "8px",
                textAlign: "center",
                alignSelf: "flex-start",
              }}>
                {alert.level}
              </div>

              {/* ⏱️ Timer */}
              <div style={{ fontSize: "14px", color: "#555555" }}>
                ⏱️ {formatTimer(alert.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
