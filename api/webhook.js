import admin from 'firebase-admin';
import fetch from 'node-fetch'; // Add this if not already available in your environment

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Discord Alert Function
const sendDiscordAlert = async (name, level, exchange) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  const message = {
    content: `🚨 **Liquidity Event** 🚨\n**Pair:** ${name}\n**Level:** ${level}\n**Exchange:** ${exchange}\n\n📌 *Tip: Open the pair and look for reversal signs after liquidity sweep and IFVG confirmation.*`,
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    console.log("✅ Discord alert sent!");
  } catch (err) {
    console.error("❌ Failed to send Discord alert:", err);
  }
};


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, level } = req.body;

    if (!name || !level) {
      return res.status(400).json({ success: false, message: 'Missing name or level.' });
    }

    try {
      await db.collection('webhooks').add({
        name,
        level,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ✅ Only send Discord alert after Firestore save succeeds
      await sendDiscordAlert(data.name, data.level, data.Exchange);

      return res.status(200).json({ success: true, message: 'Webhook stored and Discord alert sent.' });
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
