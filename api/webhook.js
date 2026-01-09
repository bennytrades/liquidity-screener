import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// Discord Webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Format timestamp to NY timezone
 */
const formatNYTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch (error) {
    return "Invalid Date";
  }
};

/**
 * Get current trading day window (18:00 yesterday to 16:00 today in NY time)
 * Returns { start: timestamp, end: timestamp }
 */
const getTradingDayWindow = () => {
  // Get current time in NY timezone
  const now = new Date();
  const nyTimeString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const nyNow = new Date(nyTimeString);
  
  const currentHour = nyNow.getHours();
  
  // If before 16:00 (4 PM), trading day started yesterday at 18:00
  // If after 16:00 (4 PM), trading day started today at 18:00
  let tradingDayStart;
  if (currentHour < 16) {
    // Before 4 PM - trading day started yesterday at 18:00
    tradingDayStart = new Date(nyNow);
    tradingDayStart.setDate(tradingDayStart.getDate() - 1);
    tradingDayStart.setHours(18, 0, 0, 0);
  } else {
    // After 4 PM - trading day started today at 18:00
    tradingDayStart = new Date(nyNow);
    tradingDayStart.setHours(18, 0, 0, 0);
  }
  
  // Trading day ends 22 hours after start (at 16:00 next day)
  const tradingDayEnd = new Date(tradingDayStart);
  tradingDayEnd.setHours(tradingDayEnd.getHours() + 22);
  
  return {
    start: tradingDayStart.getTime(),
    end: tradingDayEnd.getTime()
  };
};

/**
 * Normalize ticker name to base symbol
 * ES1!, ESUSD, ES, ESH24 → ES
 * NQ1!, NQUSD, NQ, NQH24 → NQ
 */
const normalizeTickerName = (name) => {
  const normalized = name.toUpperCase().trim();
  
  // Extract base symbol (ES, NQ, etc.)
  // Remove common suffixes: 1!, USD, H24, M24, U24, Z24, etc.
  const baseSymbol = normalized
    .replace(/1!/g, '')      // Remove 1!
    .replace(/USD$/g, '')    // Remove USD at end
    .replace(/[HMUZ]\d{2}$/g, '') // Remove contract months (H24, M24, etc.)
    .replace(/\d+$/g, '')    // Remove trailing numbers
    .trim();
  
  // Map common variations
  const symbolMap = {
    'ES': 'ES',
    'E-MINI S&P': 'ES',
    'EMINI S&P': 'ES',
    'SPX': 'ES',
    
    'NQ': 'NQ',
    'E-MINI NASDAQ': 'NQ',
    'EMINI NASDAQ': 'NQ',
    'NDX': 'NQ',
  };
  
  return symbolMap[baseSymbol] || baseSymbol;
};

/**
 * Normalize level name to consistent format
 * Maps various level formats to standard names
 */
const normalizeLevelName = (level) => {
  const normalized = level.toUpperCase().trim();
  
  // Map variations to standard names
  const levelMap = {
    'PDH': 'PDH',
    'PREVIOUS DAY HIGH': 'PDH',
    'PREV DAY HIGH': 'PDH',
    
    'PDL': 'PDL',
    'PREVIOUS DAY LOW': 'PDL',
    'PREV DAY LOW': 'PDL',
    
    'ASIA HIGH': 'ASIA_HIGH',
    'AS.H': 'ASIA_HIGH',
    'AS H': 'ASIA_HIGH',
    'ASH': 'ASIA_HIGH',
    'ASIAN HIGH': 'ASIA_HIGH',
    
    'ASIA LOW': 'ASIA_LOW',
    'AS.L': 'ASIA_LOW',
    'AS L': 'ASIA_LOW',
    'ASL': 'ASIA_LOW',
    'ASIAN LOW': 'ASIA_LOW',
    
    'LONDON HIGH': 'LONDON_HIGH',
    'LON.H': 'LONDON_HIGH',
    'LON H': 'LONDON_HIGH',
    'LONH': 'LONDON_HIGH',
    
    'LONDON LOW': 'LONDON_LOW',
    'LON.L': 'LONDON_LOW',
    'LON L': 'LONDON_LOW',
    'LONL': 'LONDON_LOW',
    
    // PWH and PWL - not filtered yet
    'PWH': 'PWH',
    'PREVIOUS WEEK HIGH': 'PWH',
    
    'PWL': 'PWL',
    'PREVIOUS WEEK LOW': 'PWL',
  };
  
  return levelMap[normalized] || normalized;
};

/**
 * Create unique key for ticker + level combination
 */
const createAlertKey = (ticker, level) => {
  const normalizedTicker = normalizeTickerName(ticker);
  const normalizedLevel = normalizeLevelName(level);
  return `${normalizedTicker}_${normalizedLevel}`;
};

/**
 * Check if Discord alert was already sent for this ticker + level in current trading day
 */
const wasDiscordAlertSent = async (ticker, level) => {
  const alertKey = createAlertKey(ticker, level);
  const { start, end } = getTradingDayWindow();
  
  console.log(`📊 Checking Discord alert history for ${alertKey}`);
  console.log(`   Trading day window: ${new Date(start).toLocaleString()} to ${new Date(end).toLocaleString()}`);
  
  try {
    // Query discord_alerts collection for this ticker + level in current trading day
    const snapshot = await db.collection('discord_alerts')
      .where('alertKey', '==', alertKey)
      .where('timestamp', '>=', start)
      .where('timestamp', '<=', end)
      .limit(1)
      .get();
    
    const alreadySent = !snapshot.empty;
    
    if (alreadySent) {
      const existingAlert = snapshot.docs[0].data();
      console.log(`⏭️  Discord alert already sent for ${alertKey} at ${formatNYTimestamp(existingAlert.timestamp)}`);
    } else {
      console.log(`✅ No Discord alert sent yet for ${alertKey} in this trading day`);
    }
    
    return alreadySent;
  } catch (error) {
    console.error('❌ Error checking Discord alert history:', error);
    // If error, allow the alert to be sent (fail open)
    return false;
  }
};

/**
 * Record that Discord alert was sent for this ticker + level
 */
const recordDiscordAlert = async (ticker, level, timestamp) => {
  const alertKey = createAlertKey(ticker, level);
  const normalizedTicker = normalizeTickerName(ticker);
  const normalizedLevel = normalizeLevelName(level);
  
  try {
    await db.collection('discord_alerts').add({
      alertKey: alertKey,           // Unique key: "ES_PDH"
      ticker: normalizedTicker,     // "ES"
      level: normalizedLevel,       // "PDH"
      timestamp: timestamp,         // When alert occurred
      sentAt: Date.now(),          // When Discord was sent
    });
    console.log(`📝 Recorded Discord alert for ${alertKey}`);
  } catch (error) {
    console.error('❌ Error recording Discord alert:', error);
  }
};

/**
 * Check if level should be rate limited (PDH, PDL, ASIA, LONDON)
 */
const shouldRateLimitLevel = (level) => {
  const normalizedLevel = normalizeLevelName(level);
  const rateLimitedLevels = ['PDH', 'PDL', 'ASIA_HIGH', 'ASIA_LOW', 'LONDON_HIGH', 'LONDON_LOW'];
  return rateLimitedLevels.includes(normalizedLevel);
};

/**
 * Get ticker color and emoji
 */
const getTickerConfig = (name) => {
  const normalizedTicker = normalizeTickerName(name);
  
  // Check ticker name for NQ or ES
  if (normalizedTicker === 'NQ') {
    return { emoji: "🔵", color: 0x3b82f6 }; // Blue
  } else if (normalizedTicker === 'ES') {
    return { emoji: "🔴", color: 0xef4444 }; // Red
  }
  
  // Default color
  return { emoji: "⚪", color: 0x6b7280 }; // Grey
};

/**
 * Send clean text-only Discord alert
 */
const sendDiscordTextAlert = async (alertData) => {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("⚠️ Discord webhook URL not configured");
    return false;
  }

  try {
    const { name, level, exchange, timestamp } = alertData;
    const { emoji, color } = getTickerConfig(name);
    const nyTime = formatNYTimestamp(timestamp);

    // Build description with optional exchange
    let description = `**Level:** ${level}\n**Time:** ${nyTime}`;
    if (exchange && exchange !== "N/A") {
      description = `**Exchange:** ${exchange}\n${description}`;
    }

    // Create clean Discord embed
    const embed = {
      title: `${emoji} ${name} HIT ${level}`,
      description: description,
      color: color,
      timestamp: new Date(timestamp).toISOString(),
      footer: {
        text: "Liquidity Level Alert",
      },
    };

    // Send to Discord
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    console.log("✅ Discord text alert sent successfully!");
    return true;
  } catch (error) {
    console.error("❌ Discord alert failed:", error.message);
    return false;
  }
};

/**
 * Main Webhook Handler with Discord Rate Limiting
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📥 Webhook received:", JSON.stringify(req.body));

    // Extract alert data from TradingView webhook
    const { name, level, exchange } = req.body;

    // Only name and level are required
    if (!name || !level) {
      return res.status(400).json({
        error: "Missing required fields: name, level",
      });
    }

    // Create alert object (exchange is optional)
    const alertData = {
      name: name.trim(),
      level: level.trim(),
      exchange: exchange ? exchange.trim() : "N/A",
      timestamp: Date.now(),
    };

    console.log("📊 Processing alert:", alertData);

    // ALWAYS save to Firestore (no rate limiting on database)
    const docRef = await db.collection("alerts").add(alertData);
    console.log("✅ Alert saved to Firestore:", docRef.id);

    // Check if this level should be rate limited
    const shouldLimit = shouldRateLimitLevel(alertData.level);
    
    let discordSent = false;
    let discordSkipped = false;
    
    if (shouldLimit) {
      // Check if Discord alert was already sent for this TICKER + LEVEL today
      const alreadySent = await wasDiscordAlertSent(alertData.name, alertData.level);
      
      if (alreadySent) {
        const alertKey = createAlertKey(alertData.name, alertData.level);
        console.log(`⏭️  Skipping Discord alert - ${alertKey} already sent in this trading day`);
        discordSkipped = true;
      } else {
        // Send Discord alert and record it
        discordSent = await sendDiscordTextAlert(alertData);
        if (discordSent) {
          await recordDiscordAlert(alertData.name, alertData.level, alertData.timestamp);
        }
      }
    } else {
      // Not rate limited (e.g., PWH, PWL) - always send
      console.log(`📢 Level ${alertData.level} not rate limited - sending to Discord`);
      discordSent = await sendDiscordTextAlert(alertData);
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "Alert processed successfully",
      id: docRef.id,
      alert: alertData,
      discord: {
        sent: discordSent,
        skipped: discordSkipped,
        rateLimited: shouldLimit,
        alertKey: shouldLimit ? createAlertKey(alertData.name, alertData.level) : null,
      }
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}