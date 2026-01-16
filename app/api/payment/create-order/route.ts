import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency = 'INR' } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const options = {
      amount: amount * 100, // Amount in smallest currency unit (paise for INR)
      currency,
      receipt: `receipt_user_${user.id}`,
      notes: {
        userId: user.id,
        phone_id: user.phone_id
      }
    };

    const order = await razorpay.orders.create(options);
    
    logger.info('Razorpay order created', { orderId: order.id, userId: user.id });
    
    return NextResponse.json(order);
  } catch (error) {
    logger.error('Razorpay order creation failed', { error });
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
