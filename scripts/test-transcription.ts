import dotenv from 'dotenv';
import fs from 'fs';
import { unifiedTranscribe } from '../services/voiceService';

dotenv.config();

async function testTranscription() {
  console.log("🎙️ Testing Voice Transcription Pipeline...\n");

  // Check if we have an audio file to test with
  // For this test, we'll try to find any .ogg or .mp3 file in the project or create a dummy buffer
  // Since we don't have a real audio file, we'll use a dummy one to at least test the API connection
  const dummyBuffer = Buffer.from("dummy audio content");
  
  console.log("🧪 Test 1: Unified Transcription with dummy buffer");
  try {
    const result = await unifiedTranscribe(dummyBuffer, 'audio/ogg');
    console.log("✅ Transcription Result:", result);
  } catch (error) {
    console.error("❌ Transcription Failed:", error);
  }
}

testTranscription();
