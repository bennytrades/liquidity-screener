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
 * Get level emoji and color
 */
const getLevelConfig = (level) => {
  const configs = {
    "ASIA HIGH": { emoji: "🟠", color: 0xf97316 },
    "ASIA LOW": { emoji: "🟠", color: 0xf97316 },
    "ASIA H": { emoji: "🟠", color: 0xf97316 },
    "ASIA L": { emoji: "🟠", color: 0xf97316 },
    "LONDON HIGH": { emoji: "🔴", color: 0xef4444 },
    "LONDON LOW": { emoji: "🔴", color: 0xef4444 },
    "LONDON H": { emoji: "🔴", color: 0xef4444 },
    "LONDON L": { emoji: "🔴", color: 0xef4444 },
    PDH: { emoji: "⚪", color: 0x6b7280 },
    PDL: { emoji: "⚪", color: 0x6b7280 },
    PWH: { emoji: "🟢", color: 0x10b981 },
    PWL: { emoji: "🟢", color: 0x10b981 },
  };

  return configs[level] || { emoji: "⚪", color: 0x6b7280 };
};

/**
 * Send clean text-only Discord alert
 */
const sendDiscordTextAlert = async (alertData) => {
  if (!DISCORD_WEBHOOK_URL) {
    console.log("⚠️ Discord webhook URL not configured");
    return;
  }

  try {
    const { name, level, exchange, timestamp } = alertData;
    const { emoji, color } = getLevelConfig(level);
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
  } catch (error) {
    console.error("❌ Discord alert failed:", error.message);
    throw error;
  }
};

/**
 * Main Webhook Handler (Clean Text Only)
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

    // Save to Firestore
    const docRef = await db.collection("alerts").add(alertData);
    console.log("✅ Alert saved to Firestore:", docRef.id);

    // Send text-only Discord notification
    await sendDiscordTextAlert(alertData);

    // Success response
    return res.status(200).json({
      success: true,
      message: "Alert processed successfully",
      id: docRef.id,
      alert: alertData,
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
