'use client'

import { useEffect, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapComponent() {
  const [pickup, setPickup] = useState<string>('')
  const [dropoff, setDropoff] = useState<string>('')

  useEffect(() => {
    // Wait until the DOM has the map container
    const mapContainer = document.getElementById('map')
    if (!mapContainer) return
  
    const map = L.map(mapContainer).setView([51.505, -0.09], 13)
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
  
    let markerCount = 0
  
    // 🔴 1. Try to locate the user's position
    map.locate({ setView: true, maxZoom: 16 })
  
    map.on('locationfound', (e) => {
      const radius = e.accuracy
      const { lat, lng } = e.latlng
  
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`You are within ${Math.round(radius)} meters.`)
        .openPopup()
  
      L.circle([lat, lng], radius).addTo(map)
    })
  
    map.on('locationerror', () => {
      alert('Location access denied or unavailable.')
    })
  
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      const location = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      L.marker([lat, lng]).addTo(map)
  
      if (markerCount === 0) {
        setPickup(location)
        markerCount++
      } else if (markerCount === 1) {
        setDropoff(location)
        markerCount++
      }
    })
  
    return () => {
      map.remove()
    }
  }, [])
  
  
  const bookRide = () => {
    if (!pickup || !dropoff) {
      alert('Please select both pickup and drop-off locations.')
      return
    }
    alert(`Ride booked!\nPickup: ${pickup}\nDrop-off: ${dropoff}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div id="map" className="h-[400px] w-full rounded shadow" />
      <div className="flex flex-col gap-2 text-black">
        <input
          type="text"
          value={pickup}
          placeholder="Pickup Location"
          readOnly
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={dropoff}
          placeholder="Drop-off Location"
          readOnly
          className="border p-2 rounded"
        />
        <button
          onClick={bookRide}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Book Ride
        </button>
      </div>
    </div>
  )
}
