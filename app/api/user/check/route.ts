// app/api/user/check/route.ts
import { NextResponse } from 'next/server';
import connectMongodb from '@/lib/mongodb';
import User from '@/models/Driver'
import Wallet from '@/models/Wallet';

export async function GET(req: Request) {
  await connectMongodb();

  try {
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get('clerkId');

    if (!clerkId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user profile exists
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json(
        { profileExists: false, walletExists: false },
        { status: 200 }
      );
    }

    // Check if wallet exists
    const wallet = await Wallet.findOne({ userId: clerkId });
    
    return NextResponse.json({
      profileExists: true,
      walletExists: !!wallet,
      userType: user.role
    });
  } catch (error) {
    console.error('Profile check error:', error);
    return NextResponse.json(
      { error: 'Failed to check profile status' },
      { status: 500 }
    );
  }
}