import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, getConversation } from '@/lib/db-utils';
import Chat from '@/components/Chat';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    redirect('/login');
  }

  const user = await validateSession(session.value);
  if (!user) {
    redirect('/login');
  }

  const conversationId = parseInt(params.id);
  if (isNaN(conversationId)) {
    redirect('/conversations');
  }

  const conversation = await getConversation(conversationId);
  if (!conversation) {
    redirect('/conversations');
  }

  // Check if user owns the conversation
  if (conversation.userId !== user.id) {
    redirect('/conversations');
  }

  return <Chat conversationId={conversation.id} />;
}