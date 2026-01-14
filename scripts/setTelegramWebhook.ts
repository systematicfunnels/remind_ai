
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET_TOKEN = process.env.TELEGRAM_SECRET_TOKEN || 'test-secret-token';

async function setWebhook() {
  const args = process.argv.slice(2);
  const publicUrl = args[0];

  if (!TOKEN || TOKEN === 'your_telegram_bot_token') {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env');
    return;
  }

  if (!publicUrl) {
    console.error('❌ Please provide your public URL as an argument.');
    console.log('Example: npx tsx scripts/setTelegramWebhook.ts https://your-ngrok-url.ngrok-free.app');
    return;
  }

  // Ensure URL ends with the correct path
  const webhookUrl = `${publicUrl.replace(/\/$/, '')}/api/webhooks/telegram`;
  const setUrl = `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${webhookUrl}&secret_token=${SECRET_TOKEN}`;

  console.log(`🌐 Setting Telegram Webhook to: ${webhookUrl}`);
  
  try {
    const response = await fetch(setUrl);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Success:', data.description);
      console.log('🚀 Your bot is now linked to this URL!');
    } else {
      console.error('❌ Failed to set webhook:', data.description);
    }
  } catch (error) {
    console.error('❌ Error setting webhook:', error);
  }
}

setWebhook();
