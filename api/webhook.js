import admin from 'firebase-admin';

const serviceAccount = require('../../apitoken.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, level } = req.body;

    if (!name || !level) {
      return res.status(400).json({ success: false, message: 'Missing name or level in request body.' });
    }

    try {
      await db.collection('webhooks').add({
        name,
        level,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`📡 Stored webhook: ${name} hit ${level}`);
      return res.status(200).json({ success: true, message: 'Webhook stored successfully.' });
    } catch (error) {
      console.error('❌ Error storing webhook:', error);
      return res.status(500).json({ success: false, message: 'Failed to store webhook.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
