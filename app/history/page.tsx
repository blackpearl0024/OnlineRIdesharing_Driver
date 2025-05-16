'use client'
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react'
import ReverseGeocode from '../components/ReverseGeocode'
import { ChevronRightIcon, DownloadIcon, FilterIcon, HistoryIcon, UserIcon,MapPin } from 'lucide-react'

type Location = {
  latitude: number
  longitude: number
}

type Trip = {
  _id: string
  tripId: string
  fare: number
  status: string
  srcLoc: Location
  dstLoc: Location
  rider: {
    _id: string
    name: string
    rating: string
  }
  driver: {
    _id: string
    name: string
    rating: string
    vehicleType: string
    location: Location
  }
}

export default function TripHistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
    const { user, isLoaded } = useUser();
   const D_name = user?.fullName ||'';
const  clerkId = user?.id;
 

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch(`/api/history?clerkId=${clerkId}`)
        const data = await res.json()
        console.log("asked for trips")
        if (res.ok) {
          setTrips(data.user) // users = array of trips
        } else {
          console.error(data.error)
        }
      } catch (error) {
        console.error('Failed to fetch trip history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  if (loading) return <div>Loading...</div>

  if (trips.length === 0) return <div>No trips found.</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
  <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800">Your Trip History</h1>
      <div className="flex space-x-3">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
          <FilterIcon className="mr-2" />
          Filter
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
          <DownloadIcon className="mr-2" />
          Export
        </button>
      </div>
    </div>

    {trips.length === 0 ? (
      <div className="bg-white p-12 rounded-xl shadow-sm text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <HistoryIcon className="text-gray-400 text-3xl" />
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No trips yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">Your completed trips will appear here. Ready for your first ride?</p>
      </div>
    ) : (
      <div className="space-y-4">
        {trips.map((trip) => (
          <div key={trip._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Driver</h4>
                      <p className="text-gray-800">{trip.driver.name} ({trip.driver.vehicleType})</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <UserIcon className="text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Rider</h4>
                      <p className="text-gray-800">{trip.rider.name}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <MapPin className="text-red-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">From</h4>
                      <p className="text-gray-800">
                        <ReverseGeocode lat={trip.srcLoc.latitude} lon={trip.srcLoc.longitude} />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <MapPin className="text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">To</h4>
                      <p className="text-gray-800">
                        <ReverseGeocode lat={trip.dstLoc.latitude} lon={trip.dstLoc.longitude} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end">
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                View Details
                <ChevronRightIcon className="ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
  )

}
