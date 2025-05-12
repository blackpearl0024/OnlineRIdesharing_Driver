import { NextResponse } from 'next/server'
import connectMongodb from '@/lib/mongodb'
import imaya from '@/models/Driver'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const clerkId = searchParams.get('clerkId')

    if (!clerkId) {
      return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 })
    }

    await connectMongodb()
    const user = await imaya.findOne({ clerkId })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
