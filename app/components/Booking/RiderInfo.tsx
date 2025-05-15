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
  setTripEnded: React.Dispatch<React.SetStateAction<boolean>>;
  D_id?: string; // Added driverId prop
};

export default function RiderInfo({ 
  name, 
  fare, 
  stompClient,
  setUiStep,
  uiStep,
  setRideAccepted,
  setTripEnded,
  D_id // Added driverId prop
}: DriverInfoProps) {
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (uiStep) {
      console.log("Ride info UI:", uiStep);
    }
  }, [uiStep]);
  
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe('/topic/greetingsDriver', async (message) => {
        const paymentInfo = JSON.parse(message.body);
        console.log("Payment notification received:", paymentInfo);
        
        if (paymentInfo.message === true) {
          try {
            setIsProcessingPayment(true);
            setPaymentError('');
            
            // 1. Add money to driver's wallet
            const response = await fetch('/api/wallet/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: D_id,
                amount: fare,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to add payment to wallet');
            }

            // 2. Update UI state
            setPaymentReceived(true);
            setUiStep('paymentReceived');
            
          } catch (error) {
            console.error('Payment processing error:', error);
            setPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
          } finally {
            setIsProcessingPayment(false);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [stompClient, D_id, fare, setUiStep]);

  const acceptRide = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/driverAccept',
        body: JSON.stringify({ accepted: true }),
      });
    }
    setRideAccepted(true);
    console.log("accept button is used");
    setUiStep('rideStarted');
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
    console.log("end button pressed");
    
    if (paymentReceived) {
      setUiStep('booking');
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
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
  {uiStep === 'RiderInfo' && (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-blue-100 rounded-full">
          <span className="text-xl">🧍</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Rider Request</h2>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Rider Name</span>
          <span className="font-semibold">{name}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Pickup Location</span>
          <span className="text-blue-600 font-medium flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View on map
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Estimated Fare</span>
          <span className="text-green-600 font-bold">₹{fare}</span>
        </div>
      </div>
      
      <div className="flex space-x-4 pt-2">
        <button
          className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          onClick={acceptRide}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Accept Trip</span>
        </button>
        <button
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center space-x-2"
          onClick={rejectRide}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Reject Trip</span>
        </button>
      </div>
    </div>
  )}

  {uiStep === 'rideStarted' && (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-yellow-100 rounded-full">
          <span className="text-xl">🚕</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Ride In Progress</h2>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-blue-800 text-center">Stay on this screen while driving to your destination</p>
      </div>
      
      <button
        className={`w-full px-4 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${paymentReceived ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
        onClick={onEndRide}
        disabled={!paymentReceived}
      >
        {isProcessingPayment ? (
          <span className="flex items-center justify-center space-x-2">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing Payment...</span>
          </span>
        ) : (
          'End Trip'
        )}
      </button>
      
      {paymentError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
          {paymentError}
        </div>
      )}
    </div>
  )}

  {uiStep === 'paymentReceived' && (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-28 h-28 mb-6">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-14 h-14 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Received</h2>
      <p className="text-3xl font-bold text-gray-800 mb-3">₹{fare.toFixed(2)}</p>
      <p className="text-gray-600 mb-6">Amount has been added to your wallet</p>

      <button
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow hover:shadow-md"
        onClick={() => setUiStep('booking')}
      >
        <span className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Back to Home</span>
        </span>
      </button>
    </div>
  )}
</div>
  );
}