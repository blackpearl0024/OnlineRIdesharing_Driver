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

interface MapViewProps {
  fromLocation: any;
  riderLocationsrc: any;
  onFromDrag: any;
  onInitFromLocation: any;
  riderLocationdst: any;
  riderStops?: Array<{lat: number, lon: number, name: string}>;
  rideAccepted: boolean;
  setRideAccepted?: any;
  tripEnded?: boolean;
}

const MapView = ({ 
  fromLocation, 
  riderLocationsrc, 
  onFromDrag, 
  onInitFromLocation, 
  riderLocationdst, 
  riderStops = [],
  rideAccepted 
}: MapViewProps) => {

  const center = fromLocation.lat && fromLocation.lon ? [fromLocation.lat, fromLocation.lon] : [12.9716, 77.5946];

  const [route, setRoute] = useState<[number, number][]>([]); // Stores the complete route with stops
  const [routeSegments, setRouteSegments] = useState<{coords: [number, number][], segment: string}[]>([]); // ✅ NEW: Route broken into segments
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [driverRoute, setDriverRoute] = useState<[number, number][]>([]);
  const [driverDistance, setDriverDistance] = useState<string>('');
  const [driverDuration, setDriverDuration] = useState<string>('');
  const [segmentedRoute, setSegmentedRoute] = useState<{ coords: [number, number][]; traffic: TrafficLevel }[]>([]);
  const [movingMarkerIndex, setMovingMarkerIndex] = useState<number>(0);
  const [simulatedTimeLeft, setSimulatedTimeLeft] = useState<string>('');

  console.log("riderLocationsrc in Map:", riderLocationsrc);
  console.log("riderStops in Map:", riderStops);

  const createCustomIcon = (color: string, number?: number) => {
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">${number || ''}</div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const pickupIcon = createCustomIcon('#22c55e'); // Green for pickup
  const destinationIcon = createCustomIcon('#ef4444'); // Red for destination
  const driverIcon = createCustomIcon('#3b82f6'); // Blue for driver

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
  const screenhight = window.innerHeight * 0.7;
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

  // Driver to pickup route (unchanged)
  useEffect(() => {
    if (riderLocationsrc?.lat && fromLocation?.lat) {
      const osrmDriverUrl = `https://router.project-osrm.org/route/v1/driving/${fromLocation.lon},${fromLocation.lat};${riderLocationsrc.lon},${riderLocationsrc.lat}?overview=full&geometries=geojson`;
      
      fetch(osrmDriverUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
            setDriverRoute(coords);
            
            const segments = [];
            for (let i = 0; i < coords.length - 1; i++) {
              segments.push({
                coords: [coords[i], coords[i + 1]],
                traffic: assignTrafficLevel(),
              });
            }
            setSegmentedRoute(segments);
            setMovingMarkerIndex(0);

            setDriverDistance((data.routes[0].distance / 1000).toFixed(2) + ' km');
            setDriverDuration((data.routes[0].duration / 60).toFixed(2) + ' mins');
          }
        })
        .catch((err) => console.error("Error fetching driver-to-source route:", err));
    }
  }, [riderLocationsrc, fromLocation]);

  // ✅ NEW: Multi-stop route generation including all stops in order
  useEffect(() => {
    if (riderLocationsrc?.lat && riderLocationdst?.lat) {
      // Create waypoints array: pickup → stops → destination
      const waypoints = [
        { lat: riderLocationsrc.lat, lon: riderLocationsrc.lon, name: 'Pickup' },
        ...riderStops,
        { lat: riderLocationdst.lat, lon: riderLocationdst.lon, name: 'Destination' }
      ];

      console.log("Waypoints for routing:", waypoints);

      if (waypoints.length >= 2) {
        // ✅ Generate multi-stop route
        generateMultiStopRoute(waypoints);
      }
    }
  }, [riderLocationsrc, riderLocationdst, riderStops]);

  // ✅ NEW: Function to generate route through multiple stops
 const generateMultiStopRoute = async (waypoints: Array<{lat: number, lon: number, name: string}>) => {
  try {
    let completeRoute: [number, number][] = [];
    let totalDistance = 0;
    let totalDuration = 0;
    const segments: {coords: [number, number][], segment: string}[] = [];

    // Generate route between driver's source and rider's source
    const osrmUrl1 = `https://router.project-osrm.org/route/v1/driving/${waypoints[0].lon},${waypoints[0].lat};${waypoints[1].lon},${waypoints[1].lat}?overview=full&geometries=geojson`;
    const response1 = await fetch(osrmUrl1);
    const data1 = await response1.json();
    if (data1.routes && data1.routes.length > 0) {
      const segmentCoords1 = data1.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
      completeRoute = [...completeRoute, ...segmentCoords1];
      totalDistance += data1.routes[0].distance;
      totalDuration += data1.routes[0].duration;
      segments.push({
        coords: segmentCoords1,
        segment: `${waypoints[0].name} → ${waypoints[1].name}`
      });
    }

    // Generate route between rider's source and destination, with stops in between
    for (let i = 1; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      const osrmUrl2 = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
      const response2 = await fetch(osrmUrl2);
      const data2 = await response2.json();
      if (data2.routes && data2.routes.length > 0) {
        const segmentCoords2 = data2.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
        completeRoute = [...completeRoute, ...segmentCoords2];
        totalDistance += data2.routes[0].distance;
        totalDuration += data2.routes[0].duration;
        segments.push({
          coords: segmentCoords2,
          segment: `${start.name} → ${end.name}`
        });
      }
    }

    // Update state with complete route
    setRoute(completeRoute);
    setRouteSegments(segments);
    setDistance((totalDistance / 1000).toFixed(2) + ' km');
    setDuration((totalDuration / 60).toFixed(2) + ' mins');
  } catch (error) {
    console.error("Error generating multi-stop route:", error);
  }
};
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (segmentedRoute.length > 0 && rideAccepted) {
      console.log("inside useeffect that generate moving marker");
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
          const estMinutes = (remaining * delayFactor * 0.5).toFixed(1);
          setSimulatedTimeLeft(`${estMinutes} min`);
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [segmentedRoute, rideAccepted]);

  return (
    <MapContainer center={center as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <div className="border-[1px] p-5 rounded-md" style={{height: screenhight}}></div>
      
      {/* 🔵 Driver's Current Location */}
      {fromLocation.lat && (
        <>
          <RecenterMap lat={fromLocation.lat} lon={fromLocation.lon} />
          <Marker
            position={[fromLocation.lat, fromLocation.lon]}
            icon={driverIcon}
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
            <Popup>🚗 Your Location: {fromLocation.name}</Popup>
          </Marker>
        </>
      )}

      {/* 🟢 Rider's Pickup Location */}
      {typeof riderLocationsrc?.lat === "number" && typeof riderLocationsrc?.lon === "number" && (
        <Marker 
          position={[riderLocationsrc.lat, riderLocationsrc.lon]}
          icon={pickupIcon}
        >
          <Popup>📍 Pickup: {riderLocationsrc.name || 'Rider Location'}</Popup>
        </Marker>
      )}

      {/* ✅ Rider's Stops (numbered in order) */}
      {riderStops.map((stop, index) => (
        <Marker
          key={`stop-${index}`}
          position={[stop.lat, stop.lon]}
          icon={createCustomIcon('#f59e0b', index + 1)} // Orange with stop number
        >
          <Popup>
            🛑 Stop {index + 1}: {stop.name}
            <br />
            Lat: {stop.lat.toFixed(6)}, Lon: {stop.lon.toFixed(6)}
          </Popup>
        </Marker>
      ))}

      {/* 🔴 Rider's Destination */}
      {typeof riderLocationdst?.lat === "number" && typeof riderLocationdst?.lon === "number" && (
        <Marker 
          position={[riderLocationdst.lat, riderLocationdst.lon]}
          icon={destinationIcon}
        >
          <Popup>🎯 Destination: {riderLocationdst.name || 'Final Destination'}</Popup>
        </Marker>
      )}

      {/* Driver → Pickup Route (Blue dashed line) */}
      {driverRoute.length > 0 && (
        <>
          <FitBoundsToRoute route={driverRoute}/>
          <Polyline positions={driverRoute} color="blue" weight={4} dashArray="5,10" />
        </>
      )}

      {/* ✅ NEW: Multi-stop route with different colors for each segment */}
      {routeSegments.map((segment, index) => {
        const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
        const color = colors[index % colors.length];
        return (
          <Polyline 
            key={`segment-${index}`}
            positions={segment.coords} 
            color={color} 
            weight={5}
            opacity={0.8}
          />
        );
      })}

      {/* Fallback: Complete route as single line if segments fail */}
      {route.length > 0 && routeSegments.length === 0 && (
        <Polyline positions={route} color="red" weight={4} />
      )}

      {/* Colored Segmented Route for traffic simulation */}
      {segmentedRoute.map((segment, idx) => {
        let color = 'green';
        if (segment.traffic === 'medium') color = 'orange';
        if (segment.traffic === 'high') color = 'red';
        return <Polyline key={`traffic-${idx}`} positions={segment.coords} color={color} weight={5} />;
      })}

      {/* Moving Marker during ride */}
      {rideAccepted && segmentedRoute[movingMarkerIndex] && (
        <Marker position={segmentedRoute[movingMarkerIndex].coords[0]}>
          <Popup>🚗 Moving... ETA: {simulatedTimeLeft}</Popup>
        </Marker>
      )}

      {/* Distance and Duration Info */}
      {driverDistance && driverDuration && (
        <div style={{
          position: 'absolute',
          bottom: 90,
          left: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '5px',
          zIndex: '1000',
          fontSize: '12px'
        }}>
          <p><strong>🚗 Driver → Pickup</strong></p>
          <p>🛣 Distance: {driverDistance}</p>
          <p>⏳ Duration: {driverDuration}</p>
        </div>
      )}

      {distance && duration && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '5px',
          zIndex: '1000',
          fontSize: '12px'
        }}>
          <p><strong>🛣 Complete Trip (with stops)</strong></p>
          <p>Distance: {distance}</p>
          <p>Duration: {duration}</p>
          {riderStops.length > 0 && (
            <p>Stops: {riderStops.length}</p>
          )}
          {routeSegments.length > 0 && (
            <div style={{ fontSize: '10px', marginTop: '5px' }}>
              <p><strong>Route segments:</strong></p>
              {routeSegments.map((seg, idx) => (
                <p key={idx} style={{ color: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][idx % 6] }}>
                  {idx + 1}. {seg.segment}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ Legend for marker types */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '5px',
        zIndex: '1000',
        fontSize: '11px'
      }}>
        <p><span style={{color: '#3b82f6'}}>🔵</span> Your Location</p>
        <p><span style={{color: '#22c55e'}}>🟢</span> Pickup Point</p>
        <p><span style={{color: '#f59e0b'}}>🟡</span> Stops (1,2,3...)</p>
        <p><span style={{color: '#ef4444'}}>🔴</span> Destination</p>
        <hr style={{ margin: '5px 0' }} />
        <p style={{fontSize: '10px'}}><strong>Route:</strong></p>
        <p style={{fontSize: '10px'}}>Blue dashed: Driver→Pickup</p>
        <p style={{fontSize: '10px'}}>Colored solid: Trip route</p>
      </div>
    </MapContainer>
  );
};

export default MapView;