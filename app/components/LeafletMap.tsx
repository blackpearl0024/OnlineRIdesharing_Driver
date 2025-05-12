'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function LeafletMap() {
  useEffect(() => {
    const mapContainer = document.getElementById('map')

    // Prevent reinitializing
    if (!mapContainer || (L as any).mapInstance) return

    const map = L.map('map').setView([51.505, -0.09], 13)
    ;(L as any).mapInstance = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    return () => {
      map.remove()
      ;(L as any).mapInstance = null
    }
  }, [])

  return <div id="map" className="w-full h-[400px] rounded shadow" />
}
