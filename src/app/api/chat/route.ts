import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { validateSession, createMessage, createConversation, getConversation } from '@/lib/db-utils';

const LLAMA_API_URL = process.env.LLAMA_API_URL || 'http://llama:11434';
const LLAMA_MODEL = process.env.LLAMA_MODEL || 'llama3';

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

    const body = await req.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await getConversation(conversationId);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
    } else {
      // Create new conversation with first message as title
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      conversation = await createConversation(user.id, title);
    }

    // Save user message
    await createMessage(user.id, conversation.id, message, false);

    const llamaRes = await fetch(`${LLAMA_API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LLAMA_MODEL,
        prompt: message,
        stream: false
      }),
    });

    if (!llamaRes.ok) {
      const errorText = await llamaRes.text();
      console.error('Llama API error:', {
        status: llamaRes.status,
        statusText: llamaRes.statusText,
        error: errorText,
        url: `${LLAMA_API_URL}/api/generate`,
        model: LLAMA_MODEL
      });
      throw new Error(`Llama API error: ${llamaRes.status} ${llamaRes.statusText}`);
    }

    const data = await llamaRes.json();

    // Save AI response
    await createMessage(user.id, conversation.id, data.response, true);

    return NextResponse.json({ 
      response: data.response,
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message. Please check if the Llama API server is running and the model is available.' },
      { status: 500 }
    );
  }
} 