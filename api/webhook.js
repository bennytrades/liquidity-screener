import admin from 'firebase-admin';
import fetch from 'node-fetch'; // Ensure this is installed or replace with native fetch if using Node 18+

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
    content: `🚨 **Liquidity Event**\n**Pair:** ${name}\n**Level:** ${level}\n**exchange:** ${exchange}\n\n📌 *Tip: Open the pair and look for reversal signs after liquidity sweep and IFVG confirmation.*`,
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

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, level, exchange } = req.body;

    if (!name || !level || !exchange) {
      return res.status(400).json({ success: false, message: 'Missing name, level, or exchange.' });
    }

    try {
      const docRef = await db.collection('webhooks').add({
  name,
  level,
  exchange,  // Use the lowercase version here
  timestamp: admin.firestore.FieldValue.serverTimestamp(),
});

await sendDiscordAlert(name, level, exchange);


      return res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      console.error('❌ Error storing webhook:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
