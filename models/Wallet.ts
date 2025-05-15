import mongoose, {  Schema, model, Document,models  } from "mongoose";



interface IWallet extends Document {
  userId: string;
  balance: number;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});
// ✅ Prevent model overwrite error
// const Wallet = models.Wallet || model<IWallet>('Wallet', WalletSchema);
// export default Wallet;

export default mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);
