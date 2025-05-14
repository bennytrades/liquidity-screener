import { db } from "../../firebaseConfig"; // Adjust path if needed
import { collection, addDoc } from "firebase/firestore";

// ✅ Discord Alert Function
const sendDiscordAlert = async (pair, level) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL; // Prefer using Vercel Env Variable for security

  const message = {
    content: `🚨 **New Liquidity Event**\nPair: **${pair}**\nLevel: **${level}**`
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

// ✅ Webhook API Handler
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const data = req.body;

      if (!data.pair || !data.level) {
        return res.status(400).json({ error: "Missing 'pair' or 'level' in payload." });
      }

      // Store in Firestore
      const docRef = await addDoc(collection(db, "webhooks"), {
        name: data.pair,
        level: data.level,
        timestamp: new Date(),
      });

      // Send Discord Notification after saving
      await sendDiscordAlert(data.pair, data.level);

      return res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      console.error("❌ Error handling webhook:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
