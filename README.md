# 💎 Liquidity Screener

A real-time trading liquidity level monitoring system that receives alerts from TradingView, displays them on a beautiful web dashboard, and sends notifications to Discord.

![Liquidity Terminal](https://img.shields.io/badge/Status-Live-success)
![Version](https://img.shields.io/badge/Version-2.0-blue)

---

## 🚀 Features

- **Real-time Dashboard**: Beautiful trading terminal displaying liquidity level alerts
- **TradingView Integration**: Webhook API receives alerts from TradingView
- **Discord Notifications**: Clean, color-coded text embeds sent to Discord
- **Firestore Database**: All alerts stored and synced in real-time
- **Live Updates**: Cards appear instantly on the dashboard via Firestore listeners
- **Color-Coded Levels**: Visual distinction for Asia High/Low, London High/Low, PDH/PDL, PWH/PWL
- **Responsive Design**: Works on desktop and mobile

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Firebase Client SDK (Firestore real-time listeners)
- Tailwind CSS

**Backend:**
- Vercel Serverless Functions
- Firebase Admin SDK
- Discord Webhook API

**Database:**
- Google Cloud Firestore

**Deployment:**
- Vercel (auto-deploy from GitHub)

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account with Firestore enabled
- Vercel account
- Discord server with webhook access
- TradingView account (for alerts)

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/bennytrades/liquidity-screener.git
cd liquidity-screener
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Firestore Database**
4. Go to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key** → Download JSON
6. Go to **Project Settings** → **General** → Your apps → Web app
7. Copy your Firebase config values

### 4. Configure Environment Variables

Create a `.env` file (for local development):

```env
# Firebase Frontend (Public - Safe to expose)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Backend (Secret - Keep private)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
```

**Update `src/firebaseConfig.ts`** with your frontend values:

```typescript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
};
```

### 5. Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alerts/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 6. Local Development

```bash
npm run dev
```

Visit: `http://localhost:5173`

---

## 🚀 Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin master
```

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration

### 3. Add Environment Variables in Vercel

Go to: **Project Settings** → **Environment Variables**

Add these variables (for Production, Preview, Development):

```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
DISCORD_WEBHOOK_URL
```

### 4. Deploy

Click **Deploy** - Vercel will build and deploy automatically!

Your webhook URL will be:
```
https://your-project.vercel.app/api/webhook
```

---

## 📡 TradingView Setup

### 1. Create Alert in TradingView

1. Right-click on chart → **Add Alert**
2. Set your conditions (e.g., price crosses level)
3. In **Alert actions**, check **Webhook URL**

### 2. Configure Webhook

**Webhook URL:**
```
https://your-project.vercel.app/api/webhook
```

**Message (JSON format):**
```json
{
  "name": "{{ticker}}",
  "level": "ASIA HIGH"
}
```

**Supported Levels:**
- `ASIA HIGH` / `ASIA LOW` (Orange 🟠)
- `LONDON HIGH` / `LONDON LOW` (Red 🔴)
- `PDH` / `PDL` (Grey ⚪)
- `PWH` / `PWL` (Green 🟢)

**Optional: Add exchange**
```json
{
  "name": "{{ticker}}",
  "level": "ASIA HIGH",
  "exchange": "{{exchange}}"
}
```

### 3. Test Alert

Click **Test** in TradingView to send a test webhook!

---

## 🎨 Discord Setup

### 1. Create Webhook in Discord

1. Go to your Discord server
2. Server Settings → Integrations → Webhooks
3. Click **New Webhook**
4. Name it (e.g., "Liquidity Alerts")
5. Select channel
6. **Copy Webhook URL**

### 2. Add to Vercel

Paste the webhook URL as `DISCORD_WEBHOOK_URL` environment variable in Vercel.

### 3. Alert Format

Discord will receive clean embeds like:

```
🟠 ESUSD HIT ASIA HIGH

Level: ASIA HIGH
Time: Nov 24, 2024, 09:45:30 PM

────────────────────
Liquidity Level Alert
```

---

## 📊 How It Works

```
┌─────────────────┐
│  TradingView    │ → Sends JSON alert
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vercel Webhook  │ → Processes alert
│   (Serverless)  │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│   Firestore     │  │     Discord     │
│   (Database)    │  │  (Notification) │
└────────┬────────┘  └─────────────────┘
         │
         ▼
┌─────────────────┐
│  React Website  │ → Real-time updates
│  (Dashboard)    │
└─────────────────┘
```

---

## 📁 Project Structure

```
liquidity-screener/
├── api/
│   └── webhook.js              # Serverless function (webhook handler)
├── src/
│   ├── components/
│   │   └── EnhancedTradingDashboard.jsx  # Main dashboard component
│   ├── firebaseConfig.ts       # Firebase client config
│   ├── App.tsx                 # Root component
│   └── index.tsx               # Entry point
├── public/                     # Static assets
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vercel.json                 # Vercel configuration
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
```

---

## 🔐 Security Notes

- **Frontend Firebase Config**: Safe to expose (API keys are restricted by Firebase security rules)
- **Backend Service Account**: Keep private! Never commit to Git
- **Environment Variables**: Use Vercel's environment variables for secrets
- **Firestore Rules**: Currently open for simplicity - consider adding authentication for production

---

## 🐛 Troubleshooting

### Webhook Not Receiving Alerts

1. Check TradingView alert is active
2. Verify webhook URL is correct: `https://your-project.vercel.app/api/webhook`
3. Check Vercel function logs: **Vercel Dashboard** → **Logs** → **Functions**

### Cards Not Showing on Website

1. Check browser console (F12) for errors
2. Verify Firebase config in `src/firebaseConfig.ts` has real values
3. Check Firestore rules allow reads
4. Verify data exists in Firestore: **Firebase Console** → **Firestore Database** → `alerts` collection

### Discord Not Receiving Notifications

1. Verify `DISCORD_WEBHOOK_URL` is set in Vercel
2. Test webhook URL in browser or with curl
3. Check Discord webhook is active and not deleted

### Build Failures

1. Clear Vercel cache: **Deployments** → **...** → **Redeploy** (uncheck cache)
2. Check for TypeScript errors
3. Verify `index.html` is in root directory

---

## 🎯 Features Roadmap

- [ ] Add authentication (Firebase Auth)
- [ ] Add alert filtering/search
- [ ] Export alerts to CSV
- [ ] Historical data charts
- [ ] Multiple Discord channels per level type
- [ ] Email notifications
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/bennytrades/liquidity-screener/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bennytrades/liquidity-screener/discussions)

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [Vercel](https://vercel.com/)
- [TradingView](https://www.tradingview.com/)
- [Discord](https://discord.com/)

---

**Made with ❤️ by bennytrades**

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Add+Your+Dashboard+Screenshot)

### Discord Alert
![Discord Alert](https://via.placeholder.com/400x300?text=Add+Your+Discord+Screenshot)

---

## ⚡ Quick Start Commands

```bash
# Clone and install
git clone https://github.com/bennytrades/liquidity-screener.git
cd liquidity-screener
npm install

# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Live Demo**: [https://liquidity-screener.vercel.app](https://liquidity-screener.vercel.app)

**API Endpoint**: `https://liquidity-screener.vercel.app/api/webhook`
