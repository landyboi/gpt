"use client";
import { useState, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: number;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Load previous conversations
  useEffect(() => {
    const loadConversations = async () => {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data);
    };
    loadConversations();
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    setInput("");

    // Get response from Llama
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    const assistantMessage: Message = { role: "assistant", content: data.response };
    const updatedMessages = [...newMessages, assistantMessage];
    setMessages(updatedMessages);
    setLoading(false);

    // Save conversation
    await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    });
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-xl flex-1 overflow-y-auto mb-4 border rounded p-4 bg-white shadow min-h-[400px] flex flex-col gap-2">
        {messages.length === 0 && <div className="text-gray-400">Start the conversation...</div>}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm whitespace-pre-line break-words text-sm
                ${msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-900 rounded-bl-sm"}
              `}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-400 px-4 py-2 rounded-2xl shadow-sm text-sm">Llama3 is typing...</div>
          </div>
        )}
      </div>
      <form onSubmit={sendMessage} className="w-full max-w-xl flex gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" className="bg-blue-600 text-white rounded px-4" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
} 