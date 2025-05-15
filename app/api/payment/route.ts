// // app/api/payment/route.ts
// import { NextResponse } from 'next/server';
// import Razorpay from 'razorpay';
// import connectMongodb from '@/lib/mongodb'

// import Wallet from '@/models/Wallet';
// import Payment from '@/models/Payment';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST(req: Request) {
//   await connectMongodb();

//   try {
//     const { fare, driverId, driverName, riderId, riderName } = await req.json();

//     // Check rider's wallet balance
//     const riderWallet = await Wallet.findOne({ userId: riderId });
//     if (!riderWallet || riderWallet.balance < fare) {
//       return NextResponse.json(
//         { error: 'Insufficient balance in wallet' },
//         { status: 400 }
//       );
//     }

//     // Create Razorpay order
//     const options = {
//       amount: fare * 100,
//       currency: 'INR',
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);

//     // Create payment record in database
//     const payment = new Payment({
//       orderId: order.id,
//       amount: fare,
//       currency: 'INR',
//       riderId,
//       riderName,
//       driverId,
//       driverName,
//       status: 'created',
//     });
//     await payment.save();

//     return NextResponse.json(order);
//   } catch (error) {
//     console.error('Payment error:', error);
//     return NextResponse.json(
//       { error: 'Failed to create payment order' },
//       { status: 500 }
//     );
//   }
// }