// app/api/user/route.ts
import { NextResponse } from 'next/server'
import connectMongodb from '@/lib/mongodb'
import imaya from '@/models/Driver'

export async function POST(req: Request) {
  try {
    const { clerkId, name, email, phone, role, homeLocation, birthday,vehicleType, vehicleNumber } = await req.json()
    await connectMongodb()
console.log("birthday : " + birthday + " vehicleType "+vehicleType)
    const existingUser = await imaya.findOne({ clerkId })

    if (existingUser) {
      // Update the existing user
      await imaya.updateOne({ clerkId }, {
        name,
        email,
        phone,
        role:role.toLowerCase(),
        homeLocation,
        birthday,
        vehicleType,
        vehicleNumber,
      })
      const updatedUser = await imaya.findOne({ clerkId });
console.log("Updated user:", updatedUser);

    } else {
      // Insert new user
      await imaya.create({
        clerkId,
        name,
        email,
        phone,
        role:role.toLowerCase(),
        homeLocation,
        birthday,
        vehicleType,
        vehicleNumber,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error saving user:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
