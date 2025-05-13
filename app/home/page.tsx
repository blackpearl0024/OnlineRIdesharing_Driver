// app/home/page.tsx
'use client';

// app/page.tsx or app/page.jsx
import dynamic from 'next/dynamic';
import {UserButton} from '@clerk/nextjs'
// Import the component as a client component
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Welcome, Rider!</h2>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="/history">Ride History</a></li>
          <li><a href="/profile">Profile</a></li>
         
         
          
        </ul>
      </aside>

      <main className="main-content">
        <h1>Book Your Ride</h1>
        <MapComponent />
      </main>
    </div>
  );
}
