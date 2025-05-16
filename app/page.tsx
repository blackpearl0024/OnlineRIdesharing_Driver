'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as StompJs from '@stomp/stompjs';

const MapView = dynamic(() => import('./components/Booking/MapView'), { ssr: false });
import Booking from './components/Booking/Booking';
import SearchingView from './components/Booking/SearchingView';
import DriverInfo from './components/Booking/DriverInfo';
import RatingView from './components/Booking/RatingView';
import { useUser } from '@clerk/nextjs';
import RiderInfo from './components/Booking/RiderInfo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
 const [fromLocation, setFromLocation] = useState<{ lat: number | null; lon: number | null; name: string }>({
  lat: null,
  lon: null,
  name: ''
});

  const [toLocation, setToLocation] = useState({ lat: null, lon: null, name: '' });
  const [messages, setMessages] = useState<string[]>([]);
  const [rideStarted, setRideStarted] = useState(false);
  const [input, setInput] = useState('');
 
  const { user, isLoaded } = useUser();
  const [uiStep, setUiStep] = useState<'booking' | 'searching' | 'RiderInfo' | 'rideStarted' | 'paymentReceived' | 'rating'>('booking');
  const [rideAccepted, setRideAccepted] = useState<boolean>(false); // New state
 const [rating, setRating] = useState<number>(0);
  const [vehicleType, setVehicleType] = useState('');
const [tripEnded,setTripEnded] = useState<boolean>(false);

const [riderName, setRiderName] = useState('');
const [fare, setFare] = useState(0);


const [riderLocationsrc, setRiderLocationSrc] = useState<{ lat: number | null; lon: number | null;name: string }>(
  { lat: null, lon: null,name: '' }
);

const [riderLocationdst, setRiderLocationDst] = useState<{ lat: number | null; lon: number | null; name: string}>(
  { lat: null, lon: null,name: '' }
);


  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
const D_name = user?.fullName ||'';
const D_id = user?.id;

useEffect(() => {
  if (rideAccepted) {
    console.log("Updated rider accept",rideAccepted);
  }

}, [rideAccepted]);

useEffect(() => {
  if (tripEnded) {
    console.log("trip ended")
     console.log("before setting driver src: ",fromLocation)
    setFromLocation({
      lat: riderLocationdst.lat,
      lon: riderLocationdst.lon,
      name: riderLocationdst.name || ''  // default to empty if undefined
    });
    console.log("after setting driver src: ",fromLocation)
console.log("before riderscr " + riderLocationsrc)
console.log("before riderscr " + riderLocationdst)
    setRiderLocationSrc({ lat: null, lon: null, name: '' });
    setRiderLocationDst({ lat: null, lon: null, name: '' });
  }
}, [tripEnded]);



useEffect(() => {
  async function fetchDriverRating() {
    try {
      const res = await fetch(`/api/user/get?clerkId=${D_id}`);
      if (!res.ok) throw new Error("Failed to fetch rating");
      const data = await res.json();
      const driver = data.user;
      setRating(driver?.rating ?? 0);
      setVehicleType(driver?.vehicleType);
    } catch (error) {
      console.error("Error fetching rating:", error);
    }
  }

  if (D_id) fetchDriverRating();
}, [D_id]);



  const stompClientRef = useRef<StompJs.Client | null>(null);

  const sendObj = (destination: string, data: any) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const toSend = typeof data === 'string' ? data : JSON.stringify(data);
      stompClientRef.current.publish({
        destination,
        body: toSend,
      });
    } else {
      console.warn("STOMP client not connected.");
    }
  };

  useEffect(() => {
    if (uiStep) {
      console.log(" homepage ifo UI :", uiStep);
    }
  
   
  }, [uiStep]);
    
  useEffect(() => {
    if (riderLocationsrc) {
      console.log("Updated rider src:", riderLocationsrc.lat, riderLocationsrc.lon);
    }
  }, [riderLocationsrc]);
  
  useEffect(() => {
    const client = new StompJs.Client({
      brokerURL: 'ws://localhost:9090/gs-guide-websocket', // Same as your Spring endpoint
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP Connected');
//  const driverId = 'user_2vqZsPuWVtlY2ZN7hEs45t2aE8q'; // Get this from your auth/state
            const driverChannel = `/topic/driver/${D_id}`;
        // Send rider identity or auth if needed
        // sendObj('/app/rider/init', { name: 'Imayavaramban', role: 'RIDER', id: 'R001' });

        // // Subscribe to messages from backend
        // client.subcribe('/topic/greetings', (message) => {
        //   const msg = message.body;
        //   console.log("message",message.body)
        //   setMessages(prev => [...prev, msg]);
        //   if (msg.includes('accepted')) setRideStarted(true);
        // });

        client.subscribe(driverChannel, (message) => {
        try {
            const data = JSON.parse(message.body);
            let infoText =null;
            // Logging raw driver info
            if (data.driverInfo) {
              const infoText = data.driverInfo || '';
              console.log("Driver Info:", infoText);
            
              const nameMatch = infoText.match(/Rider (.*?)(,|$)/);
              const name_d = nameMatch?.[1] || 'Unknown';
            console.log(name_d)
              const fareMatch = infoText.match(/Fare: \$([0-9.]+)/);
              const fare_t = parseFloat(fareMatch?.[1] || '0');
              console.log(fare_t)
              // Source location
              const srcLoc = infoText.match(/Locationsrc: Latitude:\s*([0-9.]+),\s*Longitude:\s*([0-9.]+)/);
              if (srcLoc) {
                const lat = parseFloat(srcLoc[1]);
                const lon = parseFloat(srcLoc[2]);
                setRiderLocationSrc({ lat, lon,name: ''  });
                console.log("Rider Src:", lat, lon);
              }

              // ✅ FIXED: Destination location regex
              const dstLoc = infoText.match(/Locationdst: Latitude:\s*([0-9.]+),\s*Longitude:\s*([0-9.]+)/);
              if (dstLoc) {
                const lat = parseFloat(dstLoc[1]);
                const lon = parseFloat(dstLoc[2]);
                setRiderLocationDst({ lat, lon,name: ''  });
                console.log("Rider Dst:", lat, lon);
              }
                          
            
              setRiderName(name_d);
              setFare(fare_t);
            }
            
        
            // When ride has started
            if (data.message === 'Your response (yes/no):') {
              console.log("Driver Info:", data.driverInfo);
              console.log("rider src" + riderLocationsrc.lat,riderLocationsrc.lon)
              
              setUiStep('RiderInfo'); // Show driver info UI
            }
        
            // Log any other messages
            if (data.message) {
              console.log("Message:", data.message);
              if(data.message ==='Ride ended' )
              {
                setUiStep('rating');
              }
            }
        
          } catch (error) {
            console.error("Failed to parse message:", error);
          }
        });
        
        
      },
      onDisconnect: () => {
        console.log('Disconnected');
      },
      onStompError: (frame) => {
        console.error('Broker error: ', frame.headers['message']);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);


  
  useEffect(() => {
    const checkProfile = async () => {
      if (!user || !isLoaded) return;
      
      setIsChecking(true);
      try {
        const res = await fetch(`/api/user/check?clerkId=${user.id}`);
        const data = await res.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        if (!data.profileExists || !data.walletExists) {
          // Redirect to profile page if profile or wallet is missing
          router.push('/profile');
          return;
        }

        setProfileComplete(true);
      } catch (error) {
        console.error('Failed to check profile:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [user, isLoaded, router]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Checking your profile...</p>
        </div>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Incomplete</h2>
          <p className="text-gray-600 mb-6">
            Please complete your profile and set up your wallet to continue.
          </p>
          <Link
            href="/profile"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateTrip = () => {
    console.log("button is pressed")
    console.log("fromlat:" + fromLocation.lat +
      "fromlon:" + fromLocation.lon,)
   // ⬅️ Show searching view after button press
    sendObj('/app/createTripDriver', {
      
      name: D_name,
      id:D_id ,
      fromlat: fromLocation.lat,
      fromlon: fromLocation.lon,
  
rating: rating,
      vehiclepreference: vehicleType
 
    });

    setUiStep('searching'); 
  };

  const endRide = () => {
    sendObj('/app/endTrip', { id: 'R001' });
    setRideStarted(false);
     // ⬅️ Show rating view
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 text-black">
        <div className="bg-blue-100 p-4">
        {uiStep === 'booking' && (
          <>
            <Booking
              fromLocation={fromLocation}
              setFromLocation={setFromLocation}
              
            />
            <button
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleCreateTrip}
            >
              Create Trip
            </button>
          </>
        )}

        {uiStep === 'searching' && <SearchingView />}

         {(uiStep === 'RiderInfo' || uiStep === 'rideStarted' || uiStep === 'paymentReceived' ) && (
          <RiderInfo name={riderName} fare={fare} stompClient={stompClientRef.current} setUiStep={setUiStep} uiStep={uiStep} setRideAccepted={setRideAccepted} setTripEnded={setTripEnded} D_id={D_id}/>
        )}

        {uiStep === 'rating' && <RatingView />}

        {/* Message log section - Optional */}
        <div className="bg-gray-100 mt-4 p-4 rounded shadow max-w-xl">
          <h2 className="font-bold mb-2">Messages:</h2>
          {messages.map((msg, i) => (
            <div key={i} className="text-sm border-b py-1">{msg}</div>
          ))}
        </div>
             
        </div>

        <div className="col-span-2 bg-red-100 order-first md:order-last text-black">
          <MapView
            fromLocation={fromLocation}
            onFromDrag={setFromLocation}
            onInitFromLocation={setFromLocation}
            riderLocationsrc={riderLocationsrc}
            riderLocationdst={riderLocationdst}
            rideAccepted={rideAccepted}
            setRideAccepted={setRideAccepted}
            
          />
        </div>
      </div>
    </div>
  );
}
