import { NextResponse } from 'next/server'

export async function GET() {
  console.log("✅ GET /api/history reached")

  return NextResponse.json({ message: 'API connected successfully' })
}
