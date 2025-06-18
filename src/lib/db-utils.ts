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
  const user = await prisma.users.create({
    data: {
      username,
      password_hash: hashedPassword,
    },
  });

  return {
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
    lastLogin: user.last_login,
  };
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await prisma.users.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      password_hash: true,
      created_at: true,
      last_login: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
    lastLogin: user.last_login,
  };
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

  const user = session.user;
  return {
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
    lastLogin: user.last_login,
  };
}

// Conversation operations
export async function createConversation(userId: number, title: string = "New Conversation"): Promise<Conversation> {
  const conversation = await prisma.conversations.create({
    data: {
      user_id: userId,
      title,
    },
  });

  return {
    id: conversation.id,
    userId: conversation.user_id,
    title: conversation.title,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    messages: [],
  };
}

export async function getConversations(userId: number): Promise<Conversation[]> {
  const conversations = await prisma.conversations.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: 'desc' },
    include: {
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  return (conversations as any[]).map(conv => ({
    id: conv.id,
    userId: conv.user_id,
    title: conv.title,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
    messages: (conv.messages as any[]).map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      conversationId: msg.conversation_id,
      content: msg.content,
      createdAt: msg.created_at,
      isAiResponse: msg.is_ai_response,
    })),
  }));
}

export async function getConversation(conversationId: number): Promise<Conversation | null> {
  const conversation = await prisma.conversations.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    userId: conversation.user_id,
    title: conversation.title,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    messages: (conversation.messages as any[]).map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      conversationId: msg.conversation_id,
      content: msg.content,
      createdAt: msg.created_at,
      isAiResponse: msg.is_ai_response,
    })),
  };
}

// Message operations
export async function createMessage(
  userId: number,
  conversationId: number,
  content: string,
  isAiResponse: boolean = false
): Promise<Message> {
  const message = await prisma.messages.create({
    data: {
      user_id: userId,
      conversation_id: conversationId,
      content,
      is_ai_response: isAiResponse,
    },
  });

  return {
    id: message.id,
    userId: message.user_id,
    conversationId: message.conversation_id,
    content: message.content,
    createdAt: message.created_at,
    isAiResponse: message.is_ai_response,
  };
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const messages = await prisma.messages.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: 'asc' },
  });

  return (messages as any[]).map(msg => ({
    id: msg.id,
    userId: msg.user_id,
    conversationId: msg.conversation_id,
    content: msg.content,
    createdAt: msg.created_at,
    isAiResponse: msg.is_ai_response,
  }));
}