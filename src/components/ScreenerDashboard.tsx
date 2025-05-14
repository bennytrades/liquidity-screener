import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

type PairAlert = {
  id: string;
  name: string;
  level: "PDH" | "PDL" | "PWH" | "PWL" | "UNKNOWN";
  checked?: boolean; // For local UI state
};

const levelColors: Record<string, string> = {
  PDH: "#22c55e",
  PDL: "#3b82f6",
  PWH: "#facc15",
  PWL: "#ef4444",
  UNKNOWN: "#6b7280",
};

export default function ScreenerDashboard() {
  const [alerts, setAlerts] = useState<PairAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "webhooks"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts: PairAlert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAlerts.push({
          id: doc.id,
          name: data.name,
          level: data.level,
          checked: false,
        });
      });

      setAlerts(fetchedAlerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleChecked = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, checked: !alert.checked } : alert
      )
    );
  };

  const pageStyle = {
    backgroundColor: "#111827",
    color: "#ffffff",
    minHeight: "100vh",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  };

  const cardStyle = {
    backgroundColor: "#1f2937",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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

  const heartStyle = (checked: boolean) => ({
    fontSize: "24px",
    color: checked ? "#ef4444" : "#ffffff",
    cursor: "pointer",
    transition: "color 0.2s ease",
  });

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
        alerts.map((alert) => (
          <div
            key={alert.id}
            style={cardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{alert.name}</div>
              <div style={badgeStyle(alert.level)}>Level: {alert.level}</div>
            </div>
            <div onClick={() => toggleChecked(alert.id)} style={heartStyle(alert.checked!)}>
              {alert.checked ? "❤️" : "🤍"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
