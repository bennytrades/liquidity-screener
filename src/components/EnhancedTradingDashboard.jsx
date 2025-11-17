import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const levelColors = {
  PDH: "#ef4444",
  PDL: "#10b981", 
  PWH: "#f59e0b",
  PWL: "#8b5cf6",
  iHOD: "#06b6d4",
  iLOD: "#ec4899",
  "1H LVL": "#f97316",
  "4H LVL": "#84cc16",
  "GAP FILLED": "#3b82f6",
  UNKNOWN: "#6b7280",
};

export default function EnhancedTradingDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const q = query(collection(db, "webhooks"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts = [];
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

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "webhooks", id));
      console.log("Deleted alert with ID:", id);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const formatTimer = (timestamp) => {
    const elapsed = Math.max(0, Math.floor((currentTime - timestamp) / 1000));
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    if (elapsed < 60) {
      return seconds + "s";
    } else if (elapsed < 3600) {
      return minutes + "m " + seconds + "s";
    } else {
      return hours + "h " + minutes + "m";
    }
  };

  const containerStyle = {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    minHeight: "100vh",
    padding: "24px",
    fontFamily: "Inter, sans-serif",
    color: "#f8fafc"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "40px",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    borderRadius: "20px",
    padding: "30px",
    border: "1px solid #475569",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
  };

  const titleStyle = {
    fontSize: "48px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "16px"
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%"
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{textAlign: "center", paddingTop: "50px"}}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid #1f2937",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto"
          }}></div>
          <p style={{marginTop: "20px", color: "#9ca3af", fontSize: "18px"}}>
            Loading Market Data...
          </p>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>💎 LIQUIDITY TERMINAL 💎</h1>
        </div>
        <div style={{textAlign: "center", padding: "60px 20px", color: "#9ca3af"}}>
          <div style={{fontSize: "64px", marginBottom: "20px"}}>📊</div>
          <h3 style={{fontSize: "24px", fontWeight: "600", color: "#f3f4f6"}}>
            No Active Signals
          </h3>
          <p>Waiting for liquidity events...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .alert-card {
          transition: all 0.3s ease;
        }
        .alert-card:hover {
          transform: translateY(-8px) scale(1.02);
        }
      `}</style>

      <div style={headerStyle}>
        <h1 style={titleStyle}>💎 LIQUIDITY TERMINAL 💎</h1>
        <p style={{fontSize: "18px", color: "#94a3b8", fontWeight: "500", marginBottom: "20px"}}>
          Real-time crypto liquidity monitoring & alerts
        </p>
        <div style={{display: "flex", justifyContent: "center", gap: "30px", fontSize: "14px", color: "#64748b"}}>
          <div>📊 Total Alerts: <span style={{color: "#3b82f6", fontWeight: "700"}}>{alerts.length}</span></div>
          <div>🔥 Active Markets: <span style={{color: "#10b981", fontWeight: "700"}}>{new Set(alerts.map(a => a.exchange)).size}</span></div>
          <div>⏱️ Live Updates: <span style={{color: "#f59e0b", fontWeight: "700"}}>ON</span></div>
        </div>
      </div>

      <div style={gridStyle}>
        {alerts.map((alert, index) => {
          const levelColor = levelColors[alert.level] || levelColors.UNKNOWN;
          
          const cardStyle = {
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            borderRadius: "20px",
            padding: "24px",
            border: "1px solid #475569",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            position: "relative",
            overflow: "hidden"
          };

          return (
            <div key={alert.id} className="alert-card" style={cardStyle}>
              <button
                onClick={() => handleDelete(alert.id)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  border: "none",
                  color: "white",
                  fontSize: "16px",
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
              }}>
                <div style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  color: "#f1f5f9"
                }}>
                  {alert.name}
                </div>
                <div style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#3b82f6",
                  background: "rgba(59, 130, 246, 0.1)",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(59, 130, 246, 0.3)"
                }}>
                  {alert.exchange}
                </div>
              </div>

              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "12px",
                backgroundColor: levelColor,
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "700",
                textTransform: "uppercase",
                marginBottom: "16px"
              }}>
                {alert.level}
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(15, 23, 42, 0.6)",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(71, 85, 105, 0.5)"
                }}>
                  <span>⏱️</span>
                  <span style={{
                    fontSize: "16px",
                    color: "#e2e8f0",
                    fontWeight: "600",
                    fontFamily: "monospace"
                  }}>
                    {formatTimer(alert.timestamp)}
                  </span>
                </div>
                
                <div style={{
                  padding: "8px 16px",
                  background: "rgba(16, 185, 129, 0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#10b981",
                  textTransform: "uppercase"
                }}>
                  LIVE SIGNAL
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
