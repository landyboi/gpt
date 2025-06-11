import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/db-utils';
import Chat from '@/components/Chat';

export default async function NewChatPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    redirect('/login');
  }

  const user = await validateSession(session.value);
  if (!user) {
    redirect('/login');
  }

  return <Chat />;
} 