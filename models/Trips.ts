import mongoose, { Schema, Document } from "mongoose";

// Sub-schemas
const LocationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}, { _id: false });

const RiderSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: String, required: true }, // Optionally enum
  previousTrips: { type: [Schema.Types.Mixed], default: [] }
}, { _id: false });

const DriverSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: LocationSchema, required: true },
  rating: { type: String, required: true },
  available: { type: Boolean, required: true },
  completedTrips: { type: [Schema.Types.Mixed], default: [] },
  vehicleType: { type: String, required: true }, // Optionally enum
}, { _id: false });

// Document interface
export interface ITrip extends Document {
  tripId: string;
  rider: {
    _id: string;
    name: string;
    rating: string;
    previousTrips: any[];
  };
  driver: {
    _id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    rating: string;
    available: boolean;
    completedTrips: any[];
    vehicleType: string;
  };
  srcLoc: {
    latitude: number;
    longitude: number;
  };
  dstLoc: {
    latitude: number;
    longitude: number;
  };
  fare: number;
  rating: number;
  status: string;
  driverAccepted: boolean;
  riderEnded: boolean;
  driverEnded: boolean;
  createdAt: Date; // Added this field
  // updatedAt?: Date; // Optional if using timestamps
}

// Main schema
const TripSchema = new Schema<ITrip>({
  tripId: { type: String, required: true },
  rider: { type: RiderSchema, required: true },
  driver: { type: DriverSchema, required: true },
  srcLoc: { type: LocationSchema, required: true },
  dstLoc: { type: LocationSchema, required: true },
  fare: { type: Number, required: true },
  rating: { type: Number, required: true },
  status: { type: String, required: true },
  driverAccepted: { type: Boolean, required: true },
  riderEnded: { type: Boolean, required: true },
  driverEnded: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now } // Explicitly added
}, {
  timestamps: true // This will also add createdAt and updatedAt
});

// Add index for better query performance
TripSchema.index({ createdAt: 1 });
TripSchema.index({ tripId: 1 });

// Export model
export default mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);