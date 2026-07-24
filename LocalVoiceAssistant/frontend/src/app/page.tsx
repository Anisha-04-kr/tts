"use client";

import { useState, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your 100% local AI voice assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("Online");

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Local LLM engine is offline or unreachable." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to local backend API." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared. Ready for new questions." }]);
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4">
      {/* Top Controls Header */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-lg border border-gray-800 mb-4 shadow">
        <div>
          <h1 className="text-xl font-bold text-white">Interactive Local Chat</h1>
          <p className="text-xs text-gray-400">Powered by Local LM Studio / vLLM + Fish Speech S2 Pro</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={clearChat} className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700">
            Clear Chat
          </button>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/80 text-green-300">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
            {status}
          </span>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 bg-surface rounded-lg border border-gray-800 p-4 overflow-y-auto space-y-4 min-h-[400px] max-h-[600px] shadow-inner">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-lg p-3 text-sm shadow ${
              msg.role === "user" 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-cardBg text-gray-200 border border-gray-700 rounded-bl-none"
            }`}>
              <div className="font-semibold text-xs mb-1 opacity-70">
                {msg.role === "user" ? "You" : "Local Assistant"}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-cardBg border border-gray-700 text-gray-400 rounded-lg p-3 text-sm animate-pulse">
              Reasoning locally...
            </div>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }} 
        className="mt-4 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your local assistant anything..."
          className="flex-1 bg-surface border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 shadow"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-6 py-3 rounded-lg text-sm transition shadow disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
