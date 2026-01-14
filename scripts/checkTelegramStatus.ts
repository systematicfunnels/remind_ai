import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function checkStatus() {
  if (!TELEGRAM_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
    return;
  }

  console.log("🔍 Checking Telegram Webhook Status...");
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getWebhookInfo`);
    const data = await response.json();
    
    if (data.ok) {
      console.log("✅ API Connection: OK");
      console.log("---------------------------");
      console.log("Webhook Info:", JSON.stringify(data.result, null, 2));
      console.log("---------------------------");
      
      if (!data.result.url) {
        console.warn("⚠️ Webhook is NOT set! The bot will not receive messages via webhooks.");
      } else {
        console.log(`📡 Webhook URL: ${data.result.url}`);
        if (data.result.last_error_message) {
          console.error(`❌ Last Error: ${data.result.last_error_message}`);
        }
      }
    } else {
      console.error("❌ Telegram API Error:", data.description);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

checkStatus();
