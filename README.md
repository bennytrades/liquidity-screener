# 📈 Liquidity Screener Dashboard

A real-time liquidity screener built with **React**, **Firebase Firestore**, and **Vercel**. This tool helps traders monitor when crypto pairs hit key liquidity levels and instantly receive Discord alerts.  

---

## 🚀 Features

- Real-Time Updates (Firestore onSnapshot listener)  
- Tracks Key Levels: `PDH`, `PDL`, `PWH`, `PWL`, `iHOD`, `iLOD`, `1H LVL`, `4H LVL`, `GAP FILLED`  
- Color-coded Level Badges  
- Discord Alerts on New Events  
- Card Timers Showing Time Since Alert  
- Clean, Responsive UI  
- Ability to Manually Remove (Dismiss) Alerts  

---

## 📚 How It Works

1. **TradingView Webhook Alerts**  
   - You set up alerts in TradingView using this JSON format:
     ```json
     {
       "name": "{{ticker}}",
       "level": "PDH",
       "exchange": "{{exchange}}"
     }
     ```
   - The webhook URL you provide is your deployed Vercel API endpoint:  
     `https://<your-vercel-app>.vercel.app/api/webhook`

2. **Vercel Serverless API**  
   - The API (`api/webhook.js`) receives incoming webhooks and:
     - Stores the alert in Firestore.
     - Sends a Discord message using a configured webhook.

3. **React Frontend**  
   - Hosted on Vercel, connects directly to Firestore to listen for real-time data.
   - Displays liquidity events as cards with time counters.
   - Allows manual deletion of events directly from the dashboard.

4. **Discord Alerts**  
   - Alerts are sent via Discord webhooks in this format:
     ```
     🚨 Liquidity Event  
     Pair: BTCUSDT  
     Level: PDH  
     
     Open the chart and look for reversal signs!
     ```

---

## 📦 Tech Stack

- React (with plain CSS for styling)
- Firebase Firestore (Database & Realtime Updates)
- Vercel (Hosting + Serverless API Functions)
- Discord Webhooks (Notifications)

---

## 🔧 Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/liquidity-screener.git
   cd liquidity-screener
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**  
   Create a `.env` file in the root of your project and include:

   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_id
   FIREBASE_SERVICE_ACCOUNT={"your_service_account_json"}
   ```

4. **Deploy to Vercel**
   - Push your repository to GitHub.
   - Connect the repo to Vercel.
   - Set the above environment variables in Vercel's **Environment Variables** settings.

---

## ✅ Roadmap

- [x] Real-time Webhook Storage  
- [x] Discord Notifications  
- [x] Manual Card Dismissal  
- [x] Color-Coded Liquidity Levels  
- [ ] Push Notifications / Browser Alerts (Optional)  
- [ ] Historical Logs View  

---

## 📬 Contact & Contributions

Have ideas or want to contribute? Open a PR or reach out via Discord!
