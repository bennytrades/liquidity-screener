// ✅ Import Dependencies
import admin from 'firebase-admin'; // Firebase Admin SDK for interacting with Firestore
import fetch from 'node-fetch';    // Used to send HTTP requests (for Discord Webhook alerts)

// ✅ Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Create a Firestore Database Instance
const db = admin.firestore();

// ✅ Helper: Get current New York time as "H:MM am/pm"
const getNewYorkTimeString = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Example output: "9:05 PM" → we’ll lower-case "pm"
  return formatter.format(now).toLowerCase(); // "9:05 pm"
};

// ✅ Discord Alert Function
const sendDiscordAlert = async (name, level) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  const nyTime = getNewYorkTimeString();

  const message = {
    content:
      `**Critical Level Hit**\n\n` +
      `Pair: **${name}**\n` +
      `Level: **${level}**\n` +
      `Time Now (NY): **${nyTime}**`,
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    console.log("✅ Discord alert sent!");
  } catch (error) {
    console.error("❌ Failed to send Discord alert:", error);
  }
};

// ✅ Main API Handler (For Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Expecting ONLY: name, level
    const { name, level } = req.body;

    if (!name || !level) {
      return res.status(400).json({
        success: false,
        message: 'Missing name or level.',
      });
    }

    try {
      // You can optionally also store NY time string if you want
      const nyTime = getNewYorkTimeString();

      const docRef = await db.collection('webhooks').add({
        name,
        level,
        nyTime, // optional, but nice if you want to show it in the UI
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send Discord alert with NY time
      await sendDiscordAlert(name, level);

      return res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      console.error('❌ Error storing webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error.',
      });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
