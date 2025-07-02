"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only format dates after component is mounted to avoid hydration issues
  const formatDate = (isoString: string) => {
    if (!mounted) return 'Loading...';
    
    if (!isoString || typeof isoString !== 'string') {
      return 'No date';
    }
    
    try {
      const date = new Date(isoString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Use simple format
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Format error';
    }
  };

  if (loading) return <div>Loading conversations...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <Link
          href="/chat"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Chat
        </Link>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No conversations yet</p>
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/chat?conversation=${conversation.id}`}
              className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:opacity-80"
            >
              <h2 className="text-lg font-semibold">{conversation.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {formatDate(conversation.createdAt)}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
} 