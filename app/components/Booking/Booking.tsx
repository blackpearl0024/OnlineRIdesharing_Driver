'use client';

import { useEffect, useState } from 'react';
import AutocompleteAddress from './AutocompleteAddress';

const Booking = ({ fromLocation, setFromLocation }: any) => {
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    // This code runs only in the browser
    setScreenHeight(window.innerHeight);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Booking</h2>
      <div className="border-[1px] p-5 rounded-md" style={{ height: screenHeight }}>
        <AutocompleteAddress
          label="Where from?"
          value={fromLocation}
          onChange={setFromLocation}
        />
      
      </div>
    </div>
  );
};

export default Booking;
