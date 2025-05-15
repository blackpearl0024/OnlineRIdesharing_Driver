// app/api/wallet/add/route.ts
import { NextResponse } from 'next/server';
import connectMongodb from '@/lib/mongodb'
import Wallet from '@/models/Wallet';

export async function POST(req: Request) {
  await connectMongodb();

  try {
    const { userId, amount } = await req.json();

    if (!userId || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Add money error:', error);
    return NextResponse.json(
      { error: 'Failed to add money to wallet' },
      { status: 500 }
    );
  }
}