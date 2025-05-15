// app/api/payment/history/route.ts
import { NextResponse } from 'next/server';
import connectMongodb from '@/lib/mongodb'
import Payment from '@/models/Payment';

export async function POST(req: Request) {
  await connectMongodb();

  try {
    const { userId, role } = await req.json(); // role can be 'rider' or 'driver'

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const query = role === 'rider' ? { riderId: userId } : { driverId: userId };
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}