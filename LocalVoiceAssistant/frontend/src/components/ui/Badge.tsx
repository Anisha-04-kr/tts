"use client";

import React from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "primary";
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
  icon
}) => {
  const variants = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    primary: "bg-primary-600/10 text-primary-600 dark:text-primary-400 border-primary-600/20"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border font-mono ${variants[variant]} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
