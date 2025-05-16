'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  const [userType, setUserType] = useState<string>('Rider');
  const [homeLocation, setHomeLocation] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('BIKE');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [vehicleNumberError, setVehicleNumberError] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [driverRating, setDriverRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
  
      try {
        // Fetch user profile data
        const userRes = await fetch(`/api/user/get?clerkId=${user.id}`);
        if (!userRes.ok) throw new Error('Failed to fetch user data');
        
        const userData = await userRes.json();
        if (userData.user) {
          setUserType(userData.user.role.charAt(0).toUpperCase() + userData.user.role.slice(1));
          setHomeLocation(userData.user.homeLocation || '');
          setBirthday(userData.user.birthday || '');
          setVehicleType(userData.user.vehicleType || 'BIKE');
          setVehicleNumber(userData.user.vehicleNumber || '');
          setDriverRating(userData.user.rating);
              setRatingCount(userData.user.ratingCount);
          // // Fetch driver rating if user is a driver
          // if (userData.user.role.toLowerCase() === 'driver') {
          //   const ratingRes = await fetch(`/api/driver/rating?driverId=${user.id}`);
          //   if (ratingRes.ok) {
          //     const ratingData = await ratingRes.json();
              
          //   }
          // }
        }

        // Fetch wallet balance (for both riders and drivers)
        const walletRes = await fetch(`/api/wallet/balance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance);
        } else if (walletRes.status === 404) {
          // Wallet doesn't exist yet
          setWalletBalance(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, [user]);

  const handleCreateWallet = async () => {
    if (!user?.id) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          initialBalance: 0
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.balance);
      } else {
        throw new Error(data.error || 'Failed to create wallet');
      }
    } catch (error) {
      console.error('Wallet creation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMoney = async () => {
    if (!user?.id || !addAmount) return;
    setIsProcessing(true);
    try {
      const amount = parseFloat(addAmount);
      if (isNaN(amount) )throw new Error('Invalid amount');

      const res = await fetch('/api/wallet/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: amount
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setWalletBalance(data.newBalance);
        setAddAmount('');
      } else {
        throw new Error(data.error || 'Failed to add money');
      }
    } catch (error) {
      console.error('Add money error:', error);
      alert(error instanceof Error ? error.message : 'Failed to add money');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateVehicleNumber = (number: string): boolean => {
    const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{1,4}$/;
    return regex.test(number);
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    if (userType === 'Driver' && vehicleNumber && !validateVehicleNumber(vehicleNumber)) {
      setVehicleNumberError('Please enter a valid vehicle number (e.g., TN01AB1234)');
      return;
    } else {
      setVehicleNumberError('');
    }

    try {
      await clerk.user?.update({
        unsafeMetadata: {
          userType,
          homeLocation,
          birthday,
          ...(userType === 'Driver' && {
            vehicleType,
            vehicleNumber
          })
        },
      });

      const body = {
        clerkId: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
        role: userType.toLowerCase(),
        homeLocation,
        birthday,
        ...(userType === 'Driver' && {
          vehicleType,
          vehicleNumber
        })
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
      console.error('Error updating profile:', error);
      alert(`Failed to save profile changes.\n\n${error?.message || 'Unknown error'}`);
    }
  };

  if (!isLoaded || !user) return <div>Loading...</div>;
return (
    <div className="container flex min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="sidebar w-64 bg-white shadow-md p-6">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
            {user.firstName?.charAt(0) || 'U'}
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold">{user.firstName || 'User'}</h2>
            <p className="text-sm text-gray-500">{userType}</p>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center p-2 text-indigo-600 bg-indigo-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </a>
            </li>
            <li>
              <a href="/payments" className="flex items-center p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
               Payment HIstory
              </a>
            </li>
            <li>
              <a href="/history" className="flex items-center p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Trips
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-6 text-gray-800">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={user.fullName || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  value={user.primaryEmailAddress?.emailAddress || ''}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Rider">Rider</option>
                  <option value="Driver">Driver</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Location</label>
                <input
                  type="text"
                  value={homeLocation}
                  onChange={(e) => setHomeLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your home address"
                />
              </div>
            </div>
          </div>

          {/* Driver Specific Section */}
          {userType === 'Driver' && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">Driver Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="BIKE">Bike</option>
                    <option value="AUTO">Auto</option>
                    <option value="CAR">Car</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => {
                      setVehicleNumber(e.target.value);
                      setVehicleNumberError('');
                    }}
                    placeholder="e.g., TN01AB1234"
                    className={`w-full px-4 py-2 border ${vehicleNumberError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {vehicleNumberError && (
                    <p className="mt-1 text-sm text-red-600">{vehicleNumberError}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Driver Rating</h3>
                    {driverRating !== null ? (
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-gray-900 mr-3">
                          {driverRating.toFixed(1)}
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-6 h-6 ${i < Math.floor(driverRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
                    ) : (
                      <p className="text-gray-500">No ratings yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6 text-gray-800">Wallet</h2>
            
            {walletBalance === null ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet found</h3>
                <p className="mt-1 text-sm text-gray-500 mb-4">Get started by creating a new wallet.</p>
                <button
                  onClick={handleCreateWallet}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Wallet'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-50 p-6 rounded-lg">
                  <p className="text-sm font-medium text-indigo-700 mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-indigo-900">₹{walletBalance.toFixed(2)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add Money to Wallet</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      min="1"
                      step="0.01"
                    />
                    <button
                      onClick={handleAddMoney}
                      disabled={isProcessing || !addAmount}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Add Money'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum amount: ₹1.00</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}