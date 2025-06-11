import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cookies } from 'next/headers';
import { validateSession, getConversations } from '@/lib/db-utils';

const prisma = new PrismaClient();

// GET /api/conversations - Get all conversations for a user
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

    // Get conversations for the user
    const conversations = await getConversations(user.id);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Save a new conversation
export async function POST(req: NextRequest) {
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

    const { title } = await req.json();
    const conversation = await prisma.conversations.create({
      data: {
        user_id: user.id,
        title: title || 'New Conversation',
      },
    });
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 