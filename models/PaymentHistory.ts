import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  payerId: { type: String, required: true },
  payerName: { type: String, required: true },
  payeeId: { type: String, required: true },
  payeeName: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.PaymentHistory || mongoose.model('PaymentHistory', paymentHistorySchema);