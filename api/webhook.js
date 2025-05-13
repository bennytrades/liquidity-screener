export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, level } = req.body;

    console.log(`📡 Received webhook: ${name} hit ${level}`);

    return res.status(200).json({ success: true, message: "Webhook received" });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
