// components/Booking/DriverInfo.tsx


import * as StompJs from '@stomp/stompjs';
import { destination } from '@turf/turf';
type DriverInfoProps = {
    name: string;
    fare: number;
    
  stompClient: StompJs.Client | null;
   
      
  };

  export default function DriverInfo({ name, fare, stompClient }: DriverInfoProps) {
//    const send = (destination: string,data : any ) =>{
//     const tosend = typeof data === 'string' ? data : JSON.stringify(data);
//     if (stompClient && stompClient.connected) {
//         stompClient.current.publish
//     }
//     else{

//     }

//    }
//     const onEndRide = () => {
//         if (stompClient && stompClient.connected) {
//           stompClient.send('/app/endTrip', {}, JSON.stringify({}));
//         }
//       };
const onEndRide = () => {
    console.log("end button pressed")
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/endTrip',
        body: JSON.stringify({}),
      });
    } else {
      console.warn('STOMP client not connected.');
    }
  };
  

    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">🚗 Driver Found!</h2>
        <p className="mb-2">Name: <strong>{name}</strong></p>
        <p className="mb-4">Fare: ₹{fare}</p>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={onEndRide}
        >
          End Trip
        </button>
      </div>
    );
  }
  