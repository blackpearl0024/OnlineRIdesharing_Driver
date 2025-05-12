"use client";

import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <SignIn path="/sign-in" routing="path" />
    </div>
  );
}
