// app/api/payment/route.ts
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST() {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const payment = await razorpay.orders.create({
    amount: 50000, // ₹500.00 (Amount is in paise)
    currency: 'INR',
    receipt: 'receipt#1',
  });

  return NextResponse.json({ id: payment.id });
}
