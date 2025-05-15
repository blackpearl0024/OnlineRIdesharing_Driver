// app/api/wallet/balance/route.ts
import { NextResponse } from 'next/server';
import connectMongodb from '@/lib/mongodb'

import Wallet from '@/models/Wallet';

export async function POST(req: Request) {
  await connectMongodb();

  try {
    const { userId } = await req.json();

    const wallet = await Wallet.findOne({ userId });
    const balance = wallet?.balance || 0;

    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    );
  }
}