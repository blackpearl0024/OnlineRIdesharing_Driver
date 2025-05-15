import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import FitBoundsToRoute from "./FitBoundsToRoute"

const RecenterMap = ({ lat, lon }: { lat: number, lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom());
  }, [lat, lon]);
  return null;
};
type TrafficLevel = 'low' | 'medium' | 'high';

function assignTrafficLevel(): TrafficLevel {
  const random = Math.random();
  if (random < 0.4) return 'low'; // Green
  if (random < 0.75) return 'medium'; // Yellow
  return 'high'; // Red
}
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Function to reverse geocode (convert lat/lon to address)
function reverseGeocode(lat: number, lon: number, cb: (label: string) => void) {
  console.log('📍 Coordinates:', lat, lon);
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    .then((res) => res.json())
    .then((data) => cb(data.display_name || 'Unknown location'))
    .catch(() => cb('Unknown location'));
}

const MapView = ({ fromLocation, riderLocationsrc, onFromDrag, onInitFromLocation,riderLocationdst,rideAccepted }: any) => {
  const center = fromLocation.lat && fromLocation.lon ? [fromLocation.lat, fromLocation.lon] : [12.9716, 77.5946]; // Default: Bangalore

  const [route, setRoute] = useState<[number, number][]>([]); // Stores the route coordinates
  const [distance, setDistance] = useState<string>(''); // Distance of the route
  const [duration, setDuration] = useState<string>(''); // Travel time
  const [driverRoute, setDriverRoute] = useState<[number, number][]>([]);
const [driverDistance, setDriverDistance] = useState<string>('');
const [driverDuration, setDriverDuration] = useState<string>('');
const [segmentedRoute, setSegmentedRoute] = useState<{ coords: [number, number][]; traffic: TrafficLevel }[]>([]);
  const [movingMarkerIndex, setMovingMarkerIndex] = useState<number>(0);
  const [simulatedTimeLeft, setSimulatedTimeLeft] = useState<string>('');
console.log("riderLocationsrc in Map:", riderLocationsrc);

useEffect(() => {
  if (riderLocationsrc) {
    console.log("Updated rider src from Mapview:", riderLocationsrc.lat, riderLocationsrc.lon);
  }


 
}, [riderLocationsrc]);
useEffect(() => {


  if (riderLocationdst) {
    console.log("Updated rider dst from Mapview:", riderLocationdst.lat, riderLocationdst.lon);
  }
}, [riderLocationdst]);

  // 🟢 Fetch User's Current Location
  const screenhight =window.innerHeight*0.7;
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          reverseGeocode(latitude, longitude, (name) => {
            onInitFromLocation({ lat: latitude, lon: longitude, name });
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    } else {
      console.warn('Geolocation not available');
    }
  }, [onInitFromLocation]);

  
  useEffect(() => {
    if (riderLocationsrc?.lat && fromLocation?.lat) {
      const osrmDriverUrl = `https://router.project-osrm.org/route/v1/driving/${fromLocation.lon},${fromLocation.lat};${riderLocationsrc.lon},${riderLocationsrc.lat}?overview=full&geometries=geojson`;
          // ^ Swapped the order to: driver → rider
      fetch(osrmDriverUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
            setDriverRoute(coords);
            // Segment and assign traffic
            const segments = [];
            for (let i = 0; i < coords.length - 1; i++) {
              segments.push({
                coords: [coords[i], coords[i + 1]],
                traffic: assignTrafficLevel(),
              });
            }
            setSegmentedRoute(segments);
            setMovingMarkerIndex(0); // Reset marker

            setDriverDistance((data.routes[0].distance / 1000).toFixed(2) + ' km');
            setDriverDuration((data.routes[0].duration / 60).toFixed(2) + ' mins');
          }
        })
        .catch((err) => console.error("Error fetching driver-to-source route:", err));
    }
  }, [riderLocationsrc, fromLocation]);

  
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (segmentedRoute.length > 0 && rideAccepted) {
      console.log("inside useeffect that generate moving marker")
      setMovingMarkerIndex(0);
      interval = setInterval(() => {
        setMovingMarkerIndex((prev) => {
          if (prev >= segmentedRoute.length - 1) {
            clearInterval(interval);
            return prev;
          }

          const traffic = segmentedRoute[prev].traffic;
          let delayFactor = 1;
          if (traffic === 'medium') delayFactor = 1.5;
          else if (traffic === 'high') delayFactor = 2;

          const remaining = segmentedRoute.length - prev;
          const estMinutes = (remaining * delayFactor * 0.5).toFixed(1); // Rough estimate
          setSimulatedTimeLeft(`${estMinutes} min`);
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [segmentedRoute,rideAccepted]);
  

  // 🟡 Fetch Route Between Two Points
  useEffect(() => {
    if (riderLocationsrc?.lat && riderLocationdst?.lat) {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${riderLocationsrc.lon},${riderLocationsrc.lat};${riderLocationdst.lon},${riderLocationdst.lat}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]: [number , number]) => [lat, lon]);
            setRoute(coords);
            // Extract distance & duration
            setDistance((data.routes[0].distance / 1000).toFixed(2) + ' km');
            setDuration((data.routes[0].duration / 60).toFixed(2) + ' mins');   
            console.log('distance',distance);
            console.log('duration',duration);     
          }
        })
        .catch((err) => console.error("Error fetching route:", err));
    }
  }, [riderLocationsrc,riderLocationdst]);

  
  return (
    <MapContainer center={center as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <div className="border-[1px] p-5 rounded-md" style={{height:screenhight}}></div>
      {/* 🟢 Marker for Current Location */}
      {fromLocation.lat && (
        <>
        <RecenterMap lat={fromLocation.lat} lon={fromLocation.lon} />
        <Marker
          position={[fromLocation.lat, fromLocation.lon]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latlng = e.target.getLatLng();
              reverseGeocode(latlng.lat, latlng.lng, (name) => {
                onFromDrag({ lat: latlng.lat, lon: latlng.lng, name });
              });
            },
          }}
        >
          <Popup>📍 Source: {fromLocation.name}</Popup>
        </Marker>
        </>

      )}

{typeof riderLocationsrc?.lat === "number" && typeof riderLocationsrc?.lon === "number" && (
    <Marker position={[riderLocationsrc.lat, riderLocationsrc.lon]}>
      <Popup>📍 Rider src: {riderLocationsrc.name}</Popup>
    </Marker>
  )}

{typeof riderLocationdst?.lat === "number" && typeof riderLocationdst?.lon === "number" && (
    <Marker position={[riderLocationdst.lat, riderLocationdst.lon]}>
      <Popup>📍 Rider src: {riderLocationdst.name}</Popup>
    </Marker>
  )}

      {/* 🔵 Marker for Driver Location */}
      {riderLocationdst?.lat && (
        <Marker position={[riderLocationdst.lat,riderLocationdst.lon]}>
          <Popup>📍 Rider dst: {riderLocationdst.name}</Popup>
        </Marker>
      )}
{/* Auto-fit map to route when available
{route.length > 0 && <FitBoundsToRoute route={route} />} */}

      {/* 🔵 Driver → Source Route */}
      {driverRoute.length > 0 &&   (
        <><FitBoundsToRoute route={driverRoute}/>
        <Polyline positions={driverRoute} color="blue" weight={4} dashArray="5,10" />
        </>
      )}
 {/* Colored Segmented Route */}
 {segmentedRoute.map((segment, idx) => {
        let color = 'green';
        if (segment.traffic === 'medium') color = 'orange';
        if (segment.traffic === 'high') color = 'red';

        return <Polyline key={idx} positions={segment.coords} color={color} weight={5} />;
      })}

      {/* Moving Marker */}
      {rideAccepted && segmentedRoute[movingMarkerIndex] && (
        <Marker position={segmentedRoute[movingMarkerIndex].coords[0]}>
          <Popup>🚗 Moving... ETA: {simulatedTimeLeft}</Popup>
        </Marker>
      )}

        {driverDistance && driverDuration && (
          <div
            style={{
              position: 'absolute',
              bottom: 90,
              left: 10,
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '10px',
              borderRadius: '5px',
              zIndex: '1000',
            }}
          >
            <p>🚗 Driver → You</p>
            <p>🛣 Distance: {driverDistance}</p>
            <p>⏳ Duration: {driverDuration}</p>
          </div>
        )}
    {/* Colored Segmented Route */}
      {segmentedRoute.map((segment, idx) => {
        let color = 'green';
        if (segment.traffic === 'medium') color = 'orange';
        if (segment.traffic === 'high') color = 'red';

        return <Polyline key={idx} positions={segment.coords} color={color} weight={5} />;
      })}
      {/* 🟠 Draw Route Between Two Points */}
      {route.length > 0 && <Polyline positions={route} color="red" weight={4} />}

        {/* Travel Distance & Time Info */}
        {distance && duration && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '10px',
              borderRadius: '5px',
              zIndex:'1000',
            }}
          >
            <p>🛣 Distance: {distance}</p>
            <p>⏳ Duration: {duration}</p>
            
          </div>
        )}

    </MapContainer>
  );
};

export default MapView;
