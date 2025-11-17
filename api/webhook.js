// ✅ Import Dependencies
import admin from 'firebase-admin';
import fetch from 'node-fetch';

// ✅ Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

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

  return formatter.format(now).toLowerCase(); // e.g. "9:05 pm"
};

// ✅ Discord Alert Function
const sendDiscordAlert = async (name, level) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('❌ DISCORD_WEBHOOK_URL is not set');
    return;
  }

  const nyTime = getNewYorkTimeString();

  const content = [
    '\u26a0\ufe0f **Critical Level Hit**', // ⚠️
    '',
    `Pair: **${name}**`,
    `Level: **${level}**`,
    `Time Now (NY): **${nyTime}**`,
  ].join('\n');

  const message = { content };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    console.log('✅ Discord alert sent!');
  } catch (error) {
    console.error('❌ Failed to send Discord alert:', error);
  }
};

// ✅ Main API Handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Expecting ONLY: name, level
  const { name, level } = req.body;

  if (!name || !level) {
    return res.status(400).json({
      success: false,
      message: 'Missing name or level.',
    });
  }

  try {
    const nyTime = getNewYorkTimeString();

    const docRef = await db.collection('webhooks').add({
      name,
      level,
      nyTime, // stored as string if you want it in the UI
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    await sendDiscordAlert(name, level);

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('❌ Error storing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error.',
    });
  }
}
