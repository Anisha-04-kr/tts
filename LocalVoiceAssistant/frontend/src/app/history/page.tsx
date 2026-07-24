"use client";

import React, { useState } from "react";
import { FolderClock, Search, Calendar, FileText, Music, MessageSquare, FileSpreadsheet, Download, Filter } from "lucide-react";

export default function PatientHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const encounters = [
    { id: "enc-101", patient: "Eleanor Vance", date: "2026-07-24", type: "SOAP Note", title: "Hypertension Follow-Up", format: "text", details: "Generated SOAP note and referral letter to Cardiology" },
    { id: "enc-102", patient: "Marcus Brody", date: "2026-07-23", type: "Audio Dictation", title: "ECG Reading Audio Dictation", format: "audio", details: "Whisper ASR transcription 98.4% accuracy" },
    { id: "enc-103", patient: "Sophia Martinez", date: "2026-07-22", type: "ICD-10 Coding", title: "Type-2 Diabetes & Neuropathy", format: "icd", details: "ICD-10 codes predicted: E11.9, G57.90" },
    { id: "enc-104", patient: "David Miller", date: "2026-07-20", type: "AI Chat", title: "Chest Pain Differential Chat", format: "chat", details: "Local LLM conversation transcript" },
  ];

  const filtered = encounters.filter(e =>
    (e.patient.toLowerCase().includes(searchQuery.toLowerCase()) || e.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterType === "all" || e.format === filterType)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <FolderClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Patient Encounter History & Logs
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
                Air-Gapped Archive
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Searchable clinical history log, saved voice dictations, SOAP notes, and ICD predictions</p>
          </div>
        </div>

        {/* Filter Dropdown & Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name or title..."
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-semibold"
          >
            <option value="all">All Formats</option>
            <option value="text">Notes</option>
            <option value="audio">Audio</option>
            <option value="icd">ICD-10</option>
            <option value="chat">Chat</option>
          </select>
        </div>
      </div>

      {/* Encounter Timeline List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl glass-card space-y-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Encounter Timeline Log</h2>

        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-cyan-500 transition duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  {item.format === "text" && <FileText className="w-4 h-4" />}
                  {item.format === "audio" && <Music className="w-4 h-4" />}
                  {item.format === "icd" && <FileSpreadsheet className="w-4 h-4" />}
                  {item.format === "chat" && <MessageSquare className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.patient}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                      {item.type}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{item.details}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs font-mono shrink-0">
                <span className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> {item.date}
                </span>

                <button
                  onClick={() => alert(`Downloading record for ${item.patient}`)}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
