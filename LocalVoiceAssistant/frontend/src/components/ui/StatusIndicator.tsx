"use client";

import React from "react";

interface StatusIndicatorProps {
  status: "online" | "unready" | "offline" | "recording";
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className = ""
}) => {
  const colors = {
    online: "bg-emerald-500",
    unready: "bg-amber-500",
    offline: "bg-red-500",
    recording: "bg-red-600 animate-ping"
  };

  const labels = {
    online: "Online",
    unready: "Initializing",
    offline: "Offline",
    recording: "Recording Live Audio..."
  };

  return (
    <div className={`inline-flex items-center space-x-2 text-xs font-mono ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {status === "online" || status === "recording" ? (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[status]}`}></span>
        ) : null}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[status]}`}></span>
      </span>
      <span className="font-semibold text-slate-700 dark:text-slate-300">
        {label || labels[status]}
      </span>
    </div>
  );
};
