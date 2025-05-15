// app/api/payment/success/route.ts
import { NextResponse } from 'next/server';
import connectMongodb from '@/lib/mongodb'

import Wallet from '@/models/Wallet';
import Payment from '@/models/Payment';

export async function POST(req: Request) {
  await connectMongodb();

  try {
    const { orderId, paymentId, signature } = await req.json();

    // Verify payment with Razorpay if needed

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentId,
        signature,
        status: 'success',
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Deduct from rider's wallet
    await Wallet.findOneAndUpdate(
      { userId: payment.riderId },
      { $inc: { balance: -payment.amount } }
    );

    // Add to driver's wallet
    await Wallet.findOneAndUpdate(
      { userId: payment.driverId },
      { $inc: { balance: payment.amount } },
      { upsert: true } // Create wallet if doesn't exist
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment success error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment success' },
      { status: 500 }
    );
  }
}