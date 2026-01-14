
// Native fetch is available in Node 18+

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/telegram';
const SECRET_TOKEN = 'test-secret-token'; // This should match TELEGRAM_SECRET_TOKEN in .env

async function simulateTelegramMessage() {
  const payload = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: 12345,
        is_bot: false,
        first_name: 'Test',
        username: 'testuser'
      },
      chat: {
        id: 12345,
        first_name: 'Test',
        username: 'testuser',
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: 'remind me to buy groceries tomorrow at 10am'
    }
  };

  console.log('🚀 Simulating Telegram Message...');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Bot-Api-Secret-Token': SECRET_TOKEN
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('✅ Response Status:', response.status);
    console.log('📦 Response Data:', data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error simulating message:', errorMessage);
    console.log('Note: Ensure the local server is running at http://localhost:3000');
  }
}

simulateTelegramMessage();
