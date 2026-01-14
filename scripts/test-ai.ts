import dotenv from 'dotenv';
import { unifiedParseIntent } from '../services/aiService';

dotenv.config();

const testCases = [
  "Remind me to call Mom in 5 minutes"
];

async function runTests() {
  console.log("🚀 Starting AI Pipeline Verification...\n");
  
  for (const text of testCases) {
    console.log(`📝 Testing: "${text}"`);
    try {
      const start = Date.now();
      const result = await unifiedParseIntent(text);
      const duration = Date.now() - start;
      
      console.log(`✅ Result:`, JSON.stringify(result, null, 2));
      console.log(`⏱️ Duration: ${duration}ms\n`);
    } catch (error) {
      console.error(`❌ Failed:`, error);
    }
  }
}

runTests();
