import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get conversation ID from URL
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const conversationId = parseInt(id);
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID' },
        { status: 400 }
      );
    }

    // Get conversation with messages
    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 