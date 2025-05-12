'use client';
import { useState } from 'react';

export default function RideStatusBox({ status, driverInfo, onEndRide }: any) {
  const [rating, setRating] = useState<number | null>(null);
  const [rated, setRated] = useState(false);

  return (
    <div className="bg-white border border-gray-300 p-6 rounded shadow-md w-full max-w-sm mx-auto">
      {!driverInfo && !rated && (
        <div className="animate-pulse text-blue-600 font-semibold">🔍 Matching driver...</div>
      )}

      {status && <div className="text-sm mt-2 text-gray-700">Status: {status}</div>}

      {driverInfo && !rated && (
        <div className="mt-4 space-y-2">
          <div className="text-green-600 font-medium">✅ Driver matched: {driverInfo.name}</div>
          <div className="text-black">💰 Fare: ${parseFloat(driverInfo.fare).toFixed(2)}</div>
          <button
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onEndRide}
          >
            End Ride
          </button>
        </div>
      )}

      {status === 'Ride Ended' && !rated && (
        <div className="mt-4">
          <h3 className="font-semibold">Rate Your Ride:</h3>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRating(r);
                  setRated(true);
                }}
                className={`p-2 rounded-full ${
                  rating === r ? 'bg-yellow-400' : 'bg-gray-300'
                } hover:bg-yellow-300`}
              >
                {r}⭐
              </button>
            ))}
          </div>
        </div>
      )}

      {rated && (
        <div className="text-green-700 mt-4">
          ✅ Thanks for rating! Ride completed.
        </div>
      )}
    </div>
  );
}
