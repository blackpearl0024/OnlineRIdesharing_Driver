'use client';

import { useEffect, useState } from 'react';
import AutocompleteAddress from './AutocompleteAddress';

import Link from 'next/link';
import RecentTripsList from '../RecentTripsList';
import RecentPaymentsList from '../RecentPaymentsList';

const Booking = ({ fromLocation, setFromLocation }: any) => {
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    // This code runs only in the browser
    setScreenHeight(window.innerHeight);
  }, []);

  return (
    <div className="p-4 h-full flex flex-col gap-6">
      {/* Booking Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Booking</h2>
        <div className="border-[1px] p-5 rounded-md">
          <AutocompleteAddress
            label="Where from?"
            value={fromLocation}
            onChange={setFromLocation}
          />
        </div>
      </div>

      {/* Recent Trips Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Trips</h2>
          <Link 
            href="/history" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            See all
          </Link>
        </div>
        <RecentTripsList />
      </div>

      {/* Payment History Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
          <Link 
            href="/payments" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            See all
          </Link>
        </div>
        <RecentPaymentsList />
      </div>
    </div>
  );
};

export default Booking;