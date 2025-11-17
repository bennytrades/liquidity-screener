import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

// Enhanced Type Definition for Alert Data
type PairAlert = {
  id: string;
  name: string;
  level: string;
  exchange: string;
  timestamp: number;
};

// Enhanced Color Mapping for Levels with gradients and trading themes
const levelConfig: Record<string, { color: string; gradient: string; icon: string; glow: string }> = {
  PDH: { 
    color: "#ef4444", 
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
    icon: "📈", 
    glow: "0 0 20px rgba(239, 68, 68, 0.5)" 
  },
  PDL: { 
    color: "#10b981", 
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
    icon: "📉", 
    glow: "0 0 20px rgba(16, 185, 129, 0.5)" 
  },
  PWH: { 
    color: "#f59e0b", 
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
    icon: "⚡", 
    glow: "0 0 20px rgba(245, 158, 11, 0.5)" 
  },
  PWL: { 
    color: "#8b5cf6", 
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", 
    icon: "💫", 
    glow: "0 0 20px rgba(139, 92, 246, 0.5)" 
  },
  iHOD: { 
    color: "#06b6d4", 
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", 
    icon: "🎯", 
    glow: "0 0 20px rgba(6, 182, 212, 0.5)" 
  },
  iLOD: { 
    color: "#ec4899", 
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", 
    icon: "🔥", 
    glow: "0 0 20px rgba(236, 72, 153, 0.5)" 
  },
  "1H LVL": { 
    color: "#f97316", 
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
    icon: "⏱️", 
    glow: "0 0 20px rgba(249, 115, 22, 0.5)" 
  },
  "4H LVL": { 
    color: "#84cc16", 
    gradient: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)", 
    icon: "🕐", 
    glow: "0 0 20px rgba(132, 204, 22, 0.5)" 
  },
  "GAP FILLED": { 
    color: "#3b82f6", 
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
    icon: "🎖️", 
    glow: "0 0 20px rgba(59, 130, 246, 0.5)" 
  },
  UNKNOWN: { 
    color: "#6b7280", 
    gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)", 
    icon: "❓", 
    glow: "0 0 20px rgba(107, 114, 128, 0.5)" 
  },
};

// Modern Trading Dashboard Component
export default function EnhancedTradingDashboard() {
  const [alerts, setAlerts] = useState<PairAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Real-time Firestore Data Fetch with enhanced error handling
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

    return () => unsubscribe();
  }, []);

  // Enhanced Timer to Force Re-render Every Second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Enhanced Delete Function with animation
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "webhooks", id));
      console.log(`Deleted alert with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Enhanced Timer Formatting with better UX
  const formatTimer = (timestamp: number) => {
    const elapsed = Math.max(0, Math.floor((currentTime - timestamp) / 1000));
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    if (elapsed < 60) {
      return `${seconds}s`;
    } else if (elapsed < 3600) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Enhanced loading animation
  const LoadingSpinner = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '50vh',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        border: '4px solid #1f2937',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ 
        marginTop: '20px', 
        color: '#9ca3af',
        fontSize: '18px',
        fontWeight: '500'
      }}>Loading Market Data...</p>
    </div>
  );

  // Enhanced empty state
  const EmptyState = () => (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
      <h3 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '10px',
        color: '#f3f4f6'
      }}>No Active Signals</h3>
      <p style={{ fontSize: '16px' }}>Waiting for liquidity events...</p>
    </div>
  );

  return (
    <>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes slideIn {
            0% { 
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            100% { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
          }
          
          .alert-card {
            animation: slideIn 0.5s ease-out;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .alert-card:hover {
            transform: translateY(-8px) scale(1.02);
          }
          
          .level-badge {
            transition: all 0.3s ease;
          }
          
          .level-badge:hover {
            transform: scale(1.1);
          }
          
          .delete-btn {
            transition: all 0.2s ease;
          }
          
          .delete-btn:hover {
            transform: scale(1.2);
            filter: brightness(1.2);
          }
        `}
      </style>

      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: '#f8fafc'
      }}>
        {/* Enhanced Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid #475569',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "800",
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: "16px",
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            💎 LIQUIDITY TERMINAL 💎
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#94a3b8',
            fontWeight: '500',
            marginBottom: '20px'
          }}>
            Real-time crypto liquidity monitoring & alerts
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            <div>📊 Total Alerts: <span style={{color: '#3b82f6', fontWeight: '700'}}>{alerts.length}</span></div>
            <div>🔥 Active Markets: <span style={{color: '#10b981', fontWeight: '700'}}>{new Set(alerts.map(a => a.exchange)).size}</span></div>
            <div>⏱️ Live Updates: <span style={{color: '#f59e0b', fontWeight: '700'}}>ON</span></div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner />
        ) : alerts.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "24px",
            maxWidth: "1400px",
            margin: '0 auto',
            width: "100%",
          }}>
            {alerts.map((alert, index) => {
              const levelInfo = levelConfig[alert.level] || levelConfig.UNKNOWN;
              const isHovered = hoveredCard === alert.id;
              
              return (
                <div
                  key={alert.id}
                  className="alert-card"
                  style={{
                    background: isHovered 
                      ? `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)`
                      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: "20px",
                    padding: "24px",
                    border: isHovered ? '2px solid #3b82f6' : '1px solid #475569',
                    boxShadow: isHovered 
                      ? '0 25px 50px -12px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                      : '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                    position: "relative",
                    overflow: "hidden",
                    animationDelay: `${index * 0.1}s`
                  }}
                  onMouseEnter={() => setHoveredCard(alert.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Animated background gradient */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: levelInfo.gradient,
                    opacity: isHovered ? 0.1 : 0.05,
                    transition: 'opacity 0.3s ease',
                    borderRadius: '20px'
                  }}></div>

                  {/* Delete Button */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(alert.id)}
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: "none",
                      color: "white",
                      fontSize: "16px",
                      cursor: "pointer",
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                  >
                    ✕
                  </button>

                  {/* Trading Pair Header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    position: 'relative',
                    zIndex: 5
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ 
                        fontSize: "32px", 
                        fontWeight: "900", 
                        color: "#f1f5f9",
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}>
                        {alert.name}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end'
                    }}>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#3b82f6",
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        {alert.exchange}
                      </div>
                    </div>
                  </div>

                  {/* Level Badge with Animation */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    position: 'relative',
                    zIndex: 5
                  }}>
                    <div
                      className="level-badge"
                      style={{
                        display: "inline-flex",
                        alignItems: 'center',
                        gap: '8px',
                        padding: "12px 20px",
                        borderRadius: "12px",
                        background: levelInfo.gradient,
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "700",
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: isHovered ? levelInfo.glow : 'none',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{levelInfo.icon}</span>
                      {alert.level}
                    </div>
                  </div>

                  {/* Timer with Enhanced Styling */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    position: 'relative',
                    zIndex: 5
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(71, 85, 105, 0.5)'
                    }}>
                      <span style={{ fontSize: '16px' }}>⏱️</span>
                      <span style={{ 
                        fontSize: "16px", 
                        color: "#e2e8f0",
                        fontWeight: '600',
                        fontFamily: 'monospace'
                      }}>
                        {formatTimer(alert.timestamp)}
                      </span>
                    </div>
                    
                    <div style={{
                      padding: '8px 16px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#10b981',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      LIVE SIGNAL
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
