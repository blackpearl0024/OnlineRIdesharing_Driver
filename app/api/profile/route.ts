// app/api/profile/route.ts
import { NextResponse } from 'next/server'
import  connectDB  from '@/lib/mongodb'
import  User  from '@/models/UserDriver'

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()

  try {
    const existingUser = await User.findOne({ userId: body.userId })

    if (existingUser) {
      await User.updateOne({ userId: body.userId }, body)
    } else {
      await User.create(body)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
