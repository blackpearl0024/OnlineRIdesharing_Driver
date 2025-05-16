import { NextResponse } from 'next/server'
import connectMongodb from '@/lib/mongodb'
import Payment, { IPayment } from '@/models/Payment'
import mongoose from 'mongoose';

interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: Date;
  type: 'sent' | 'received';
  counterparty: {
    name: string;
    role: 'driver' | 'rider';
  };
}

export async function GET(req: Request) {
  await connectMongodb()

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Find payments with proper typing
   const payments = await Payment.find({
  $or: [{ riderId: userId }, { driverId: userId }]
})
  .sort({ createdAt: -1 })
  .lean<(IPayment & { _id: mongoose.Types.ObjectId })[]>() // correct typing for array

const formattedPayments: PaymentResponse[] = payments.map(payment => ({
  id: payment._id.toString(),
  amount: payment.amount,
  currency: payment.currency,
  status: payment.status,
  date: payment.createdAt,
  type: payment.riderId === userId ? 'sent' : 'received',
  counterparty: {
    name: payment.riderId === userId ? payment.driverName : payment.riderName,
    role: payment.riderId === userId ? 'driver' : 'rider'
  }
}))


    return NextResponse.json({ payments: formattedPayments })
  } catch (error) {
    console.error('Payment history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    )
  }
}