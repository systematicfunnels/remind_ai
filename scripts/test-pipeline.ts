import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const API_SECRET = process.env.API_SECRET || 'RemindAI_n8n_Secret_2026';
const BACKEND_URL = 'http://localhost:3000';

async function simulatePipeline() {
  console.log('🚀 Starting Full Pipeline Simulation...\n');

  try {
    // 1. Ensure User
    console.log('Step 1: Ensuring user exists...');
    const ensureRes = await fetch(`${BACKEND_URL}/api/users/ensure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': API_SECRET
      },
      body: JSON.stringify({
        phoneId: '123456789',
        channel: 'telegram'
      })
    });
    const userData = await ensureRes.json();
    console.log('✅ User Response:', JSON.stringify(userData, null, 2));

    // 2. Parse Intent
    console.log('\nStep 2: Parsing message intent...');
    const parseRes = await fetch(`${BACKEND_URL}/api/ai/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': API_SECRET
      },
      body: JSON.stringify({
        message: 'Remind me to fix the car tomorrow at 10am',
        timezone: userData.user?.timezone || 'UTC'
      })
    });
    const parseData = await parseRes.json();
    console.log('✅ AI Parse Result:', JSON.stringify(parseData, null, 2));

    // 3. Execute Action
    console.log('\nStep 3: Executing backend action...');
    const actionRes = await fetch(`${BACKEND_URL}/api/reminders/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': API_SECRET
      },
      body: JSON.stringify({
        userId: '123456789',
        intent: parseData.intent,
        task: parseData.task,
        time: parseData.time,
        recurrence: parseData.recurrence,
        timezone: userData.user?.timezone
      })
    });
    const actionData = await actionRes.json();
    console.log('✅ Final Backend Message:', actionData.message);
    console.log('\n✨ Simulation Complete! If this worked, the n8n workflow will work too.');

  } catch (error) {
    console.error('❌ Simulation Failed:', error);
  }
}

simulatePipeline();
