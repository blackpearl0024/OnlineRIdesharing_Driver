import { useEffect, useRef, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

type TrafficLevel = 'low' | 'medium' | 'high';

interface Segment {
  coords: [number, number][];
  traffic: TrafficLevel;
}

const getSpeedMultiplier = (level: TrafficLevel): number => {
  switch (level) {
    case 'high': return 0.3;
    case 'medium': return 0.6;
    case 'low': return 1;
    default: return 1;
  }
};

const MovingMarker = ({ segments }: { segments: Segment[] }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const indexRef = useRef(0);  const map = useMap();

  useEffect(() => {
    if (segments.length === 0) return;

    let i = 0;
    let j = 0;
    const move = () => {
      if (i >= segments.length) return;

      const segment = segments[i];
      const [start, end] = segment.coords;

      setPosition(start);
      j = 0;

      const latStep = (end[0] - start[0]) / 10;
      const lonStep = (end[1] - start[1]) / 10;
      const multiplier = getSpeedMultiplier(segment.traffic);
      const delay = 500 / multiplier;

      const interval = setInterval(() => {
        if (j >= 10) {
          clearInterval(interval);
          i++;
          move();
          return;
        }

        setPosition([
          start[0] + latStep * j,
          start[1] + lonStep * j,
        ]);
        j++;
      }, delay);
    };

    move();
  }, [segments]);

  if (!position) return null;

  return (
    <Marker position={position} icon={L.divIcon({ className: 'custom-marker', html: '🚗', iconSize: [30, 30] })} />
  );
};

export default MovingMarker;
