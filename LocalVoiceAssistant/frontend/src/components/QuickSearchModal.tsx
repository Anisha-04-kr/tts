"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, LayoutDashboard, MessageSquare, Mic, FileAudio, Volume2, Languages, Stethoscope, FileSpreadsheet, FileText, FileSignature, FolderClock, Cpu, Settings, ArrowRight } from "lucide-react";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: "Dashboard Overview", href: "/", category: "Navigation", icon: LayoutDashboard },
    { title: "AI Clinical Chat", href: "/chat", category: "Core", icon: MessageSquare },
    { title: "Voice Assistant Mode", href: "/voice", category: "Core", icon: Mic },
    { title: "Speech to Text Transcription", href: "/stt", category: "Clinical Tools", icon: FileAudio },
    { title: "Text to Speech Synthesis", href: "/tts", category: "Clinical Tools", icon: Volume2 },
    { title: "Medical Translation", href: "/translation", category: "Clinical Tools", icon: Languages },
    { title: "Medical Assistant & Symptoms", href: "/medical", category: "Clinical Tools", icon: Stethoscope },
    { title: "ICD-10 Diagnostic Coding", href: "/icd10", category: "Clinical Tools", icon: FileSpreadsheet },
    { title: "Clinical SOAP Notes Generator", href: "/clinical-notes", category: "Clinical Tools", icon: FileText },
    { title: "Referral Letter Generator", href: "/referral", category: "Clinical Tools", icon: FileSignature },
    { title: "Patient Encounters History", href: "/history", category: "Patient Records", icon: FolderClock },
    { title: "Local AI Models & Benchmark", href: "/models", category: "System", icon: Cpu },
    { title: "System & Audio Settings", href: "/settings", category: "System", icon: Settings },
  ];

  const filteredLinks = quickLinks.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl glass-card overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient notes, ICD-10 codes, modules... (Type to filter)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleNavigate(item.href)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition duration-150 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching modules or clinical records found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px]">ESC</kbd> to exit</span>
          <span>Offline Healthcare OS</span>
        </div>
      </div>
    </div>
  );
}
