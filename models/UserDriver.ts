import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  phone: string;
  role: "rider" | "driver";
  homeLocation?: string;
  birthday?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  rating?: number;          // ⬅️ Average rating
  totalRating?: number;     // ⬅️ Sum of all ratings
  ratingCount?: number;     // ⬅️ How many ratings received
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  role: { type: String, enum: ["rider", "driver"], required: true },
  homeLocation: String,
  birthday: String,
  vehicleType: { type: String, default: 'BIKE' },
  vehicleNumber: String,
  rating: { type: Number, default: 0 },
  totalRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});


export default mongoose.models.UserDriver || mongoose.model<IUser>("UserDriverImaya", UserSchema);
