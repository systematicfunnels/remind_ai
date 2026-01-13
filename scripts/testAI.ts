import dotenv from 'dotenv';
import { unifiedParseIntent } from '../services/aiService';

dotenv.config();

const testMessages = [
  { msg: 'Remind me to buy milk tomorrow at 10am', expected: 'CREATE' },
  { msg: 'list my reminders', expected: 'LIST' },
  { msg: 'I am done with the milk task', expected: 'DONE' },
  { msg: 'show all tasks', expected: 'LIST' },
  { msg: 'mark as complete', expected: 'DONE' },
  { msg: 'remind me in 5 minutes to call mom', expected: 'CREATE' }
];

async function runTests() {
  console.log('🚀 Starting AI Pipeline Tests...\n');
  
  for (const { msg, expected } of testMessages) {
    try {
      const result = await unifiedParseIntent(msg);
      const success = result.intent === expected;
      
      console.log(`${success ? '✅' : '❌'} Input: "${msg}"`);
      console.log(`   Expected: ${expected}, Got: ${result.intent}`);
      if (result.intent === 'CREATE') {
        console.log(`   Task: ${result.task}, Time: ${result.time}`);
      }
      console.log('---');
    } catch (error) {
      console.error(`❌ Error testing "${msg}"`);
    }
  }
  
  console.log('\n✨ Tests completed.');
}

runTests();
