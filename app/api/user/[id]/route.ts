import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import imaya from '@/models/Driver'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();

  try {
    const user = await imaya.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    await imaya.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
