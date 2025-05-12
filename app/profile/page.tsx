'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk(); // ✅ move this hook to the top level

  const [userType, setUserType] = useState<string>('Rider');
  const [homeLocation, setHomeLocation] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [VehicalType,setVehicalType] = useState<string>('BIKE');
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
  
      try {
        const res = await fetch(`/api/user/get?clerkId=${user.id}`) // assumes GET route
        if (!res.ok) throw new Error('Failed to fetch user data')
        
        const data = await res.json()
        if (data.user) {
          setUserType(data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)) // e.g., "rider" → "Rider"
          setHomeLocation(data.user.homeLocation || '')
          setBirthday(data.user.birthday || '')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  
    fetchUserData()
  }, [user])
  
  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      await clerk.user?.update({
        unsafeMetadata: {
          userType,
          homeLocation,
          birthday,
        },
      });

      const body = {
        clerkId: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
        role: userType,
        homeLocation,
        birthday,
        
      };

      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());

      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating Clerk metadata:', error);
      alert(`Failed to save profile changes.\n\n${error?.message || 'Unknown error'}`);
    }
  };

  // ... rest of your component
  if (!isLoaded || !user) return <div>Loading...</div>

  return (
    <div className="container flex text-white">
      <aside className="sidebar w-1/4 bg-gray-800 p-4 min-h-screen">
        <h2 className="text-xl font-bold mb-4">Welcome, {user.firstName || 'Rider'}!</h2>
        <ul className="space-y-2">
          <li><Link href="/home" className="hover:underline">Home</Link></li>
          <li><Link href="#">Ride History</Link></li>
          <li><Link href="/profile" className="font-semibold underline">Profile</Link></li>
          <li><Link href="#">Settings</Link></li>
        </ul>
      </aside>

      <main className="main-content w-3/4 bg-gray-900 p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Your Profile</h1>

        <div className="profile-info space-y-6">
          <div>
            <label className="block font-medium mb-1">Full Name:</label>
            <input
              type="text"
              value={user.fullName || ''}
              readOnly
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email:</label>
            <input
              type="text"
              value={user.primaryEmailAddress?.emailAddress || ''}
              readOnly
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Date of Birth:</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">User Type:</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            >
              <option value="Rider">Rider</option>
              <option value="Driver">Driver</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Home Location:</label>
            <input
              type="text"
              value={homeLocation}
              onChange={(e) => setHomeLocation(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white border border-gray-600"
            />
          </div>

          <button
            onClick={handleSaveChanges}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Save Changes
          </button>
        </div>
      </main>
    </div>
  )
}
