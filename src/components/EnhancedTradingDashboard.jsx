import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

// Level-specific background colors
const levelBackgrounds = {
  "ASIA HIGH": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange
  "ASIA LOW": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange
  "ASIA H": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange  
  "ASIA L": "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange
  "LONDON HIGH": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", // Red
  "LONDON LOW": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", // Red
  "LONDON H": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", // Red
  "LONDON L": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", // Red
  "PDH": "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", // Grey
  "PDL": "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", // Grey
  "PWH": "linear-gradient(135deg, #10b981 0%, #059669 100%)", // Green
  "PWL": "linear-gradient(135deg, #10b981 0%, #059669 100%)", // Green
};

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
  "LONDON HIGH": "#6b7280",
  "LONDON LOW": "#6b7280",
  "LONDON H": "#6b7280",
  "LONDON L": "#6b7280",
  "ASIA HIGH": "#f97316",
  "ASIA LOW": "#f97316",
  "ASIA H": "#f97316",
  "ASIA L": "#f97316",
  UNKNOWN: "#6b7280",
};

// Trading symbols
const tradingSymbols = {
  "ES": "data:image/png;base64,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",
  "NQ": "https://s3-symbol-logo.tradingview.com/indices/nasdaq-100--600.png"
};

export default function EnhancedTradingDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const q = query(collection(db, "alerts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts = [];
      querySnapshot.forEach((docItem) => {
        const data = docItem.data();
        const timestamp = typeof data.timestamp === "number" ? data.timestamp : (data.timestamp?.seconds ? data.timestamp.seconds * 1000 : Date.now());

        fetchedAlerts.push({
          id: docItem.id,
          name: data.name,
          level: data.level,
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
      await deleteDoc(doc(db, "alerts", id));
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

  // Convert alert timestamp to NY time
  const getAlertNYTime = (timestamp) => {
    const alertDate = new Date(timestamp);
    const nyTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).format(alertDate);
    return nyTime;
  };

  // Get symbol image for ticker
  const getSymbolImage = (ticker) => {
    if (ticker.includes("ES") || ticker.includes("es")) {
      return tradingSymbols.ES;
    } else if (ticker.includes("NQ") || ticker.includes("nq")) {
      return tradingSymbols.NQ;
    }
    return null;
  };

  // Get background based on level
  const getLevelBackground = (level) => {
    return levelBackgrounds[level.toUpperCase()] || "linear-gradient(135deg, #1e293b 0%, #334155 100%)";
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
          Real-time US FUTURES liquidity monitoring & alerts
        </p>
        <div style={{display: "flex", justifyContent: "center", gap: "30px", fontSize: "14px", color: "#64748b"}}>
          <div>📊 Total Alerts: <span style={{color: "#3b82f6", fontWeight: "700"}}>{alerts.length}</span></div>
          <div>🔥 Active Markets: <span style={{color: "#10b981", fontWeight: "700"}}>{alerts.length}</span></div>
          <div>⏱️ Live Updates: <span style={{color: "#f59e0b", fontWeight: "700"}}>ON</span></div>
        </div>
      </div>

      <div style={gridStyle}>
        {alerts.map((alert, index) => {
          const levelColor = levelColors[alert.level] || levelColors.UNKNOWN;
          const symbolImage = getSymbolImage(alert.name);
          const cardBackground = getLevelBackground(alert.level);
          
          const cardStyle = {
            background: cardBackground,
            borderRadius: "20px",
            padding: "24px",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            position: "relative",
            overflow: "hidden"
          };

          return (
            <div key={alert.id} className="alert-card" style={cardStyle}>
              {/* Delete Button - Top Right */}
              <button
                onClick={() => handleDelete(alert.id)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(0, 0, 0, 0.7)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
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

              {/* Alert Creation NY Time - Top Left */}
              <div style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                fontSize: "12px",
                fontWeight: "700",
                color: "#000000",
                background: "rgba(255, 255, 255, 0.9)",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(0, 0, 0, 0.2)"
              }}>
                🕐 NY: {getAlertNYTime(alert.timestamp)}
              </div>

              {/* Ticker Name with Symbol - Center */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                marginTop: "50px",
                marginBottom: "30px"
              }}>
                {/* Trading Symbol */}
                {symbolImage && (
                  <img 
                    src={symbolImage}
                    alt={alert.name}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      border: "2px solid rgba(255, 255, 255, 0.3)"
                    }}
                  />
                )}
                {/* Ticker Name */}
                <div style={{
                  fontSize: "32px",
                  fontWeight: "900",
                  color: "#ffffff",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)"
                }}>
                  {alert.name}
                </div>
              </div>

              {/* Level Badge - Center */}
              <div style={{
                textAlign: "center",
                marginBottom: "20px"
              }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  border: "2px solid rgba(255, 255, 255, 0.3)"
                }}>
                  {alert.level}
                </div>
              </div>

              {/* Timer and Live Signal - Bottom */}
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
                  background: "rgba(0, 0, 0, 0.7)",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "2px solid rgba(255, 255, 255, 0.3)"
                }}>
                  <span>⏱️</span>
                  <span style={{
                    fontSize: "16px",
                    color: "#ffffff",
                    fontWeight: "600",
                    fontFamily: "monospace"
                  }}>
                    {formatTimer(alert.timestamp)}
                  </span>
                </div>
                
                <div style={{
                  padding: "8px 16px",
                  background: "rgba(16, 185, 129, 0.9)",
                  borderRadius: "10px",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#ffffff",
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
