"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Message } from '@/lib/db-utils';
import ReactMarkdown, { Components } from 'react-markdown';

interface ChatProps {
  conversationId?: number;
}

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  node?: any;
  [key: string]: any;
};

const CodeComponent = ({ node, inline, className, children, ...props }: CodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline ? (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded my-4 overflow-x-auto">
      <code className={match ? `language-${match[1]}` : ''} {...props}>
        {children}
      </code>
    </pre>
  ) : (
    <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded" {...props}>
      {children}
    </code>
  );
};

export default function Chat({ conversationId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  const fetchMessages = async (id: number) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // If this is a new conversation, redirect to the new URL
      if (!conversationId && data.conversationId) {
        router.push(`/conversations/${data.conversationId}`);
      } else {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    // Preprocess the content to handle text structure
    const processedContent = content
      // Replace all linefeed characters with newlines
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Add double newlines before numbered lists
      .replace(/([^\n])\n(\d+\.\s)/g, '$1\n\n$2')
      // Add double newlines before bullet points
      .replace(/([^\n])\n(\*\s)/g, '$1\n\n$2')
      // Split into paragraphs
      .split(/\n\n+/)
      // Process each paragraph
      .map(paragraph => {
        // Handle numbered lists
        if (/^\d+\.\s/.test(paragraph)) {
          return paragraph
            .split('\n')
            .map(line => line.trim())
            .join('\n');
        }
        // Handle bullet points
        if (/^\*\s/.test(paragraph)) {
          return paragraph
            .split('\n')
            .map(line => line.trim())
            .join('\n');
        }
        // Handle code blocks
        if (paragraph.startsWith('```')) {
          return paragraph;
        }
        // Regular paragraphs
        return paragraph.trim();
      })
      .join('\n\n');

    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-2">{children}</ol>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
            code: CodeComponent,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic">
                {children}
              </blockquote>
            ),
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isAiResponse ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.isAiResponse
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {formatMessage(message.content)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 