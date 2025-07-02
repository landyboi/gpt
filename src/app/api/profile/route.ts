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
      last_login: user.lastLogin ? (user.lastLogin instanceof Date ? user.lastLogin.toISOString() : user.lastLogin) : null,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { action, oldPassword, newPassword } = body;

    if (action === 'changePassword') {
      if (!oldPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Old password and new password are required' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      const { changePassword } = await import('@/lib/db-utils');
      const success = await changePassword(user.id, oldPassword, newPassword);

      if (!success) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}