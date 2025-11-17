// ✅ Enhanced Webhook API with Discord Image Generation
import admin from 'firebase-admin';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { generateDiscordCardImage } from './imageGenerator.js';

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

// ✅ Enhanced Discord Alert Function with Image
const sendDiscordImageAlert = async (name, level, timestamp) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('❌ DISCORD_WEBHOOK_URL is not set');
    return;
  }

  try {
    console.log('🎨 Generating card image for Discord...');
    
    // Generate the beautiful card image
    const imageBuffer = await generateDiscordCardImage({
      name,
      level,
      timestamp
    });

    console.log('✅ Card image generated successfully');

    // Create form data for Discord webhook with image attachment
    const form = new FormData();
    
    // Add the image as an attachment
    form.append('file', imageBuffer, {
      filename: `liquidity-alert-${name}-${Date.now()}.png`,
      contentType: 'image/png'
    });

    // Add the message content (optional text alongside image)
    const messageContent = {
      content: `🚨 **LIQUIDITY ALERT** - ${name} hit ${level}`,
      embeds: [{
        title: "💎 Liquidity Terminal Alert",
        description: `**${name}** has reached **${level}** level`,
        color: getLevelColor(level),
        timestamp: new Date(timestamp).toISOString(),
        footer: {
          text: "Liquidity Terminal • Real-time US Futures monitoring"
        }
      }]
    };

    form.append('payload_json', JSON.stringify(messageContent));

    // Send to Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    if (response.ok) {
      console.log('✅ Discord image alert sent successfully!');
    } else {
      console.error('❌ Discord webhook failed:', response.status, await response.text());
    }
    
  } catch (error) {
    console.error('❌ Failed to send Discord image alert:', error);
    
    // Fallback to text alert if image generation fails
    console.log('📝 Sending fallback text alert...');
    await sendFallbackTextAlert(name, level);
  }
};

// ✅ Fallback text alert if image generation fails
const sendFallbackTextAlert = async (name, level) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const nyTime = getNewYorkTimeString();

  const content = [
    '\u26a0\ufe0f **Critical Level Hit**',
    '',
    `Pair: **${name}**`,
    `Level: **${level}**`,
    `Time (NY): **${nyTime}**`,
  ].join('\n');

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    console.log('✅ Fallback text alert sent');
  } catch (error) {
    console.error('❌ Fallback text alert also failed:', error);
  }
};

// ✅ Helper: Get Discord embed color based on level
const getLevelColor = (level) => {
  const colors = {
    "ASIA HIGH": 0xf97316, // Orange
    "ASIA LOW": 0xf97316, // Orange
    "ASIA H": 0xf97316, // Orange  
    "ASIA L": 0xf97316, // Orange
    "LONDON HIGH": 0xef4444, // Red
    "LONDON LOW": 0xef4444, // Red
    "LONDON H": 0xef4444, // Red
    "LONDON L": 0xef4444, // Red
    "PDH": 0x6b7280, // Grey
    "PDL": 0x6b7280, // Grey
    "PWH": 0x10b981, // Green
    "PWL": 0x10b981, // Green
  };
  
  return colors[level.toUpperCase()] || 0x6b7280; // Default grey
};

// ✅ Main API Handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Expecting: name, level
  const { name, level } = req.body;

  if (!name || !level) {
    return res.status(400).json({
      success: false,
      message: 'Missing name or level.',
    });
  }

  try {
    console.log(`📊 Processing liquidity alert: ${name} - ${level}`);
    
    // Store in Firestore with server timestamp
    const docRef = await db.collection('webhooks').add({
      name,
      level,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Alert stored in Firestore');

    // Get the actual timestamp for image generation
    const timestamp = Date.now();

    // Send enhanced Discord alert with beautiful card image
    await sendDiscordImageAlert(name, level, timestamp);

    return res.status(200).json({ 
      success: true, 
      id: docRef.id,
      message: 'Alert processed and image sent to Discord'
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error.',
    });
  }
}
