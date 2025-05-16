'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Clock, MapPin, ArrowRight } from 'lucide-react'
import ReverseGeocode from './ReverseGeocode'

export default function RecentTripsList() {
  const { user } = useUser()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.id) return
      
      try {
        const res = await fetch(`/api/history?clerkId=${user.id}`)
        const data = await res.json()
        setTrips(data.user.slice(0, 3)) // Show only 3 most recent
      } catch (error) {
        console.error('Failed to fetch trips:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [user?.id])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (trips.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No recent trips found</p>
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <div key={trip.tripId} className="border-b pb-4 last:border-0 last:pb-0">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">From</h4>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-800">
                      {trip.srcLoc ? (
                        <ReverseGeocode lat={trip.srcLoc.latitude} lon={trip.srcLoc.longitude} />
                      ) : (
                        trip.pickupLocation || 'Unknown location'
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">To</h4>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-800">
                      {trip.dstLoc ? (
                        <ReverseGeocode lat={trip.dstLoc.latitude} lon={trip.dstLoc.longitude} />
                      ) : (
                        trip.dropoffLocation || 'Unknown location'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(trip.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
              ₹{trip.fare}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}