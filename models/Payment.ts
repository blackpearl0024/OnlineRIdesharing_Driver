// models/Payment.ts
import mongoose, {  Schema, model, Document,models  } from "mongoose";

interface IPayment extends Document {
  orderId?: string;
  paymentId?: string;
  amount: number;
  currency: string;
  riderId: string;
  riderName: string;
  driverId: string;
  driverName: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod?: 'wallet' | 'razorpay' | 'card' | 'upi';
  signature?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String },
    paymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    riderId: { type: String, required: true },
    riderName: { type: String, required: true },
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'razorpay', 'card', 'upi'],
    },
    signature: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
