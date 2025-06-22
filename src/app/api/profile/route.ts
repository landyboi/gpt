import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/db-utils';

export async function GET() {
  try {
    // Get session from cookie
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session and get user
    const user = await validateSession(session.value);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Return user profile without sensitive data
    return NextResponse.json({
      id: user.id,
      username: user.username,
      created_at: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      last_login: user.lastLogin instanceof Date && user.lastLogin !== null ? user.lastLogin.toISOString() : user.lastLogin,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 