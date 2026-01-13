import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendDirectMessage } from '@/lib/queue';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  // Verify Signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Handle successful payment
  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const payment = event.payload.payment.entity;
    const phoneId = payment.notes.phone_id; // We assume phone_id is passed in notes

    if (phoneId) {
      try {
        const user = await prisma.user.update({
          where: { phone_id: phoneId },
          data: { 
            sub_status: 'paid',
            payment_id: payment.id 
          },
        });

        // Send success message to user
        await sendDirectMessage(
          phoneId, 
          user.channel || 'whatsapp', 
          "✅ Payment Successful! Your RemindAI account has been upgraded to Premium. Enjoy unlimited reminders! 🚀"
        );
      } catch (error) {
        console.error('Error updating sub_status with Prisma:', error);
      }
    }
  }

  return NextResponse.json({ success: true });
}
