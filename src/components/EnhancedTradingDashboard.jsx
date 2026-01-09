import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where, getDocs } from "firebase/firestore";

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
  "ES": "data:image/png;base64,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.jsx",
  "NQ": "https://s3-symbol-logo.tradingview.com/indices/nasdaq-100--600.png"
};

/**
 * Normalize ticker name to match backend logic
 */
const normalizeTickerName = (name) => {
  const normalized = name.toUpperCase().trim();
  const baseSymbol = normalized
    .replace(/1!/g, '')
    .replace(/USD$/g, '')
    .replace(/[HMUZ]\d{2}$/g, '')
    .replace(/\d+$/g, '')
    .trim();
  
  const symbolMap = {
    'ES': 'ES',
    'NQ': 'NQ',
  };
  
  return symbolMap[baseSymbol] || baseSymbol;
};

/**
 * Normalize level name to match backend logic
 */
const normalizeLevelName = (level) => {
  const normalized = level.toUpperCase().trim();
  
  const levelMap = {
    'PDH': 'PDH',
    'PREVIOUS DAY HIGH': 'PDH',
    'PDL': 'PDL',
    'PREVIOUS DAY LOW': 'PDL',
    'ASIA HIGH': 'ASIA_HIGH',
    'AS.H': 'ASIA_HIGH',
    'ASIA LOW': 'ASIA_LOW',
    'AS.L': 'ASIA_LOW',
    'LONDON HIGH': 'LONDON_HIGH',
    'LON.H': 'LONDON_HIGH',
    'LONDON LOW': 'LONDON_LOW',
    'LON.L': 'LONDON_LOW',
    'PWH': 'PWH',
    'PWL': 'PWL',
  };
  
  return levelMap[normalized] || normalized;
};

/**
 * Create alert key to match backend
 */
const createAlertKey = (ticker, level) => {
  const normalizedTicker = normalizeTickerName(ticker);
  const normalizedLevel = normalizeLevelName(level);
  return `${normalizedTicker}_${normalizedLevel}`;
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

  /**
   * Enhanced delete handler:
   * 1. Deletes the alert card (existing behavior)
   * 2. Resets Discord rate limiting for this ticker + level
   */
  const handleDelete = async (id, name, level) => {
    try {
      // Step 1: Delete the alert card
      await deleteDoc(doc(db, "alerts", id));
      console.log("✅ Deleted alert card with ID:", id);

      // Step 2: Reset Discord rate limiting by deleting matching discord_alerts
      const alertKey = createAlertKey(name, level);
      console.log(`🔄 Resetting Discord rate limit for: ${alertKey}`);

      // Query discord_alerts for this specific ticker + level combination
      const discordAlertsRef = collection(db, "discord_alerts");
      const q = query(discordAlertsRef, where("alertKey", "==", alertKey));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Delete all matching discord_alerts documents
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log(`✅ Reset complete: Deleted ${snapshot.size} discord_alert(s) for ${alertKey}`);
        console.log(`💬 Discord can now send alerts for ${alertKey} again!`);
      } else {
        console.log(`ℹ️  No discord_alerts found for ${alertKey} (already reset or never sent)`);
      }

    } catch (error) {
      console.error("❌ Error in handleDelete:", error);
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
    padding: "40px 20px",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "40px",
  };

  const titleStyle = {
    fontSize: "42px",
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: "10px",
    textShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
  };

  if (loading) {
    return (
      <div style={{...containerStyle, display: "flex", justifyContent: "center", alignItems: "center"}}>
        <div style={{fontSize: "24px", color: "#fff"}}>Loading alerts...</div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div style={containerStyle}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div style={headerStyle}>
          <h1 style={titleStyle}>💎 LIQUIDITY TERMINAL 💎</h1>
          <p style={{fontSize: "18px", color: "#94a3b8", fontWeight: "500"}}>
            Real-time US FUTURES liquidity monitoring & alerts
          </p>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          borderRadius: "20px",
          border: "2px solid rgba(255, 255, 255, 0.1)",
          maxWidth: "500px",
          margin: "0 auto",
          padding: "40px"
        }}>
          <div style={{fontSize: "64px", marginBottom: "20px", animation: "pulse 2s ease-in-out infinite"}}>
            📊
          </div>
          <h2 style={{fontSize: "28px", color: "#fff", marginBottom: "10px", textAlign: "center"}}>
            No Active Signals
          </h2>
          <p style={{fontSize: "16px", color: "#94a3b8", textAlign: "center"}}>
            Waiting for liquidity events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
                onClick={() => handleDelete(alert.id, alert.name, alert.level)}
                title="Close alert and allow Discord re-send"
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