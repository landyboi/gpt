import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const user = await prisma.users.findUnique({
    where: { username },
    select: { password_hash: true },
  });
  if (!user) return false;
  return bcrypt.compare(password, user.password_hash);
} 