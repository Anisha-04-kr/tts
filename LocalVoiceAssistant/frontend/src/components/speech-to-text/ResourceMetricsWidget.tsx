"use client";

import React from "react";
import { Cpu, HardDrive, Zap, Activity } from "lucide-react";

interface ResourceMetricsWidgetProps {
  vramUsed: number;
  vramTotal: number;
  ramUsed: number;
  ramTotal: number;
  cpuPercent: number;
  tokensPerSec: number;
  healthStatus: "online" | "unready" | "offline";
}

export const ResourceMetricsWidget: React.FC<ResourceMetricsWidgetProps> = ({
  vramUsed = 2.0,
  vramTotal = 16.0,
  ramUsed = 8.4,
  ramTotal = 32.0,
  cpuPercent = 12,
  tokensPerSec = 48.5,
  healthStatus = "online"
}) => {
  const vramPercent = Math.round((vramUsed / vramTotal) * 100);
  const ramPercent = Math.round((ramUsed / ramTotal) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-5 shadow-healthcare dark:shadow-healthcare-dark font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary-600" /> System Hardware Resource Panel
        </h2>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 capitalize">{healthStatus}</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* VRAM Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> VRAM Usage:</span>
            <span className="font-bold">{vramUsed} / {vramTotal} GB ({vramPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${vramPercent}%` }}></div>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-purple-500" /> System RAM:</span>
            <span className="font-bold">{ramUsed} / {ramTotal} GB ({ramPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${ramPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stat Tiles Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">CPU Utilization</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cpuPercent}%</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase">Inference Speed</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{tokensPerSec} t/s</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
