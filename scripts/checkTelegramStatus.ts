
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = `https://api.telegram.org/bot${TOKEN}/getWebhookInfo`;

async function checkWebhook() {
  if (!TOKEN || TOKEN === 'your_telegram_bot_token') {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env');
    return;
  }

  console.log('🔍 Checking Telegram Webhook status...');
  try {
    const response = await fetch(URL);
    const data = await response.json();
    console.log('📦 Webhook Info:', JSON.stringify(data, null, 2));
    
    if (data.ok && data.result.url === '') {
      console.log('\n⚠️ No webhook set! Telegram messages won\'t reach your server.');
      console.log('You need to set a webhook pointing to your public URL.');
    }
  } catch (error) {
    console.error('❌ Error checking webhook:', error);
  }
}

checkWebhook();
