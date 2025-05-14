// ✅ Import Dependencies
import admin from 'firebase-admin'; // Firebase Admin SDK for interacting with Firestore
import fetch from 'node-fetch';    // Used to send HTTP requests (for Discord Webhook alerts)

// ✅ Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  // Parse the Firebase service account JSON from environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  // Initialize Firebase with admin privileges
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Create a Firestore Database Instance
const db = admin.firestore();

// ✅ Discord Alert Function
const sendDiscordAlert = async (name, level, exchange) => {
  // Get the Discord Webhook URL from environment variables
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  // Construct the message payload in Discord's expected format
  const message = {
    content: `:money_mouth: **Liquidity Event** :money_mouth: \n\n` +
             `Pair:** ${name}**\n` +
             `Level:** ${level}**\n` +
             `Exchange:** ${exchange}**\n\n` +
             `📌 *Tip: Open the pair and look for reversal signs after liquidity sweep.*\n` +
             `Step 1: IFVG confirmation\n` +
             `Step 2: High Volume\n` +
             `Step 3: FVG Overlapping IFVG\n` +
             `Step 4: Break Even at 1:1*`,
  };

  try {
    // Send POST request to Discord webhook
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    console.log("✅ Discord alert sent!");
  } catch (error) {
    // Handle any errors sending the alert
    console.error("❌ Failed to send Discord alert:", error);
  }
};

// ✅ Main API Handler (For Vercel Serverless Function)
export default async function handler(req, res) {
  // Only accept POST requests (reject GET, PUT, etc.)
  if (req.method === 'POST') {
    // Extract values from the incoming webhook request body
    const { name, level, exchange } = req.body;

    // Validate required fields are present
    if (!name || !level || !exchange) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing name, level, or exchange.' 
      });
    }

    try {
      // Store the incoming webhook data into Firestore
      const docRef = await db.collection('webhooks').add({
        name,
        level,
        exchange, // Use lowercase to keep it consistent
        timestamp: admin.firestore.FieldValue.serverTimestamp(), // Firestore server timestamp
      });

      // After saving, trigger the Discord alert
      await sendDiscordAlert(name, level, exchange);

      // Respond to TradingView confirming success and return Firestore document ID
      return res.status(200).json({ success: true, id: docRef.id });

    } catch (error) {
      // Handle Firestore write errors
      console.error('❌ Error storing webhook:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error.' 
      });
    }

  } else {
    // If method is not POST, respond with Method Not Allowed
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
