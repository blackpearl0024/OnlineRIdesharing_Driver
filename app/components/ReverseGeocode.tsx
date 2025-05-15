// components/ReverseGeocode.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ReverseGeocodeProps {
  lat: number;
  lon: number;
}

const ReverseGeocode = ({ lat, lon }: ReverseGeocodeProps) => {
  const [address, setAddress] = useState<string>('Loading...');

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get(
          `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`
        );
        const place = response.data.features[0];
        if (place) {
          const props = place.properties;
          const readable = `${props.name || ''}, ${props.city || props.county || ''}, ${props.country || ''}`;
          setAddress(readable);
        } else {
          setAddress('Unknown location');
        }
      } catch (error) {
        setAddress('Error fetching address');
        console.error('Reverse geocode failed:', error);
      }
    };

    fetchAddress();
  }, [lat, lon]);

  return <span>{address}</span>;
};

export default ReverseGeocode;
