// app/api/payment/record/route.ts
import { NextResponse } from 'next/server';
import connectMongodb from '@/lib/mongodb';
import Payment from '@/models/Payment';

export async function POST(req: Request) {
  await connectMongodb();

  try {
    const {
      fare,
      driverId,
      driverName,
      riderId,
      riderName,
      status,
      paymentMethod,
      transactionId
    } = await req.json();

    // Validate required fields
    if (!fare || !driverId || !driverName || !riderId || !riderName || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create complete payment record
    const paymentData = {
      amount: fare,
      currency: 'INR',
      driverId,
      driverName,
      riderId,
      riderName,
      status: status || 'success',
      paymentMethod: paymentMethod || 'razorpay',
      paymentId: transactionId,
      completedAt: new Date(),
    };

    const payment = new Payment(paymentData);
    await payment.save();

    return NextResponse.json({
      success: true,
      paymentId: payment._id,
      amount: payment.amount,
      status: payment.status,
    });

  } catch (error: any) {
    console.error('Payment recording error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment record',
        details: error.message 
      },
      { status: 500 }
    );
  }
}