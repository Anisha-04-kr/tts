"use client";

import React from "react";

interface StatPillProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({
  label,
  value,
  subtext,
  icon,
  className = ""
}) => {
  return (
    <div className={`bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex items-center space-x-3 ${className}`}>
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block truncate">{label}</span>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono block">{value}</span>
        {subtext && <span className="text-[10px] text-slate-400 font-mono block">{subtext}</span>}
      </div>
    </div>
  );
};
