import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";


const FitBoundsToRoute = ({ route }: { route: [number, number][] }) => {
    const map = useMap();
  
    useEffect(() => {
      if (route.length > 0) {
        const bounds = L.latLngBounds(route.map((p) => L.latLng(p[0], p[1])));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [route, map]);
  
    return null;
  };
  
  export default FitBoundsToRoute;
  