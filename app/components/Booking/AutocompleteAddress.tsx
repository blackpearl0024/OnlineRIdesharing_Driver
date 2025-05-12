'use client';

import React, { useState,useEffect } from 'react';
import axios from 'axios';

interface AutocompleteProps {
  label: string;
  value: { lat: number | null; lon: number | null; name: string };
  onChange: (val: { lat: number; lon: number; name: string }) => void;
}

const AutocompleteAddress = ({ label, value, onChange }: AutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [input, setInput] = useState(value.name || '');
  
  useEffect(() => {
    setInput(value.name || ''); // Update input box when value changes (e.g., when pin moves)
  }, [value]); // ✅ Now it updates when the location is changed



  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    if (val.length < 3) return;

    const response = await axios.get(`https://photon.komoot.io/api/?q=${val}`);
    setSuggestions(response.data.features);
  };

  const handleSelect = (place: any) => {
    const name = place.properties.name || place.properties.label;
    const lat = place.geometry.coordinates[1];
    const lon = place.geometry.coordinates[0];
    setInput(name);
    setSuggestions([]);
    onChange({ name, lat, lon });
  };

  return (
    <div className="mb-4 relative">
      <label className="block font-semibold">{label}</label>
      <input
        value={input}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white shadow-md w-full z-10">
          {suggestions.map((place, i) => (
            <li
              key={i}
              onClick={() => handleSelect(place)}
              className="cursor-pointer p-2 hover:bg-gray-100"
            >
              {place.properties.name}, {place.properties.city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteAddress;
