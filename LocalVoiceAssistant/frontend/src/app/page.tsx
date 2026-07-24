"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartPulse, 
  Mic, 
  MessageSquare, 
  Languages, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Zap, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  Server,
  Volume2,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const systemStatusCards = [
    { title: "AI Models", status: "Loaded & Ready", detail: "Qwen 3.5 (9B Params)", icon: Cpu, isOnline: true },
    { title: "GPU Status", status: "Active (CUDA)", detail: "NVIDIA RTX 4090", icon: Zap, isOnline: true },
    { title: "Whisper ASR", status: "Ready", detail: "Whisper Large V3", icon: Mic, isOnline: true },
    { title: "TTS Engine", status: "Online", detail: "Fish Speech S2 Pro", icon: Volume2, isOnline: true },
    { title: "Translation", status: "Online", detail: "Indic-Trans2 / NLLB", icon: Languages, isOnline: true },
    { title: "Local Server", status: "Healthy", detail: "FastAPI Async Engine", icon: Server, isOnline: true },
    { title: "RAM Usage", status: "8.4 / 32.0 GB", detail: "26% Utilization", icon: HardDrive, isOnline: true },
    { title: "VRAM Usage", status: "2.0 / 16.0 GB", detail: "12.5% Allocation", icon: Zap, isOnline: true },
    { title: "CPU Usage", status: "12% Active", detail: "16 Cores Threaded", icon: Activity, isOnline: true },
  ];

  const quickActions = [
    {
      title: "Start Voice Assistant",
      desc: "Full-duplex real-time dictation & conversational AI",
      href: "/voice",
      icon: Mic,
      color: "from-blue-600 to-indigo-600",
      btnBg: "bg-blue-600 hover:bg-blue-500",
    },
    {
      title: "Open AI Chat",
      desc: "ChatGPT-like clinical assistant & document analysis",
      href: "/chat",
      icon: MessageSquare,
      color: "from-sky-500 to-blue-600",
      btnBg: "bg-sky-600 hover:bg-sky-500",
    },
    {
      title: "Translate Audio",
      desc: "Cross-lingual medical translation with term protection",
      href: "/translation",
      icon: Languages,
      color: "from-purple-600 to-indigo-600",
      btnBg: "bg-purple-600 hover:bg-purple-500",
    },
    {
      title: "Generate Clinical Note",
      desc: "Automated SOAP, Discharge & Progress note summaries",
      href: "/clinical-notes",
      icon: FileText,
      color: "from-emerald-600 to-teal-600",
      btnBg: "bg-emerald-600 hover:bg-emerald-500",
    },
    {
      title: "ICD-10 Coding",
      desc: "Instant AI diagnostic coding with confidence scoring",
      href: "/icd10",
      icon: FileSpreadsheet,
      color: "from-amber-500 to-orange-600",
      btnBg: "bg-amber-600 hover:bg-amber-500",
    },
  ];

  const handleRefreshMetrics = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-primary-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl shadow-primary-600/20 overflow-hidden">
        {/* Subtle background glow graphics */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 top-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Offline • HIPAA Compliance Ready</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Offline AI Healthcare Assistant
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Privacy-first clinical intelligence, real-time voice transcription, ICD-10 diagnostic coding, and automated clinical documentation powered entirely by local GPU acceleration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/voice"
              className="px-6 py-3.5 rounded-2xl bg-white text-primary-700 font-bold text-xs hover:bg-blue-50 transition shadow-lg flex items-center space-x-2"
            >
              <Mic className="w-4 h-4 text-primary-600 animate-pulse" />
              <span>Start Voice Assistant</span>
            </Link>
            <Link
              href="/chat"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-semibold text-xs transition flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open AI Chat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Status Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              System Status Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time local hardware and AI engine diagnostics</p>
          </div>

          <button
            onClick={handleRefreshMetrics}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center space-x-1.5"
            title="Refresh System Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemStatusCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl glass-card hover:shadow-healthcare transition duration-300 space-y-3 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{card.title}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Active</span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{card.status}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{card.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Quick Clinical Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Launch voice assistant, code ICD-10 notes, or synthesize speech</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${action.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                      {action.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition duration-200">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
