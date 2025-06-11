import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  createdAt: Date;
  lastLogin: Date | null;
}

export interface Message {
  id: number;
  userId: number;
  conversationId: number;
  content: string;
  createdAt: Date;
  isAiResponse: boolean;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

// User operations
export async function createUser(username: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.users.create({
    data: {
      username,
      password_hash: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      created_at: true,
      last_login: true,
    },
  });
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return prisma.users.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      created_at: true,
      last_login: true,
      password_hash: true,
    },
  });
}

export async function verifyPassword(username: string, password: string): Promise<boolean> {
  const user = await prisma.users.findUnique({
    where: { username },
    select: { password_hash: true },
  });

  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password_hash);
}

// Session operations
export async function createSession(userId: number): Promise<string> {
  const sessionToken = Math.random().toString(36).substring(2);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.sessions.create({
    data: {
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt,
    },
  });

  return sessionToken;
}

export async function validateSession(sessionToken: string): Promise<User | null> {
  const session = await prisma.sessions.findUnique({
    where: { session_token: sessionToken },
    include: { user: true },
  });

  if (!session || session.expires_at < new Date()) {
    return null;
  }

  return session.user;
}

// Conversation operations
export async function createConversation(userId: number, title: string = "New Conversation"): Promise<Conversation> {
  return prisma.conversations.create({
    data: {
      user_id: userId,
      title,
    },
  });
}

export async function getConversations(userId: number): Promise<Conversation[]> {
  return prisma.conversations.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: 'desc' },
    include: {
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });
}

export async function getConversation(conversationId: number): Promise<Conversation | null> {
  return prisma.conversations.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { created_at: 'asc' },
      },
    },
  });
}

// Message operations
export async function createMessage(
  userId: number,
  conversationId: number,
  content: string,
  isAiResponse: boolean = false
): Promise<Message> {
  return prisma.messages.create({
    data: {
      user_id: userId,
      conversation_id: conversationId,
      content,
      is_ai_response: isAiResponse,
    },
  });
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  return prisma.messages.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
} 