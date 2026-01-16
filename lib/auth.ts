import { NextRequest } from 'next/server';

/**
 * Validates the API Secret from the request headers
 * Used to protect atomic orchestration endpoints for n8n
 */
export function isValidApiRequest(req: NextRequest): boolean {
  const secret = req.headers.get('x-api-secret');
  const expectedSecret = process.env.API_SECRET;

  if (!expectedSecret) {
    console.error('API_SECRET is not defined in environment variables');
    return false;
  }

  return secret === expectedSecret;
}
