"use client";

import { Activity, Zap, HardDrive, Cpu } from "lucide-react";

export default function FooterStatusBar() {
  return (
    <footer className="h-9 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
      <div className="flex items-center space-x-4">
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold">
          <Cpu className="w-3 h-3 text-purple-500" /> Model: Fish Speech S2 Pro
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" /> VRAM: 2.0 / 16.0 GB
        </span>
        <span className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-blue-500" /> RAM: 8.4 / 32.0 GB
        </span>
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-500" /> CPU: 12%
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <span>Speed: 48.5 t/s</span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Health: Healthy
        </span>
      </div>
    </footer>
  );
}
