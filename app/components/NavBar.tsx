import React from 'react'
import {UserButton} from '@clerk/nextjs'
import Link from 'next/link'
export default function NavBar() {
  return (
    <div className='flex justify-between p-3 px-10'>
    <div className='flex gap-6'>

    <nav className="bg-gray-100 p-4 shadow-md flex items-center justify-start gap-6">
  <Link className="text-gray-700 font-medium rounded-md px-4 py-2 transition-all hover:bg-gray-200 hover:text-black" href="/">Home</Link>
  <Link className="text-gray-700 font-medium rounded-md px-4 py-2 transition-all hover:bg-gray-200 hover:text-black" href="/profile">Profile</Link>
  <Link className="text-gray-700 font-medium rounded-md px-4 py-2 transition-all hover:bg-gray-200 hover:text-black" href="/history">History</Link>
</nav>

    </div>
    <UserButton />
    </div>
  )
}
