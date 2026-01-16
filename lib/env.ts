import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  UPSTASH_REDIS_URL: z.string().url(),
  ADMIN_SECRET: z.string().min(8),
  API_SECRET: z.string().min(8),
  USER_SESSION_SECRET: z.string().optional(),
  RAZORPAY_CHECKOUT_LINK: z.string().optional(),
  
  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  
  // Platforms
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_SECRET_TOKEN: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
  WHATSAPP_WEBHOOK_URL: z.string().url().optional(),
  
  // Payments
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const validateEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
};

export const env = process.env as unknown as z.infer<typeof envSchema>;
