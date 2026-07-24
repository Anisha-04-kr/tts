"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  FileAudio, 
  Volume2, 
  Languages, 
  Stethoscope, 
  FileSpreadsheet, 
  FileText, 
  FileSignature, 
  FolderClock, 
  Cpu, 
  Settings, 
  Terminal,
  ShieldCheck,
  HeartPulse,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationGroups = [
    {
      group: "Core",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "AI Chat", href: "/chat", icon: MessageSquare },
        { name: "Voice Assistant", href: "/voice", icon: Mic },
      ]
    },
    {
      group: "Clinical Tools",
      items: [
        { name: "Speech to Text", href: "/stt", icon: FileAudio },
        { name: "Text to Speech", href: "/tts", icon: Volume2 },
        { name: "Translation", href: "/translation", icon: Languages },
        { name: "Medical Assistant", href: "/medical", icon: Stethoscope },
        { name: "ICD-10 Coding", href: "/icd10", icon: FileSpreadsheet },
        { name: "Clinical Notes", href: "/clinical-notes", icon: FileText },
        { name: "Referral Letter", href: "/referral", icon: FileSignature },
        { name: "Patient History", href: "/history", icon: FolderClock },
      ]
    },
    {
      group: "System",
      items: [
        { name: "Models", href: "/models", icon: Cpu },
        { name: "Settings", href: "/settings", icon: Settings },
        { name: "Logs", href: "/logs", icon: Terminal },
      ]
    }
  ];

  return (
    <aside className={`${isCollapsed ? "w-16" : "w-64"} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 glass-card z-20 transition-all duration-300 relative`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition z-30"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-600/30 group-hover:scale-105 transition shrink-0">
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight group-hover:text-primary-600 transition">Healthcare AI</h1>
              <p className="text-[10px] text-slate-400 font-mono">100% Offline SaaS</p>
            </div>
          )}
        </Link>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition duration-200 group ${
                    isActive
                      ? "bg-primary-600 text-white shadow-sm shadow-primary-600/30 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-primary-600"}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Security Footer Badge */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className={`bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 flex items-center ${isCollapsed ? "justify-center" : "justify-between"} text-[11px]`}>
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          {!isCollapsed && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              HIPAA SECURE
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
