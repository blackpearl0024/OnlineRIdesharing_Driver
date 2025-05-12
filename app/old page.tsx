'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as StompJs from '@stomp/stompjs';

const MapView = dynamic(() => import('./components/Booking/MapView'), { ssr: false });
import Booking from './components/Booking/Booking';

export default function Home() {
  const [fromLocation, setFromLocation] = useState({ lat: null, lon: null, name: '' });
  const [toLocation, setToLocation] = useState({ lat: null, lon: null, name: '' });
  const [messages, setMessages] = useState<string[]>([]);
  const [rideStarted, setRideStarted] = useState(false);
  const [input, setInput] = useState('');

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
    const client = new StompJs.Client({
      brokerURL: 'ws://localhost:9090/gs-guide-websocket', // Same as your Spring endpoint
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP Connected');

        // Send rider identity or auth if needed
        // sendObj('/app/rider/init', { name: 'Imayavaramban', role: 'RIDER', id: 'R001' });

        // // Subscribe to messages from backend
        // client.subscribe('/topic/greetings', (message) => {
        //   const msg = message.body;
        //   console.log("message",message.body)
        //   setMessages(prev => [...prev, msg]);
        //   if (msg.includes('accepted')) setRideStarted(true);
        // });

        client.subscribe('/topic/greetings', (message) => {
          const data = JSON.parse(message.body);
        
          if (data.driverInfo) {
            console.log("Driver Info:", data.driverInfo);
          }
        
          if (data.rideStatus) {
            console.log("Ride Status:", data.rideStatus);
          }
        
          if (data.message) {
            console.log("Message:", data.message);
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

  const handleCreateTrip = () => {
    console.log("button is pressed")
    sendObj('/app/createTrip', {
      
      name:'imaya',
      id:'1',
      fromlat: fromLocation.lat,
      fromlon: fromLocation.lon,
      tolat: toLocation.lat,
      tolon:toLocation.lon,
      preference: 'LEAST_TIME',
    });
  };

  const endRide = () => {
    sendObj('/app/endTrip', { id: 'R001' });
    setRideStarted(false);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 text-black">
        <div className="bg-blue-100">
          <Booking
            fromLocation={fromLocation}
            toLocation={toLocation}
            setFromLocation={setFromLocation}
            setToLocation={setToLocation}
          />
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleCreateTrip}
          >
            Create Trip
          </button>
          {rideStarted && (
            <button onClick={endRide} className="px-4 py-2 bg-red-500 text-white rounded m-2">
              End Ride
            </button>
          )}

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
            toLocation={toLocation}
            onFromDrag={setFromLocation}
            onToDrag={setToLocation}
          />
        </div>
      </div>
    </div>
  );
}
