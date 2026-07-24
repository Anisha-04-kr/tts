"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FooterStatusBar from "@/components/FooterStatusBar";
import QuickSearchModal from "@/components/QuickSearchModal";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("open-quick-search", handleOpenSearch);
    return () => window.removeEventListener("open-quick-search", handleOpenSearch);
  }, []);

  return (
    <div className="flex w-full min-h-screen overflow-hidden">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <Header onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50">
          {children}
        </main>

        {/* Sticky Footer Hardware Status Bar */}
        <FooterStatusBar />
      </div>

      {/* Global Quick Search Modal (Ctrl + K) */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
