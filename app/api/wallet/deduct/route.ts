// app/api/wallet/deduct/route.ts
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

    const wallet = await Wallet.findOne({ userId });

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: -amount } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      newBalance: updatedWallet.balance
    });
  } catch (error) {
    console.error('Deduct money error:', error);
    return NextResponse.json(
      { error: 'Failed to deduct money from wallet' },
      { status: 500 }
    );
  }
}