"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 glass-card shadow-healthcare dark:shadow-healthcare-dark transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800/80 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <h3 className={`text-sm font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <p className={`text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5 ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};
