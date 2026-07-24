"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Copy, 
  Check, 
  RefreshCw, 
  Search, 
  Sparkles,
  Mic,
  Square,
  Download,
  Pin,
  Plus,
  FileCode,
  ShieldAlert
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachmentName?: string;
  attachmentType?: "pdf" | "image" | "audio";
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isPinned?: boolean;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "conv-1", title: "Hypertension Patient Consult", lastMessage: "Recommend ACE inhibitors check...", timestamp: "10:30 AM", isPinned: true },
    { id: "conv-2", title: "ECG Analysis Dictation", lastMessage: "Sinus rhythm with normal PR...", timestamp: "Yesterday", isPinned: false },
    { id: "conv-3", title: "Diabetes SOAP Note Review", lastMessage: "HbA1c level 7.2% monitored...", timestamp: "Jul 22", isPinned: false },
  ]);
  const [activeConvId, setActiveConvId] = useState("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        content: "Hello! I am your local AI Healthcare & Clinical Assistant. You can chat with me, upload medical documents (PDFs, Images, Audio dictations), or ask clinical questions 100% offline.\n\n### Clinical Disclaimer\nAll analyses are produced locally for healthcare professional support.",
        timestamp: "10:00 AM"
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (mounted) scrollToBottom();
  }, [messages, isLoading, mounted]);

  const sendMessage = async (promptText?: string) => {
    const textToSend = promptText || input.trim();
    if (!textToSend || isLoading) return;

    if (!promptText) setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/llm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.text || "Clinical response generated locally.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Local LLM engine is unreachable or initializing.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error connecting to local backend API.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadResponse = (content: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinical_response_${Date.now()}.md`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: "pdf" | "image" | "audio" = "pdf";
    if (file.type.includes("image")) type = "image";
    if (file.type.includes("audio")) type = "audio";

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Uploaded medical document: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentName: file.name,
      attachmentType: type
    };

    setMessages(prev => [...prev, userMsg]);
    sendMessage(`Analyze the uploaded ${type} document: ${file.name}`);
  };

  const togglePin = (convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isPinned: !c.isPinned } : c));
  };

  if (!mounted) return null;

  const filteredConversations = conversations.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-6.5rem)] gap-4">
      {/* Left Conversations Sidebar Panel */}
      <div className="w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl glass-card flex flex-col shrink-0 shadow-sm overflow-hidden hidden md:flex">
        {/* Top Actions */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={() => setMessages([{ id: Date.now().toString(), role: "assistant", content: "New conversation initialized.", timestamp: "Now" }])}
            className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-md shadow-primary-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Encounter Chat</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-primary-600"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`p-3 rounded-xl cursor-pointer text-xs transition duration-200 flex items-center justify-between group ${
                activeConvId === conv.id
                  ? "bg-primary-600/10 text-primary-600 dark:text-primary-400 font-semibold border border-primary-600/20"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="space-y-0.5 truncate flex-1 pr-2">
                <div className="flex items-center space-x-1.5">
                  {conv.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                  <span className="truncate">{conv.title}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{conv.lastMessage}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); togglePin(conv.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-500 transition"
              >
                <Pin className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl glass-card shadow-sm overflow-hidden">
        {/* Chat Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">Healthcare AI Chat Studio</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Clinical LLM Model Pipeline: Text / Document Input → BPE Tokenizer & System Prompt → Qwen 3.5 / Llama 3 LLM (Local VRAM) → Formatted Markdown Report</p>
            </div>


          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMessages([{ id: Date.now().toString(), role: "assistant", content: "Chat cleared.", timestamp: "Now" }])}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition text-xs flex items-center space-x-1"
              title="Clear Chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-md ${
                msg.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`group relative max-w-[80%] rounded-2xl p-4 shadow-sm border text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary-600 border-primary-500 text-white rounded-tr-none"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
              }`}>
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800 text-[10px] opacity-75">
                  <span className="font-semibold">{msg.role === "user" ? "You" : "Medical AI Assistant"}</span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                {msg.attachmentName && (
                  <div className="mb-3 p-2 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center space-x-2 text-xs text-primary-600 dark:text-primary-400">
                    {msg.attachmentType === "pdf" && <FileText className="w-4 h-4" />}
                    {msg.attachmentType === "image" && <ImageIcon className="w-4 h-4" />}
                    {msg.attachmentType === "audio" && <Music className="w-4 h-4" />}
                    <span className="font-mono font-semibold">{msg.attachmentName}</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.role === "assistant" && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <button
                      onClick={() => sendMessage("Regenerate clinical response for previous prompt.")}
                      className="p-1 hover:text-primary-600 transition flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:text-primary-600 transition"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDownloadResponse(msg.content)}
                        className="p-1 hover:text-primary-600 transition"
                        title="Download Markdown Report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-spin" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl rounded-tl-none p-4 text-xs font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></span>
                <span>Reasoning locally via Qwen 3.5...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf,audio/*"
            className="hidden"
          />

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
              title="Upload PDF, Image or Audio file"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your local medical assistant or upload a document..."
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary-600 transition"
            />

            {isLoading ? (
              <button
                type="button"
                onClick={() => setIsLoading(false)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition flex items-center space-x-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition flex items-center space-x-2 shadow-md shadow-primary-600/30"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
