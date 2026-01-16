import { prisma } from '../lib/prisma';
import { unifiedParseIntent } from '../services/aiService';
import { startWorker } from '../lib/queue';
import { validateEnv } from '../lib/env';
import { logger } from '../lib/logger';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function verify() {
  logger.info('🔍 Starting Project Readiness Verification...');

  try {
    validateEnv();
    logger.info('✅ Environment variables validated.');
  } catch (error) {
    logger.error('❌ Environment validation failed');
  }

  // 1. Check Database
  try {
    logger.info('📡 Checking Database Connection...');
    await prisma.$connect();
    const userCount = await prisma.user.count();
    logger.info(`✅ Database Connected. Found ${userCount} users.`);
  } catch (error) {
    logger.error('❌ Database Connection Failed', error);
  }

  // 2. Check Redis/BullMQ
  try {
    logger.info('🕒 Checking Redis/Queue Connection...');
    if (!process.env.UPSTASH_REDIS_URL) {
      logger.warn('⚠️ UPSTASH_REDIS_URL missing. Queue will not work.');
    } else {
      startWorker();
      logger.info('✅ Redis/Worker initialized.');
    }
  } catch (error) {
    logger.error('❌ Redis Connection Failed', error);
  }

  // 3. Check Auth/Security
  try {
    logger.info('🔐 Checking Auth & Security...');
    
    // Check Bcrypt
    const testPassword = 'test-password';
    const hash = await bcrypt.hash(testPassword, 10);
    const isMatch = await bcrypt.compare(testPassword, hash);
    if (isMatch) {
      logger.info('✅ Bcrypt hashing is working correctly.');
    } else {
      logger.error('❌ Bcrypt hashing verification failed.');
    }

    // Check Session Secret
    if (process.env.USER_SESSION_SECRET) {
      logger.info('✅ USER_SESSION_SECRET is configured.');
    } else {
      logger.warn('⚠️ USER_SESSION_SECRET is missing. Using default secret (Insecure!).');
    }
  } catch (error) {
    logger.error('❌ Auth check failed', error);
  }

  // 4. Check AI Pipeline
  try {
    logger.info('🤖 Checking AI Intent Parsing...');
    const testMessage = 'remind me to buy milk tomorrow at 9am';
    const result = await unifiedParseIntent(testMessage, 'UTC');
    if (result.intent === 'CREATE') {
      logger.info(`✅ AI Pipeline is working (Intent: ${result.intent}, Task: ${result.task})`);
    } else {
      logger.warn('⚠️ AI Pipeline returned unexpected result', result);
    }
  } catch (error) {
    logger.error('❌ AI Pipeline Failed', error);
  }

  logger.info('🏁 Verification Complete.');
  await prisma.$disconnect();
}

verify().catch(console.error);
