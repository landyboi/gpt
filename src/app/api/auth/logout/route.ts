import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (session) {
      // Delete the session from the database
      await prisma.sessions.delete({
        where: { session_token: session.value },
      });

      // Delete the session cookie
      cookieStore.delete('session');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 