import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.sessions.findUnique({
    where: { session_token: sessionToken },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  return {
    userId: session.user_id,
    username: session.user.username,
  };
} 