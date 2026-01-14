import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = "https://remind-ai-m49w.vercel.app/api/webhooks/telegram";
const SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN;

async function setWebhook() {
  if (!TELEGRAM_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing");
    return;
  }
  if (!SECRET_TOKEN) {
    console.error("❌ TELEGRAM_SECRET_TOKEN is missing in .env");
    return;
  }

  console.log(`📡 Setting Webhook to: ${WEBHOOK_URL}`);
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        secret_token: SECRET_TOKEN,
        allowed_updates: ["message"]
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log("✅ Webhook successfully set!");
    } else {
      console.error("❌ Telegram API Error:", data.description);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

setWebhook();
