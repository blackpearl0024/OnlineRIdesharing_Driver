import  auth  from '@clerk/nextjs';
import  NextResponse  from 'next/server';
import  clerkClient  from '@clerk/nextjs';

export async function POST(req: Request) {
  const { userId } = auth();
  const { role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
  }

  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
