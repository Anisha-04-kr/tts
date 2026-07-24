"use client";

import { useTheme } from "@/context/ThemeContext";
import { Search, Sun, Moon, ShieldCheck, Cpu, HardDrive, Zap, Activity, ChevronDown } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [selectedModel, setSelectedModel] = useState("qwen3.5:9b");
  const [showStatusPopover, setShowStatusPopover] = useState(false);

  const metrics = {
    model: "Qwen 3.5 9B",
    vram: "2.0 / 16.0 GB",
    ram: "8.4 / 32.0 GB",
    cpu: "12%",
    speed: "48.5 t/s",
    health: "100% Healthy"
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between glass-card sticky top-0 z-10 transition-colors duration-300">
      {/* Global Quick Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="relative w-full text-left bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition flex items-center justify-between"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <span>Search patient records, ICD codes, modules...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-500">Ctrl + K</kbd>
        </button>
      </div>

      {/* Controls & Badges */}
      <div className="flex items-center space-x-3">
        {/* Model Selector Dropdown */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
          >
            <option value="qwen3.5:9b">Qwen 3.5 9B (Local)</option>
            <option value="qwen3.5:27b">Qwen 3.5 27B (Local)</option>
            <option value="llama3-8b">Llama 3 8B (Local)</option>
            <option value="gemma4:e4b">Gemma 4B (Local)</option>
          </select>
        </div>

        {/* Compact System Metrics Popover */}
        <div className="relative">
          <button
            onClick={() => setShowStatusPopover(!showStatusPopover)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">System Metrics</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showStatusPopover && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 glass-card shadow-2xl z-50 text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">System Hardware Status</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">{metrics.health}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> VRAM:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{metrics.vram}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-purple-500" /> RAM:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{metrics.ram}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-500" /> CPU:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{metrics.cpu}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500" /> Speed:</span>
                  <span className="font-bold text-emerald-500">{metrics.speed}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Badges */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Air-Gapped
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
            HIPAA-Secure
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition duration-200"
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
}
