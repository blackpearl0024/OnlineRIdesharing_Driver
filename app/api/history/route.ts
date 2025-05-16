import { NextResponse } from 'next/server'
import connectMongodb from '@/lib/mongodb'
import Trips from '@/models/Trips'


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const _id = searchParams.get('clerkId')
    console.log("history/route.ts callled")
console.log(_id)
    if (!_id) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 })
    }

    await connectMongodb()
    console.log("db is connected")
    const user = await Trips.find({ 'driver._id': _id }).sort({tripId: -1 })  // ✅ fixed line
console.log("trying to insert")
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
