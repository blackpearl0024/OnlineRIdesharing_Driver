import * as StompJs from '@stomp/stompjs';
import { useEffect, useState } from 'react';



type UiStepType = 'booking' | 'searching' | 'RiderInfo' | 'rideStarted' | 'paymentReceived' | 'rating';

type DriverInfoProps = {
  name: string;
  fare: number;
  stompClient: StompJs.Client | null;
  setUiStep: React.Dispatch<React.SetStateAction<UiStepType>>;
  uiStep: UiStepType;
  setRideAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  setTripEnded:React.Dispatch<React.SetStateAction<boolean>>;
};

export default function RiderInfo({ name, fare, stompClient,setUiStep,uiStep,setRideAccepted,setTripEnded   }: DriverInfoProps) {
  const [paymentReceived, setPaymentReceived] = useState(false);
  

useEffect(() => {
  if (uiStep) {
    console.log(" Riden ifo UI :", uiStep);
  }

 
}, [uiStep]);
  
  
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe('/topic/greetingsDriver', (message) => {
        const paymentInfo = JSON.parse(message.body);
        console.log("before payment ui set")
        setUiStep('paymentReceived');
        console.log("after payment ui is set")
        if (paymentInfo.message === true) {
          setPaymentReceived(true); // Enable End Trip
        }
      });
    }
  }, [stompClient]);
  
  console.log("button pressed is accept")
  const acceptRide = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/driverAccept',
        body: JSON.stringify({ accepted: true }),
      });
    }
    setRideAccepted(true);  // Using the setter
    console.log("accept but is used")
    setUiStep('rideStarted'); // Switch to next UI
  };
  

  const rejectRide = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/driverReject',
        body: JSON.stringify({ accepted: false }),
      });
      setUiStep('booking');
    }
  };
const onEndRide = () => {
    console.log("end button pressed")
    
    
    // If payment already received, navigate to end screen
    if (paymentReceived) {
      setUiStep('booking'); // or setTripCompleteUI(true)
    }
    
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/endTripDriver',
        body: JSON.stringify({}),
      });
      setTripEnded(true);
    } else {
      console.warn('STOMP client not connected.');
    }
  };
  return (
    <div>
      { uiStep === 'RiderInfo' && (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">🧍 Rider Request</h2>
      <p className="mb-2">Rider Name: <strong>{name}</strong></p>
      <p className="mb-2">Pickup Location: See on map 📍</p>
      <p className="mb-4">Estimated Fare: ₹{fare}</p>
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={acceptRide}
        >
          ✅ Accept Trip
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={rejectRide}
        >
          ❌ Reject Trip
        </button>
      </div>
    </div>
      )}
    {uiStep === 'rideStarted' && (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-2">🚕 Ride In Progress</h2>
    <p className="mb-2">Stay on this screen while driving...</p>
    <button
    className="px-4 py-2 bg-red-500 text-white rounded"
    onClick={onEndRide}
    disabled={!paymentReceived}
  >
    End Trip
  </button>
  </div>
  //   <button
  //   className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
  //   onClick={() => setUiStep('paymentReceived')}
  // >
  //   ⛔ End Ride
  // </button>
)}


{uiStep === 'paymentReceived' && (
  <div className="flex flex-col items-center justify-center p-6 text-center">
    {/* Success animation circle */}
    <div className="relative w-24 h-24 mb-6">
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
      <div className="absolute inset-0 bg-green-600 rounded-full flex items-center justify-center">
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful</h2>
    <p className="text-gray-700 mb-4">You can now take new bookings.</p>

    <button
      className="px-5 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-all duration-300"
      onClick={() => setUiStep('rideStarted')}
    >
      🔁 Back to Home
    </button>
  </div>
)}


    </div>
  );
}
