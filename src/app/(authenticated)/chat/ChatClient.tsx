"use client";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

type Message = {
  id: number;
  content: string;
  is_ai_response: boolean;
  created_at: string;
};

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const convId = searchParams.get('conversation');
    if (convId) {
      setConversationId(parseInt(convId));
      // Load conversation messages
      fetch(`/api/conversations/${convId}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data.messages);
        })
        .catch(err => {
          console.error('Error loading conversation:', err);
        });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      id: Date.now(), // Temporary ID
      content: userMessage, 
      is_ai_response: false,
      created_at: new Date().toISOString()
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          conversationId: conversationId
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages(prev => [...prev, { 
        id: Date.now(), // Temporary ID
        content: data.response, 
        is_ai_response: true,
        created_at: new Date().toISOString()
      }]);
      
      // Update conversation ID if this was a new conversation
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        id: Date.now(), // Temporary ID
        content: 'Sorry, there was an error processing your message.', 
        is_ai_response: true,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.is_ai_response ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.is_ai_response
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 