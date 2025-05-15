// app/api/wallet/create/route.ts
import { NextResponse } from 'next/server';
import connectMongodb from '@/lib/mongodb';
import Wallet from '@/models/Wallet';

export async function POST(req: Request) {
  await connectMongodb();

  try {
    const { userId, initialBalance = 0 } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
      return NextResponse.json(
        { 
          error: 'Wallet already exists',
          balance: existingWallet.balance
        },
        { status: 400 }
      );
    }

    // Create new wallet
    const wallet = new Wallet({
      userId,
      balance: initialBalance,
    });

    await wallet.save();

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      message: 'Wallet created successfully'
    });
  } catch (error) {
    console.error('Wallet creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create wallet' },
      { status: 500 }
    );
  }
}