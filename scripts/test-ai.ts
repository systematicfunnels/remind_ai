import dotenv from 'dotenv';
import { unifiedParseIntent } from '../services/aiService.js';

dotenv.config();

const testCases = [
  { text: "tomorrow morning 10am i have meeting", tz: "Asia/Kolkata" },
  { text: "remind me in 5 minutes to call mom", tz: "Asia/Kolkata" },
  { text: "remind me at 9pm to take medicine", tz: "America/New_York" }
];

async function runTests() {
  console.log("🚀 Starting AI Pipeline Verification with Timezones...\n");
  
  const systemNow = new Date();
  console.log(`💻 System Time (UTC): ${systemNow.toISOString()}`);
  console.log(`📅 System Date: ${systemNow.toDateString()}\n`);
  
  for (const { text, tz } of testCases) {
    const userNowStr = systemNow.toLocaleString('en-US', { timeZone: tz });
    console.log(`📝 Testing: "${text}"`);
    console.log(`🌍 User Timezone: ${tz}`);
    console.log(`🕒 User Current Time: ${userNowStr}`);
    try {
      const start = Date.now();
      const result = await unifiedParseIntent(text, tz);
      const duration = Date.now() - start;
      
      console.log(`✅ Result:`, JSON.stringify(result, null, 2));
      if (result.time) {
        const localTime = new Date(result.time).toLocaleString('en-US', { timeZone: tz });
        console.log(`🕒 Calculated Local Time: ${localTime}`);
      }
      console.log(`⏱️ Duration: ${duration}ms\n`);
    } catch (error) {
      console.error(`❌ Failed:`, error);
    }
  }
}

runTests();
