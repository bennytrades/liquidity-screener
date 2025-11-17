// Discord Card Component (Server-side rendering, no timer)
const generateDiscordCardHTML = (alertData) => {
  const { name, level, timestamp } = alertData;

  // Level-specific background colors (same as website)
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

  // Trading symbols (base64 and URL)
  const tradingSymbols = {
    "ES": "data:image/png;base64,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",
    "NQ": "https://s3-symbol-logo.tradingview.com/indices/nasdaq-100--600.png"
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

  // Convert timestamp to NY time
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

  const symbolImage = getSymbolImage(name);
  const cardBackground = getLevelBackground(level);
  const nyTime = getAlertNYTime(timestamp);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: transparent;
            width: 400px;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .discord-card {
            width: 380px;
            height: 280px;
            background: ${cardBackground};
            border-radius: 20px;
            padding: 24px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .ny-time {
            position: absolute;
            top: 16px;
            left: 16px;
            font-size: 12px;
            font-weight: 700;
            color: #000000;
            background: rgba(255, 255, 255, 0.9);
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid rgba(0, 0, 0, 0.2);
        }
        
        .ticker-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 30px;
            margin-bottom: 20px;
        }
        
        .symbol-img {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .ticker-name {
            font-size: 32px;
            font-weight: 900;
            color: #ffffff;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
        }
        
        .level-section {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .level-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 12px;
            background-color: rgba(0, 0, 0, 0.7);
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .bottom-section {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .live-signal {
            padding: 8px 16px;
            background: rgba(16, 185, 129, 0.9);
            border-radius: 10px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            font-size: 12px;
            font-weight: 700;
            color: #ffffff;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="discord-card">
        <!-- NY Time -->
        <div class="ny-time">🕐 NY: ${nyTime}</div>
        
        <!-- Ticker Name with Symbol -->
        <div class="ticker-section">
            ${symbolImage ? `<img src="${symbolImage}" alt="${name}" class="symbol-img">` : ''}
            <div class="ticker-name">${name}</div>
        </div>
        
        <!-- Level Badge -->
        <div class="level-section">
            <div class="level-badge">${level}</div>
        </div>
        
        <!-- Live Signal (No Timer for Discord) -->
        <div class="bottom-section">
            <div class="live-signal">LIVE SIGNAL</div>
        </div>
    </div>
</body>
</html>`;
};

export { generateDiscordCardHTML };
